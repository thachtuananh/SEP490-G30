import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Table,
  Button,
  Input,
  Tag,
  message,
  Card,
  Breadcrumb,
  Space,
  Row,
  Col,
  Select,
  Empty,
  Alert,
  Modal,
  Spin,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  DollarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../../components/Admin/AppSidebar";
import AppHeader from "../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../utils/config";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CleanerWithdrawalRequests = () => {
  const [searchText, setSearchText] = useState("");
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);

  // Format currency to VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [statusFilter]);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");

      // Added userType=cleaner to filter only cleaner withdrawals
      const response = await axios.get(
        `${BASE_URL}/admin/withdrawalRequests?status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setWithdrawalRequests(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);

      // More specific error handling for "NOT_FOUND" case
      if (error.response) {
        if (
          error.response.status === 404 ||
          error.response.data?.status === "NOT_FOUND"
        ) {
          // This is an expected case when no records exist for the filter
          setWithdrawalRequests([]);
          setError(null); // Not a true error state, just empty data
        } else {
          // Other API errors
          setError(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Không xác định"
            }`
          );
          message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        }
      } else if (error.request) {
        // Network errors
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn."
        );
        message.error(
          "Lỗi kết nối. Vui lòng kiểm tra kết nối internet của bạn."
        );
      } else {
        // Other unexpected errors
        setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
        message.error("Đã xảy ra lỗi không mong muốn.");
      }

      setLoading(false);
    }
  };

  // Show confirmation dialog before approving withdrawal
  const showApproveConfirm = (record) => {
    let transactionCode = "";

    const userName = record.cleaner.name;

    Modal.confirm({
      title: "Xác nhận duyệt yêu cầu rút tiền",
      icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này không?</p>
          <Text strong>Chi tiết yêu cầu:</Text>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <Text>Người dùng: {userName} (người dọn nhà)</Text>
            </li>
            <li>
              <Text>Số tiền: {formatCurrency(record.amount)}</Text>
            </li>
            <li>
              <Text>Ngân hàng: {record.bankName}</Text>
            </li>
            <li>
              <Text>Số tài khoản: {record.cardNumber}</Text>
            </li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Text strong>Mã giao dịch:</Text>
            <Input
              placeholder="Nhập mã giao dịch"
              style={{ marginTop: 8 }}
              onChange={(e) => {
                transactionCode = e.target.value;
              }}
            />
          </div>
        </div>
      ),
      okText: "Xác nhận duyệt",
      okType: "primary",
      cancelText: "Hủy",
      onOk() {
        if (!transactionCode.trim()) {
          message.error("Vui lòng nhập mã giao dịch");
          return Promise.reject();
        }
        return approveWithdrawal(record.id, transactionCode.trim());
      },
    });
  };

  // Show confirmation dialog before rejecting withdrawal
  const showRejectConfirm = (record) => {
    let rejectionReason = "";

    const userName = record.cleaner.name;

    Modal.confirm({
      title: "Xác nhận từ chối yêu cầu rút tiền",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này không?</p>
          <Text strong>Chi tiết yêu cầu:</Text>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <Text>Người dùng: {userName} (người dọn nhà)</Text>
            </li>
            <li>
              <Text>Số tiền: {formatCurrency(record.amount)}</Text>
            </li>
            <li>
              <Text>Ngân hàng: {record.bankName}</Text>
            </li>
            <li>
              <Text>Số tài khoản: {record.cardNumber}</Text>
            </li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Text strong>Lý do từ chối:</Text>
            <Input.TextArea
              placeholder="Nhập lý do từ chối yêu cầu"
              style={{ marginTop: 8 }}
              onChange={(e) => {
                rejectionReason = e.target.value;
              }}
              rows={3}
            />
          </div>
          <Text type="danger" style={{ display: "block", marginTop: 8 }}>
            Lưu ý: Hành động này không thể hoàn tác!
          </Text>
        </div>
      ),
      okText: "Xác nhận từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        if (!rejectionReason.trim()) {
          message.error("Vui lòng nhập lý do từ chối");
          return Promise.reject();
        }
        return rejectWithdrawal(record.id, rejectionReason.trim());
      },
    });
  };

  const approveWithdrawal = async (id, transactionCode) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/admin/${id}?action=approve`,
        { transactionCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      message.success("Đã duyệt yêu cầu rút tiền thành công");
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error approving withdrawal:", error);

      // Improved error handling for approval action
      if (error.response) {
        message.error(
          `Không thể duyệt yêu cầu: ${
            error.response.data?.message || "Lỗi từ máy chủ"
          }`
        );
      } else if (error.request) {
        message.error(
          "Lỗi kết nối. Vui lòng kiểm tra kết nối internet của bạn."
        );
      } else {
        message.error("Không thể duyệt yêu cầu. Vui lòng thử lại sau.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const rejectWithdrawal = async (id, rejectionReason) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/admin/${id}?action=reject`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      message.success("Đã từ chối yêu cầu rút tiền thành công");
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);

      // Improved error handling for rejection action
      if (error.response) {
        message.error(
          `Không thể từ chối yêu cầu: ${
            error.response.data?.message || "Lỗi từ máy chủ"
          }`
        );
      } else if (error.request) {
        message.error(
          "Lỗi kết nối. Vui lòng kiểm tra kết nối internet của bạn."
        );
      } else {
        message.error("Không thể từ chối yêu cầu. Vui lòng thử lại sau.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const parseDate = (dateStr) => new Date(dateStr);

  const filteredWithdrawalRequests = withdrawalRequests.filter((record) => {
    // Filter by search text
    const searchMatch =
      record.cleaner?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      record.cardNumber?.includes(searchText) ||
      record.bankName?.toLowerCase().includes(searchText.toLowerCase()) ||
      record.accountHolderName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    return searchMatch;
  });

  const statusColors = {
    PENDING: "orange",
    APPROVED: "green",
    REJECTED: "red",
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tên người dọn nhà",
      key: "userName",
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>{record.cleaner.name}</span>
      ),
      sorter: (a, b) => a.cleaner.name.localeCompare(b.cleaner.name),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankName",
      key: "bankName",
      responsive: ["lg"],
    },
    {
      title: "Số tài khoản",
      dataIndex: "cardNumber",
      key: "cardNumber",
      responsive: ["lg"],
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "accountHolderName",
      key: "accountHolderName",
      responsive: ["lg"],
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => parseDate(text).toLocaleDateString("vi-VN"),
      sorter: (a, b) => parseDate(a.createdAt) - parseDate(b.createdAt),
      responsive: ["md"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]} style={{ borderRadius: "4px" }}>
          {status === "PENDING"
            ? "Đang chờ"
            : status === "APPROVED"
            ? "Đã duyệt"
            : "Đã từ chối"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showApproveConfirm(record)}
                size="small"
                loading={actionLoading}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectConfirm(record)}
                size="small"
                loading={actionLoading}
              >
                Từ chối
              </Button>
            </>
          )}
          <Button
            type="default"
            icon={<EyeOutlined />}
            // onClick={() => viewDetails(record.id)}
            size="small"
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  //   const viewDetails = (id) => {
  //     navigate(`/admin/cleaner-withdrawal-requests/${id}`);
  //   };

  // Updated breadcrumb items
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
    },
    {
      title: (
        <>
          <DollarOutlined />
          <span>Tài chính</span>
        </>
      ),
    },
    {
      title: (
        <>
          <span>Yêu cầu rút tiền - Người dọn nhà</span>
        </>
      ),
    },
  ];

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

  // Custom render for empty state with more descriptive messages
  const customEmpty = () => {
    // Handle different empty states
    let description = "Không có yêu cầu rút tiền nào";
    let showRetryButton = false;

    if (error) {
      description = error;
      showRetryButton = true;
    } else if (
      filteredWithdrawalRequests.length === 0 &&
      withdrawalRequests.length > 0
    ) {
      description = "Không tìm thấy yêu cầu rút tiền nào phù hợp với bộ lọc";
    } else if (withdrawalRequests.length === 0) {
      // This is the state when there are no requests for the current status filter
      description = `Không có yêu cầu rút tiền nào của người dọn nhà ở trạng thái "${
        statusFilter === "PENDING"
          ? "Đang chờ"
          : statusFilter === "APPROVED"
          ? "Đã duyệt"
          : "Đã từ chối"
      }"`;
    }

    return (
      <Empty
        style={{
          minHeight: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        image={
          error ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT
        }
        description={
          <span>
            {error && (
              <ExclamationCircleOutlined
                style={{ color: "#ff4d4f", marginRight: 8 }}
              />
            )}
            {description}
          </span>
        }
      >
        {showRetryButton && (
          <Button
            type="primary"
            onClick={fetchWithdrawalRequests}
            icon={<ReloadOutlined />}
          >
            Thử lại
          </Button>
        )}
      </Empty>
    );
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <Title level={3} style={{ margin: 0 }}>
                    Danh sách yêu cầu rút tiền - Người dọn nhà
                  </Title>
                  <Space
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchWithdrawalRequests}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                    <Input
                      placeholder="Tìm kiếm theo tên, ngân hàng, số TK"
                      prefix={<SearchOutlined />}
                      style={{
                        width: "100%",
                        minWidth: "200px",
                        maxWidth: "300px",
                      }}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </Space>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <span>
                      <FilterOutlined /> Lọc theo trạng thái:
                    </span>
                    <Select
                      style={{ width: 150 }}
                      value={statusFilter}
                      onChange={setStatusFilter}
                    >
                      <Option value="PENDING">Đang chờ</Option>
                      <Option value="APPROVED">Đã duyệt</Option>
                      <Option value="REJECTED">Đã từ chối</Option>
                    </Select>
                  </Space>
                </div>

                <Table
                  columns={columns}
                  dataSource={filteredWithdrawalRequests}
                  rowKey="id"
                  bordered
                  loading={loading}
                  scroll={{ x: "max-content" }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} yêu cầu`,
                    style: { justifyContent: "center" },
                  }}
                  locale={{
                    emptyText: customEmpty,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CleanerWithdrawalRequests;
