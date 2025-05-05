import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../../../context/WebSocketContext";
import axios from "axios";
import CleanerCard from "./CleanerCard";
import { BASE_URL } from "../../../utils/config";
import {
  List,
  Typography,
  Divider,
  Skeleton,
  Result,
  Button,
  Space,
  Pagination,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import { ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

function CleanerSection() {
  const [cleaners, setCleaners] = useState([]);
  const [onlineCleanerIds, setOnlineCleanerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSub, setIsSub] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive pageSize based on screen width
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  const isLaptop = useMediaQuery({ minWidth: 992, maxWidth: 1199 });

  // Adjust page size based on screen size
  const pageSize = isMobile ? 4 : isTablet ? 6 : 8;

  const client = useContext(WebSocketContext);

  const fetchAllCleaners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/customer/cleaners/online`);

      setCleaners(res.data);
      const ids = res.data.map((cleaner) => cleaner.cleanerId);
      setOnlineCleanerIds(ids);
    } catch (error) {
      console.error("❌ Lỗi khi fetch cleaners:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchAllCleaners();
  }, []);

  // useEffect(() => {
  //   console.log("🚀 ~ CleanersSection ~ cleaners:", cleaners);
  // }, [cleaners]);

  const onlineCount = cleaners.filter((cleaner) =>
    isOnline(cleaner.cleanerId)
  ).length;

  // Tính toán dữ liệu cho trang hiện tại
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return cleaners.slice(startIndex, endIndex);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="service-section">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ marginBottom: "20px" }}
      >
        <Col xs={24} sm={16}>
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <h2
              className="section-title"
              style={{ marginRight: "8px", marginBottom: isMobile ? "8px" : 0 }}
            >
              Danh sách người giúp việc đang hoạt động
            </h2>
            {onlineCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "#52c41a",
                  backgroundColor: "rgba(82, 196, 26, 0.1)",
                  borderRadius: "12px",
                  padding: "2px 10px",
                }}
              >
                <TeamOutlined style={{ marginRight: "4px" }} />
                {onlineCount} người online
              </span>
            )}
          </div>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: isMobile ? "left" : "right" }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAllCleaners}
            loading={loading}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : cleaners.length > 0 ? (
        <>
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
                  cleanerId={cleaner.cleanerId}
                  cleanerImg={cleaner.profile_image}
                  cleanerName={cleaner.name}
                  cleanerPhone={cleaner.phoneNumber}
                  isOnline={isOnline(cleaner.cleanerId)}
                />
              </List.Item>
            )}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "24px 0",
            }}
          >
            <ConfigProvider>
              <Pagination
                current={currentPage}
                total={cleaners.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={!isMobile}
                size={isMobile ? "small" : "default"}
              />
            </ConfigProvider>
          </div>
        </>
      ) : (
        <Result
          status="info"
          title="Không tìm thấy cleaner nào"
          subTitle="Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn."
          extra={
            <Button type="primary" onClick={fetchAllCleaners}>
              Thử lại
            </Button>
          }
        />
      )}
    </section>
  );
}

export default CleanerSection;
