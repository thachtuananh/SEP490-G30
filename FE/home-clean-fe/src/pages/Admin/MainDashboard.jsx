import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Breadcrumb,
  Row,
  Col,
  Spin,
  message,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../components/Admin/AppSidebar";
import AppHeader from "../../components/Admin/AppHeader";
import StatCards from "../../components/Admin/StatCards";
import SalesChart from "../../components/Admin/SalesChart";
import JobStats from "../../components/Admin/JobStats";
import { BASE_URL } from "../../utils/config";

const { Content } = Layout;
const { Title } = Typography;

const MainDashboard = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for API data
  const [balanceData, setBalanceData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [jobData, setJobData] = useState(null);

  // Determine responsive settings based on window width
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;

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

  // API calls
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch total balance
        const balanceResponse = await fetch(`${BASE_URL}/admin/totalBalance`, {
          headers,
        });
        const balanceResult = await balanceResponse.json();
        setBalanceData(balanceResult);

        // Fetch revenue
        const revenueResponse = await fetch(`${BASE_URL}/admin/real-revenue`, {
          headers,
        });
        const revenueResult = await revenueResponse.json();
        setRevenueData(revenueResult);

        // Fetch job statistics
        const jobResponse = await fetch(`${BASE_URL}/admin/get-total-job`, {
          headers,
        });
        const jobResult = await jobResponse.json();
        setJobData(jobResult);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error(
          "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Updated breadcrumb items using the new API
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
    },
    {
      title: "Bảng điều khiển",
    },
  ];

  // Update margin for layout
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={layoutStyle}>
        <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
        <Content style={contentStyle}>
          <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
            <Col xs={24} scroll={{ x: "max-content" }}>
              <Breadcrumb
                items={breadcrumbItems}
                style={{ marginBottom: 16 }}
              />

              <Card>
                <Title level={3}>Tổng quan bảng điều khiển</Title>

                {/* Stat Cards */}
                <div style={{ marginBottom: 24 }}>
                  <StatCards
                    loading={loading}
                    revenueData={revenueData}
                    jobData={jobData}
                  />
                </div>

                {/* Charts Row */}
                <Row gutter={[24, 24]}>
                  {/* <Col xs={24} lg={24}>
                    <SalesChart revenueData={revenueData} loading={loading} />
                  </Col> */}
                  <Col xs={24} lg={24}>
                    <JobStats jobData={jobData} loading={loading} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainDashboard;
