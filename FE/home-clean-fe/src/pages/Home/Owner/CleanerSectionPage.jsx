import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../../../context/WebSocketContext";
import axios from "axios";
import CleanerCard from "../../../components/Home/Owner/CleanerCard";
import { BASE_URL } from "../../../utils/config";
import {
  List,
  Typography,
  Skeleton,
  Result,
  Button,
  Pagination,
  ConfigProvider,
  Row,
  Col,
  Layout,
  Badge,
  Card,
  Space,
  Alert,
  Empty,
  Input,
  Select,
  Tag,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Option } = Select;

function CleanersPage() {
  const [cleaners, setCleaners] = useState([]);
  const [onlineCleanerIds, setOnlineCleanerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSub, setIsSub] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Responsive design
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  const isLaptop = useMediaQuery({ minWidth: 992, maxWidth: 1199 });

  // Update page size based on screen size
  useEffect(() => {
    const newPageSize = isMobile ? 4 : isTablet ? 6 : 8;
    setPageSize(newPageSize);
  }, [isMobile, isTablet, isLaptop]);

  const client = useContext(WebSocketContext);

  const fetchAllCleanersNearby = async () => {
    try {
      const customerId = sessionStorage.getItem("customerId");
      setLoading(true);
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/services/${customerId}/nearby`);

      setCleaners(res.data);

      // After setting cleaners from nearby, update online status
      fetchOnlineStatus();
    } catch (error) {
      console.error("❌ Lỗi khi fetch cleaners:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/customer/cleaners/online`);
      const ids = res.data.map((cleaner) => cleaner.cleanerId);
      setOnlineCleanerIds(ids);
    } catch (error) {
      console.error("❌ Lỗi khi fetch trạng thái online:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchAllCleanersNearby();
  }, []);

  // Fix for CleanerSection.jsx
  useEffect(() => {
    if (!client || isSub) return;

    const trySub = () => {
      console.log("connect");

      // Make sure we're getting valid subscription objects
      let subscriptions = [];

      try {
        // Subscribe to online cleaners
        const onlineSub = client.subscribe(
          "/topic/onlineCleaners",
          (message) => {
            try {
              const cleanerId = JSON.parse(message.body);
              console.log("🚀 ~ subscription ~ message.body:", message.body);
              setCleaners((prev) => {
                if (prev.some((cleaner) => cleaner.cleanerId === cleanerId)) {
                  return prev;
                }
                return [...prev, cleanerId];
              });

              // Update online cleaner IDs
              setOnlineCleanerIds((prev) => {
                if (prev.includes(cleanerId)) {
                  return prev;
                }
                return [...prev, cleanerId];
              });
            } catch (error) {
              console.error("❌ Error processing online cleaner:", error);
            }
          }
        );
        subscriptions.push(onlineSub);

        // Subscribe to offline cleaners
        const offlineSub = client.subscribe(
          "/topic/offlineCleaners",
          (message) => {
            try {
              const cleanerId = JSON.parse(message.body);
              console.log("🚀 ~ subscription ~ offline message:", message.body);

              // Remove cleaner from online list
              setOnlineCleanerIds((prev) =>
                prev.filter((id) => id !== cleanerId)
              );
            } catch (error) {
              console.error("❌ Error processing offline cleaner:", error);
            }
          }
        );
        subscriptions.push(offlineSub);

        setIsSub(true);
      } catch (error) {
        console.error("Failed to subscribe:", error);
      }

      // Return cleanup function
      return () => {
        subscriptions.forEach((sub) => {
          if (sub && typeof sub.unsubscribe === "function") {
            try {
              sub.unsubscribe();
            } catch (err) {
              console.error("Error unsubscribing:", err);
            }
          }
        });
      };
    };

    if (client.connected) {
      const cleanup = trySub();
      return cleanup; // Return the cleanup function directly
    } else {
      // Store the original onConnect if it exists
      const originalOnConnect = client.onConnect;

      client.onConnect = () => {
        // Call original onConnect if it exists
        if (originalOnConnect) originalOnConnect();

        const cleanup = trySub();
        client.cleanupSub = cleanup; // Store cleanup function
      };

      return () => {
        // Restore original onConnect
        client.onConnect = originalOnConnect;

        // Call cleanup if it exists
        if (client.cleanupSub && typeof client.cleanupSub === "function") {
          client.cleanupSub();
        }
      };
    }
  }, [client]);

  const isOnline = (cleanerId) => onlineCleanerIds.includes(cleanerId);

  const refreshData = () => {
    fetchAllCleanersNearby();
  };

  const onlineCount = cleaners.filter((cleaner) =>
    isOnline(cleaner.cleanerId)
  ).length;

  // Filter, search and sort functions
  const filterCleaners = (data) => {
    // First, apply search filter
    let filtered = data;
    if (searchText) {
      filtered = filtered.filter(
        (cleaner) =>
          cleaner.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          cleaner.fullName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Then, apply online/offline filter
    if (filterStatus === "online") {
      filtered = filtered.filter((cleaner) => isOnline(cleaner.id));
    } else if (filterStatus === "offline") {
      filtered = filtered.filter((cleaner) => !isOnline(cleaner.id));
    }

    // Finally, sort the results
    if (sortOption === "nameAsc") {
      filtered = [...filtered].sort((a, b) =>
        (a.name || a.fullName || "").localeCompare(b.name || b.fullName || "")
      );
    } else if (sortOption === "nameDesc") {
      filtered = [...filtered].sort((a, b) =>
        (b.name || b.fullName || "").localeCompare(a.name || a.fullName || "")
      );
    }
    // Add more sorting options if needed

    return filtered;
  };

  const filteredCleaners = filterCleaners(cleaners);

  // Update total pages whenever filtered data or page size changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredCleaners.length / pageSize));
    // Reset to page 1 if current page is now invalid
    if (currentPage > Math.ceil(filteredCleaners.length / pageSize)) {
      setCurrentPage(1);
    }
  }, [filteredCleaners, pageSize]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCleaners.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle page size change
  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to page 1 when changing page size
  };

  // Navigation to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Navigation to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Custom pagination item renderer
  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return (
        <Button
          icon={<LeftOutlined />}
          disabled={currentPage === 1}
          type="text"
        >
          Trước
        </Button>
      );
    }
    if (type === "next") {
      return (
        <Button
          icon={<RightOutlined />}
          disabled={currentPage === totalPages}
          type="text"
        >
          Sau
        </Button>
      );
    }
    return originalElement;
  };

  // Pagination display info
  const paginationInfo = () => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredCleaners.length);
    return `Hiển thị ${startItem}-${endItem} trong số ${filteredCleaners.length} cleaner`;
  };

  return (
    <Layout
      style={{
        minHeight: "700px",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        background: "none ",
      }}
    >
      <Content style={{ padding: isMobile ? "12px" : "24px" }}>
        <Header
          style={{
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "0 24px",
            marginBottom: "24px",
            borderRadius: "8px",
          }}
        >
          <Row
            align="middle"
            justify="space-between"
            style={{ height: "100%" }}
          >
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Danh sách Cleaner gần bạn
              </Title>
            </Col>
            {onlineCount > 0 && !isMobile && (
              <Col>
                <Badge
                  count={onlineCount}
                  style={{ backgroundColor: "#52c41a" }}
                >
                  <Tag icon={<TeamOutlined />} color="success">
                    Người online
                  </Tag>
                </Badge>
              </Col>
            )}
          </Row>
        </Header>
        {/* Filters and search */}
        <Card
          style={{ marginBottom: 24, borderRadius: 8 }}
          styles={{ body: { padding: isMobile ? 12 : 24 } }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên"
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                size={isMobile ? "middle" : "large"}
              />
            </Col>
            {/* <Col xs={12} md={5}>
              <Select
                style={{ width: "100%" }}
                placeholder="Trạng thái"
                onChange={handleFilterChange}
                defaultValue="all"
                size={isMobile ? "middle" : "large"}
              >
                <Option value="all">Tất cả</Option>
                <Option value="online">
                  <Badge status="success" text="Online" />
                </Option>
                <Option value="offline">
                  <Badge status="default" text="Offline" />
                </Option>
              </Select>
            </Col> */}
            {/* <Col xs={12} md={5}>
              <Select
                style={{ width: "100%" }}
                placeholder="Sắp xếp"
                onChange={handleSortChange}
                defaultValue="newest"
                size={isMobile ? "middle" : "large"}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="nameAsc">Tên (A-Z)</Option>
                <Option value="nameDesc">Tên (Z-A)</Option>
              </Select>
            </Col> */}
            <Col xs={24} md={16} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={refreshing ? <LoadingOutlined /> : <ReloadOutlined />}
                onClick={refreshData}
                loading={loading && !refreshing}
                size={isMobile ? "middle" : "large"}
                block={isMobile}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Results count */}
        {!loading && (
          <div style={{ marginBottom: 16 }}>
            <Space size="middle">
              <Text>Tìm thấy {filteredCleaners.length} cleaner</Text>
              {onlineCount > 0 && isMobile && (
                <Badge
                  count={onlineCount}
                  style={{ backgroundColor: "#52c41a" }}
                >
                  <Tag icon={<TeamOutlined />} color="success">
                    Online
                  </Tag>
                </Badge>
              )}
            </Space>
          </div>
        )}

        {/* Cleaner list */}
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Card>
        ) : filteredCleaners.length > 0 ? (
          <>
            {/* Top pagination for better UX */}
            {filteredCleaners.length > pageSize && !isMobile && (
              <Card
                style={{ marginBottom: 16, borderRadius: 8 }}
                bodyStyle={{ padding: "12px 24px" }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text>{paginationInfo()}</Text>
                  </Col>
                  <Col>
                    <ConfigProvider>
                      <Pagination
                        size="small"
                        simple
                        current={currentPage}
                        total={filteredCleaners.length}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                      />
                    </ConfigProvider>
                  </Col>
                </Row>
              </Card>
            )}

            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 4,
                xxl: 4,
              }}
              dataSource={getCurrentPageData()}
              renderItem={(cleaner) => (
                <List.Item>
                  <CleanerCard
                    cleanerId={cleaner.id}
                    cleanerImg={cleaner.profileImage}
                    cleanerName={cleaner.fullName}
                    cleanerDistance={cleaner.distance}
                    cleanerPhone={cleaner.phoneNumber}
                    isOnline={isOnline(cleaner.id)}
                  />
                </List.Item>
              )}
            />

            {/* Bottom pagination controls */}
            {filteredCleaners.length > pageSize && (
              <Card
                style={{ marginTop: 24, borderRadius: 8 }}
                bodyStyle={{ padding: isMobile ? "12px" : "16px 24px" }}
              >
                <Row
                  justify="space-between"
                  align="middle"
                  gutter={[16, 16]}
                  wrap={isMobile}
                >
                  <Col xs={24} sm={8}>
                    <Text>{paginationInfo()}</Text>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <ConfigProvider>
                      <Pagination
                        current={currentPage}
                        total={filteredCleaners.length}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={!isMobile}
                        pageSizeOptions={[4, 8, 12, 16]}
                        onShowSizeChange={handlePageSizeChange}
                        showQuickJumper={!isMobile}
                        size={isMobile ? "small" : "default"}
                        itemRender={itemRender}
                      />
                    </ConfigProvider>
                  </Col>
                  <Col
                    xs={24}
                    sm={8}
                    style={{ textAlign: isMobile ? "center" : "right" }}
                  >
                    <Space>
                      <Button
                        icon={<LeftOutlined />}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        size={isMobile ? "small" : "middle"}
                      >
                        Trang trước
                      </Button>
                      <Button
                        icon={<RightOutlined />}
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        size={isMobile ? "small" : "middle"}
                      >
                        Trang sau
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}
          </>
        ) : searchText || filterStatus !== "all" ? (
          <Empty
            description={
              <span>
                Không tìm thấy cleaner nào phù hợp với bộ lọc.{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchText("");
                    setFilterStatus("all");
                  }}
                >
                  Xóa bộ lọc
                </a>
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Result
            status="info"
            title="Không tìm thấy cleaner nào"
            subTitle="Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn."
            extra={
              <Button type="primary" size="large" onClick={refreshData}>
                Thử lại
              </Button>
            }
          />
        )}
      </Content>
    </Layout>
  );
}

export default CleanersPage;
