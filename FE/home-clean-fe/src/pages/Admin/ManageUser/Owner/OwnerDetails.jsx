import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Avatar,
  Divider,
  Badge,
  message,
  Row,
  Col,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../../utils/config";
import OwnerTabs from "../../../../components/Admin/owner/OwnerTabs";

const { Content } = Layout;
const { Title } = Typography;

const OwnerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createJobHistory, setCreateJobHistory] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 992) {
        setCollapsed(false);
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine responsive settings based on window width
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Create a fetchOwnerData function that can be called for refresh
  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      // Fetch owner details
      const response = await axios.get(
        `${BASE_URL}/admin/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setOwnerData(response.data);

      // Fetch job creation history
      const createJobHistoryResponse = await axios.get(
        `${BASE_URL}/admin/customers/historycreatejob/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setCreateJobHistory(createJobHistoryResponse.data);

      // Fetch booking history
      try {
        const bookingHistoryResponse = await axios.get(
          `${BASE_URL}/admin/customers/historybookjob/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          }
        );

        setBookingHistory(bookingHistoryResponse.data);
      } catch (bookingError) {
        console.error("Error fetching booking history:", bookingError);
        message.error("Không thể tải dữ liệu lịch sử đặt việc");
        setBookingHistory([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [customerId]);

  // Initial data fetch
  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  const goBack = () => {
    navigate("/admin/owners");
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc chắn muốn xoá người dùng này không?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await fetch(
            `${BASE_URL}/admin/customers/${customerId}/delete`,
            {
              method: "DELETE",
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete user");
          }

          message.success("Xoá người dùng thành công");
          navigate("/admin/owners");
        } catch (error) {
          message.error("Không thể xoá người dùng. Vui lòng thử lại sau.");
        }
      },
    });
  };

  // Cập nhật lại margin cho layout
  const sidebarWidth = collapsed ? 80 : windowWidth < 1200 ? 180 : 220;

  const contentStyle = {
    margin: isMobile ? "8px 8px 8px 4px" : isTablet ? "16px 8px" : "24px 16px",
    padding: isMobile ? 8 : isTablet ? 16 : 24,
    background: "#fff",
    minHeight: 280,
    transition: "all 0.2s",
  };

  const layoutStyle = {
    marginLeft: isMobile ? "60px" : `${sidebarWidth}px`,
    transition: "all 0.2s",
  };

  if (loading && !ownerData) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AppSidebar />
        <Layout style={layoutStyle}>
          <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
          <Content style={contentStyle}>
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <p>Đang tải dữ liệu...</p>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={layoutStyle}>
        <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
        <Content style={contentStyle}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} scroll={{ x: "max-content" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                  {!isMobile && "Quay lại"}
                </Button>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  Chi tiết Owner
                </Title>
              </div>
            </Col>
          </Row>

          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "center" : "flex-start",
                gap: "16px",
                marginBottom: 24,
              }}
            >
              <Avatar size={isMobile ? 64 : 80} icon={<UserOutlined />} />
              <div style={{ textAlign: isMobile ? "center" : "left" }}>
                <Title level={4} style={{ marginTop: 0 }}>
                  {ownerData.name}
                </Title>
                <Space size="large" wrap>
                  <Badge
                    status={ownerData?.is_deleted ? "error" : "success"}
                    text={
                      ownerData?.is_deleted
                        ? "Không hoạt động"
                        : "Đang hoạt động"
                    }
                  />
                </Space>
              </div>
            </div>

            <Divider style={{ margin: isMobile ? "12px 0" : "24px 0" }} />

            <OwnerTabs
              ownerData={ownerData}
              createJobHistory={createJobHistory}
              bookingHistory={bookingHistory}
              isMobile={isMobile}
              isTablet={isTablet}
              navigate={navigate}
              handleDelete={handleDelete}
              refreshData={fetchOwnerData}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OwnerDetails;
