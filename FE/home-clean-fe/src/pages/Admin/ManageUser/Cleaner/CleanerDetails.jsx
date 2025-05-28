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
  CheckCircleOutlined,
  CloseCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../../utils/config";
import CleanerTabs from "../../../../components/Admin/cleaner/CleanerTabs";

const { Content } = Layout;
const { Title, Text } = Typography;

const CleanerDetails = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const [cleanerData, setCleanerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobHistory, setJobHistory] = useState([]);
  const [jobHistoryBooked, setJobHistoryBooked] = useState([]);
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

  // Create a fetchCleanerData function that can be called for refresh
  const fetchCleanerData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/admin/cleaners/${cleanerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setCleanerData(response.data);

      // Get job history
      const jobHistoryResponse = await axios.get(
        `${BASE_URL}/admin/cleaners/${cleanerId}/jobhistory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setJobHistory(jobHistoryResponse.data);

      // Get booked job history
      const jobHistoryBookedResponse = await axios.get(
        `${BASE_URL}/admin/cleaners/${cleanerId}/jobbookedhistory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setJobHistoryBooked(jobHistoryBookedResponse.data);
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [cleanerId]);

  // Call fetchCleanerData when component mounts
  useEffect(() => {
    fetchCleanerData();
  }, [fetchCleanerData]);

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
            `${BASE_URL}/admin/cleaners/${cleanerId}/delete`,
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
          navigate("/admin/cleaners");
        } catch (error) {
          message.error("Không thể xoá người dùng. Vui lòng thử lại sau.");
        }
      },
    });
  };

  const goBack = () => {
    navigate("/admin/cleaners");
  };

  // Convert base64 image to URL
  const getImageUrl = (base64String) => {
    if (!base64String) return null;
    return `data:image/png;base64,${base64String}`;
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

  if (loading && !cleanerData) {
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
                {/* <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                  {!isMobile && "Quay lại"}
                </Button> */}
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  Chi tiết Cleaner
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
              <Avatar
                size={isMobile ? 64 : 84}
                src={getImageUrl(cleanerData.profile_image_base64)}
                icon={!cleanerData.profile_image_base64 && <UserOutlined />}
              />
              <div style={{ textAlign: isMobile ? "center" : "left" }}>
                <Title level={4} style={{ marginTop: 0 }}>
                  {cleanerData.name}
                </Title>
                <Space
                  size={isMobile ? "small" : "large"}
                  wrap
                  direction={isMobile ? "vertical" : "horizontal"}
                >
                  <Badge
                    status={cleanerData.is_deleted ? "error" : "success"}
                    text={
                      cleanerData.is_deleted
                        ? "Không hoạt động"
                        : "Đang hoạt động"
                    }
                  />
                  <Space>
                    <Text>Xác minh CMND/CCCD:</Text>
                    {cleanerData.identity_verified ? (
                      <CheckCircleOutlined style={{ color: "green" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "red" }} />
                    )}
                  </Space>
                </Space>
              </div>
            </div>

            <Divider style={{ margin: isMobile ? "12px 0" : "24px 0" }} />

            <CleanerTabs
              cleanerData={cleanerData}
              jobHistory={jobHistory}
              jobHistoryBooked={jobHistoryBooked}
              isMobile={isMobile}
              isTablet={isTablet}
              navigate={navigate}
              handleDelete={handleDelete}
              refreshData={fetchCleanerData}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CleanerDetails;
