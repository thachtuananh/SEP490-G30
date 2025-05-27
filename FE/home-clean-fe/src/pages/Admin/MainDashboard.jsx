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
  Button,
  Table,
  Tag,
  Modal,
  Space,
} from "antd";
import { HomeOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../components/Admin/AppSidebar";
import AppHeader from "../../components/Admin/AppHeader";
import StatCards from "../../components/Admin/StatCards";
import SalesChart from "../../components/Admin/SalesChart";
import JobStats from "../../components/Admin/JobStats";
import { BASE_URL } from "../../utils/config";

const { Content } = Layout;
const { Title } = Typography;

// Component mới cho lịch sử giao dịch
const TransactionHistory = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0); // Page bắt đầu từ 0 theo API
  const [size, setSize] = useState(10); // Kích thước trang
  const [totalItems, setTotalItems] = useState(0); // Tổng số mục

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `${BASE_URL}/admin/get-profit?page=${page}&size=${size}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Debug: Log toàn bộ response để kiểm tra
      console.log("API Response:", result);
      console.log("Response status:", result.status);

      // Kiểm tra nhiều điều kiện có thể
      const isSuccess =
        result.status === 200 || (!result.status && result.profits); // Trường hợp không có status field

      if (isSuccess && result.profits && Array.isArray(result.profits)) {
        // Ánh xạ dữ liệu từ API để phù hợp với cấu trúc bảng
        const mappedTransactions = result.profits.map((item, index) => ({
          key: item.id, // Sử dụng id làm key
          stt: index + 1 + page * size, // Tính STT dựa trên page và index
          transactionCode: item.transactionCode,
          serviceType: item.serviceType, // Thêm serviceType từ API
          executionDate: item.executionDate,
          customerName: item.customerName,
          cleanerName: item.cleanerName,
          amount: item.amount,
          profitReceived: item.profitReceived,
        }));
        setTransactions(mappedTransactions);
        setTotalItems(result.totalItems || result.profits.length); // Fallback nếu không có totalItems
      } else {
        console.error("API Response Error:", {
          status: result.status,
          hasProfit: !!result.profits,
          profitsType: typeof result.profits,
          isArray: Array.isArray(result.profits),
        });
        message.error(
          `Không thể tải lịch sử giao dịch. Status: ${
            result.status || "undefined"
          }`
        );
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      message.error("Đã xảy ra lỗi khi tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchTransactionHistory();
    }
  }, [visible, page, size]);

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transactionCode",
      key: "transactionCode",
    },

    {
      title: "Ngày thực hiện",
      dataIndex: "executionDate",
      key: "executionDate",
      render: (date) => {
        if (date) {
          // Xử lý date string từ API (format: "2025-05-26")
          const dateObj = new Date(date + "T00:00:00");
          return dateObj.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        return "N/A";
      },
    },
    {
      title: "Tên chủ nhà",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tên người dọn dẹp",
      dataIndex: "cleanerName",
      key: "cleanerName",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {amount?.toLocaleString("vi-VN") || "0"}
        </span>
      ),
    },
    {
      title: "Lợi nhuận nhận được",
      dataIndex: "profitReceived",
      key: "profitReceived",
      render: (profit) => (
        <span style={{ color: "#52c41a", fontWeight: "bold" }}>
          +{profit?.toLocaleString("vi-VN") || "0"}
        </span>
      ),
    },
  ];

  // Reset page về 0 khi modal được mở lại
  useEffect(() => {
    if (visible && page !== 0) {
      setPage(0);
    }
  }, [visible]);

  return (
    <Modal
      title="Lịch sử giao dịch"
      open={visible}
      onCancel={onClose}
      width={"80%"} // Tăng width để phù hợp với nhiều cột hơn
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        // <Button
        //   key="refresh"
        //   type="primary"
        //   onClick={fetchTransactionHistory}
        //   icon={<HistoryOutlined />}
        //   loading={loading}
        // >
        //   Làm mới
        // </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="key"
          scroll={{ x: 1200 }}
          size="large" // Sử dụng size small để tiết kiệm không gian
          pagination={{
            pageSize: size,
            current: page + 1, // API dùng page từ 0, nhưng Table của Ant Design dùng từ 1
            total: totalItems,
            // showSizeChanger: true,
            // showQuickJumper: true,
            // showTotal: (total, range) =>
            //   `${range[0]}-${range[1]} của ${total} mục`,
            // onChange: (newPage, newPageSize) => {
            //   setPage(newPage - 1); // Chuyển về index 0-based cho API
            //   if (newPageSize !== size) {
            //     setSize(newPageSize);
            //     setPage(0); // Reset về trang đầu khi thay đổi page size
            //   }
            // },
          }}
        />
      </Spin>
    </Modal>
  );
};

const MainDashboard = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for API data
  const [balanceData, setBalanceData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [jobData, setJobData] = useState(null);

  // State for transaction history modal
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);

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
        // const balanceResponse = await fetch(`${BASE_URL}/admin/totalBalance`, {
        //   headers,
        // });
        // const balanceResult = await balanceResponse.json();
        // setBalanceData(balanceResult);

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

  const showTransactionHistory = () => {
    setTransactionModalVisible(true);
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
                <Row
                  align="middle"
                  justify="space-between"
                  style={{ marginBottom: 24 }}
                >
                  <Col>
                    <Title level={3}>Tổng quan bảng điều khiển</Title>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<HistoryOutlined />}
                      onClick={showTransactionHistory}
                    >
                      Lịch sử giao dịch
                    </Button>
                  </Col>
                </Row>

                {/* Stat Cards */}
                <div style={{ marginBottom: 24 }}>
                  <StatCards
                    loading={loading}
                    revenueData={revenueData}
                    jobData={jobData}
                    balanceResult={balanceData}
                  />
                </div>

                {/* Charts Row */}
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={24}>
                    <SalesChart revenueData={revenueData} loading={loading} />
                  </Col>
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

      {/* Transaction History Modal */}
      <TransactionHistory
        visible={transactionModalVisible}
        onClose={() => setTransactionModalVisible(false)}
      />
    </Layout>
  );
};

export default MainDashboard;
