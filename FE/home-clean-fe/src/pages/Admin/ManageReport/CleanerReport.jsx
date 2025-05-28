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
  Modal,
  Spin,
  Tooltip,
  Form,
  Divider,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FlagOutlined,
  FileTextOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../../components/Admin/AppSidebar";
import AppHeader from "../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../utils/config";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CleanerReport = () => {
  const [searchText, setSearchText] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [responseModal, setResponseModal] = useState({
    visible: false,
    reportId: null,
    action: null,
  });
  const [responseText, setResponseText] = useState("");
  const [detailsModal, setDetailsModal] = useState({
    visible: false,
    report: null,
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);

  const reportTypeLabels = {
    CLEANER_ISSUE: "Vấn đề với người dọn nhà",
    CUSTOMER_ISSUE: "Vấn đề về khách hàng",
    PROPERTY_ACCESS: "Khó khăn trong việc tiếp cận địa điểm",
    EQUIPMENT_ISSUE: "Vấn đề về thiết bị",
    SAFETY_CONCERN: "Vấn đề về an toàn",
    WORK_SCOPE: "Phạm vi công việc",
    SERVICE_QUALITY: "Chất lượng dịch vụ",
    PAYMENT_ISSUE: "Vấn đề thanh toán",
    SCHEDULING_ISSUE: "Vấn đề lịch trình",
    RESOLVED: "Đã giải quyết",
    OTHER: "Khác",
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 992) {
        setCollapsed(false);
      }
    };

    if (window.innerWidth < 768) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchReports();
  }, [pagination.current, pagination.pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      const offset = (pagination.current - 1) * pagination.pageSize;
      const limit = pagination.pageSize;

      const url = `${BASE_URL}/reports/get-all-report-cleaner?offset=${offset}&limit=${limit}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });

      if (response.data) {
        setReports(response.data.reports || []);
        setPagination({
          ...pagination,
          total: response.data.totalItems || 0,
        });
      } else {
        setReports([]);
        setPagination({ ...pagination, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);

      if (error.response) {
        if (
          error.response.status === 404 ||
          error.response.data?.status === "NOT_FOUND"
        ) {
          setReports([]);
          setError(null);
        } else {
          setError(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Không xác định"
            }`
          );
          message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        }
      } else if (error.request) {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn."
        );
        message.error(
          "Lỗi kết nối. Vui lòng kiểm tra kết nối internet của bạn."
        );
      } else {
        setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
        message.error("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showResolveModal = (record) => {
    setResponseModal({
      visible: true,
      reportId: record.id,
      action: "RESOLVED",
    });
    setResponseText("");
  };

  const showDenyModal = (record) => {
    setResponseModal({
      visible: true,
      reportId: record.id,
      action: "DENIED",
    });
    setResponseText("");
  };

  const handleResponseSubmit = async () => {
    if (!responseModal.reportId || !responseModal.action) {
      message.error("Thông tin phản hồi không hợp lệ!");
      return;
    }

    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("token");
      const { reportId, action } = responseModal;

      const updateUrl = `${BASE_URL}/reports/${reportId}/update_report-cleaner?status=${action}&adminResponse=${encodeURIComponent(
        responseText.trim() || ""
      )}`;

      await axios.put(
        updateUrl,
        {
          // status: action,
          // adminResponse: responseText.trim() || null,
          // resolvedAt: action === "RESOLVED" ? new Date().toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      message.success(
        `Đã ${
          action === "RESOLVED" ? "giải quyết" : "từ chối"
        } báo cáo thành công`
      );
      setResponseModal({
        visible: false,
        reportId: null,
        action: null,
      });
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      message.error(
        `Không thể cập nhật báo cáo: ${
          error.response?.data?.message || "Lỗi từ máy chủ"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetails = (record) => {
    setDetailsModal({
      visible: true,
      report: record,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReports = reports.filter(
    (record) =>
      record.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      String(record.jobId).includes(searchText) ||
      String(record.id).includes(searchText)
  );

  const statusColors = {
    PENDING: "orange",
    RESOLVED: "green",
    DENIED: "red",
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Loại báo cáo",
      dataIndex: "reportType",
      key: "reportType",
      render: (type) => (
        <Tag color="blue" style={{ borderRadius: "4px" }}>
          {reportTypeLabels[type] || type}
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "Người dọn nhà ID",
      dataIndex: "cleanerId",
      key: "cleanerId",
      responsive: ["md"],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || "Không có mô tả"}>
          <div
            style={{
              maxWidth: 250,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text || "Không có mô tả"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => formatDate(text),
      responsive: ["lg"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]} style={{ borderRadius: "4px" }}>
          {status === "PENDING"
            ? "Đang chờ xử lý"
            : status === "RESOLVED"
            ? "Đã xử lý"
            : "Đã từ chối"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      // fixed: isMobile ? undefined : "right",
      // width: isMobile ? 100 : 150,
      render: (_, record) => (
        <Space wrap size="small">
          {record.status === "PENDING" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => showResolveModal(record)}
              size="small"
            >
              {!isMobile && "Xử lý"}
            </Button>
          )}
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => viewDetails(record)}
            size="small"
          >
            {!isMobile && "Chi tiết"}
          </Button>
        </Space>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: <HomeOutlined /> },
    {
      title: (
        <>
          <FlagOutlined /> <span>Quản lý báo cáo</span>
        </>
      ),
    },
    {
      title: (
        <>
          <ClearOutlined /> <span>Người dọn nhà</span>
        </>
      ),
    },
  ];

  // Layout configuration
  const sidebarWidth = collapsed ? 80 : windowWidth < 1200 ? 180 : 220;
  const contentStyle = {
    margin: isMobile ? "8px" : isTablet ? "16px 8px" : "24px 16px",
    padding: isMobile ? 8 : isTablet ? 16 : 24,
    background: "#fff",
    minHeight: 280,
    transition: "all 0.2s",
  };
  const layoutStyle = {
    marginLeft: isMobile ? "60px" : `${sidebarWidth}px`,
    transition: "all 0.2s",
    background: isMobile && !collapsed ? "rgba(0, 0, 0, 0.3)" : undefined,
  };

  // Simplified mobile card view
  const renderReportCard = (record) => (
    <Card key={record.id} style={{ marginBottom: 12 }} size="small">
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div>
          <Tag color={statusColors[record.status]} style={{ float: "right" }}>
            {record.status === "PENDING"
              ? "Đang chờ xử lý"
              : record.status === "RESOLVED"
              ? "Đã xử lý"
              : "Đã từ chối"}
          </Tag>
          <Text strong>ID: {record.id}</Text>
        </div>
        <div>
          <Text>
            {reportTypeLabels[record.reportType] || record.reportType}
          </Text>
        </div>
        <div>
          <Text type="secondary" ellipsis>
            {record.description || "Không có mô tả"}
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="secondary">{formatDate(record.createdAt)}</Text>
          <Space>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => viewDetails(record)}
              size="small"
            />
            {record.status === "PENDING" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showResolveModal(record)}
                size="small"
              />
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );

  // Empty state component
  const customEmpty = () => {
    let description = "Không có báo cáo nào";

    if (error) {
      description = error;
    } else if (filteredReports.length === 0 && reports.length > 0) {
      description = "Không tìm thấy báo cáo nào phù hợp";
    } else if (reports.length === 0) {
      description = "Không có báo cáo nào từ chủ nhà";
    }

    return (
      <Empty
        image={
          error ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT
        }
        description={<span>{description}</span>}
      >
        {error && (
          <Button
            type="primary"
            onClick={fetchReports}
            icon={<ReloadOutlined />}
            size="small"
          >
            Thử lại
          </Button>
        )}
      </Empty>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar collapsed={collapsed} />
      <Layout style={layoutStyle}>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <Content style={contentStyle}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />

          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                <FlagOutlined style={{ marginRight: 8 }} />
                Báo cáo từ chủ nhà
              </Title>

              <Space wrap>
                <Input
                  placeholder="Tìm kiếm..."
                  prefix={<SearchOutlined />}
                  style={{ width: isMobile ? "100%" : 200 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchReports}
                  loading={loading}
                >
                  Làm mới
                </Button>
              </Space>
            </div>

            {isMobile ? (
              <div>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin />
                  </div>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((record) => renderReportCard(record))
                ) : (
                  customEmpty()
                )}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredReports}
                rowKey="id"
                // pagination={{
                //   ...pagination,
                //   onChange: (page, pageSize) => {
                //     setPagination({ ...pagination, current: page, pageSize });
                //   },
                //   showSizeChanger: true,
                // }}
                loading={loading}
                locale={{ emptyText: customEmpty }}
                scroll={{ x: "max-content" }}
                style={{ overflowX: "auto" }}
                size="large"
              />
            )}
          </Card>
        </Content>
      </Layout>

      {/* Response Modal */}
      <Modal
        title={
          <>
            {responseModal.action === "RESOLVED" ? (
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
            ) : (
              <CloseCircleOutlined
                style={{ color: "#f5222d", marginRight: 8 }}
              />
            )}
            <span>
              {responseModal.action === "RESOLVED"
                ? "Giải quyết báo cáo"
                : "Từ chối báo cáo"}
            </span>
          </>
        }
        open={responseModal.visible}
        onCancel={() =>
          setResponseModal({
            visible: false,
            reportId: null,
            action: null,
          })
        }
        footer={[
          <Button
            key="back"
            onClick={() =>
              setResponseModal({
                visible: false,
                reportId: null,
                action: null,
              })
            }
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type={responseModal.action === "RESOLVED" ? "primary" : "danger"}
            loading={actionLoading}
            onClick={handleResponseSubmit}
          >
            {responseModal.action === "RESOLVED"
              ? "Xác nhận giải quyết"
              : "Xác nhận từ chối"}
          </Button>,
        ]}
        width={isMobile ? "90%" : 500}
      >
        <Form layout="vertical">
          <Form.Item label="Phản hồi của quản trị viên:">
            <TextArea
              rows={4}
              placeholder="Nhập phản hồi của bạn ở đây (không bắt buộc)..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={
          <>
            <FileTextOutlined /> Chi tiết báo cáo
          </>
        }
        open={detailsModal.visible}
        onCancel={() => setDetailsModal({ visible: false, report: null })}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailsModal({ visible: false, report: null })}
          >
            Đóng
          </Button>,
          detailsModal.report?.status === "PENDING" && (
            <Button
              key="resolve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                const report = detailsModal.report;
                setDetailsModal({ visible: false, report: null });
                showResolveModal(report);
              }}
            >
              Giải quyết
            </Button>
          ),
          detailsModal.report?.status === "PENDING" && (
            <Button
              key="deny"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                const report = detailsModal.report;
                setDetailsModal({ visible: false, report: null });
                showDenyModal(report);
              }}
            >
              Từ chối
            </Button>
          ),
        ].filter(Boolean)}
        width={isMobile ? "90%" : 700}
      >
        {detailsModal.report && (
          <>
            <Descriptions
              bordered
              size="large"
              column={{ xxl: 4, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
              labelStyle={{ fontWeight: "500", width: "120px" }}
              contentStyle={{ padding: "8px 12px" }}
            >
              <Descriptions.Item label="ID báo cáo" span={2}>
                {detailsModal.report.id}
              </Descriptions.Item>
              <Descriptions.Item label="Công việc ID" span={2}>
                {detailsModal.report.jobId}
              </Descriptions.Item>
              <Descriptions.Item label="Loại báo cáo" span={4}>
                <Tag
                  color="blue"
                  style={{ fontSize: "14px", padding: "2px 8px" }}
                >
                  {reportTypeLabels[detailsModal.report.reportType] ||
                    detailsModal.report.reportType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag
                  color={statusColors[detailsModal.report.status]}
                  style={{ fontSize: "14px", padding: "2px 8px" }}
                >
                  {detailsModal.report.status === "PENDING"
                    ? "Đang chờ xử lý"
                    : detailsModal.report.status === "RESOLVED"
                    ? "Đã xử lý"
                    : "Đã từ chối"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label="Báo cáo bởi"
                span={detailsModal.report.resolvedAt ? 2 : 2}
              >
                {`Người dọn nhà ID: ${detailsModal.report.cleanerId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày báo cáo" span={2}>
                {formatDate(detailsModal.report.createdAt)}
              </Descriptions.Item>
              {detailsModal.report.resolvedAt && (
                <Descriptions.Item label="Ngày giải quyết" span={2}>
                  {formatDate(detailsModal.report.resolvedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ fontWeight: "500" }}>Nội dung báo cáo</Divider>
            <Paragraph
              style={{
                fontSize: "15px",
                padding: "12px",
                background: "#f9f9f9",
                borderRadius: "4px",
                whiteSpace: "pre-wrap",
                minHeight: "80px",
              }}
            >
              {detailsModal.report.description || "Không có mô tả chi tiết"}
            </Paragraph>

            {detailsModal.report.adminResponse && (
              <>
                <Divider style={{ margin: "24px 0 16px", fontWeight: "500" }}>
                  Phản hồi từ quản trị viên
                </Divider>
                <Paragraph
                  style={{
                    fontSize: "14px",
                    padding: "12px",
                    background: "#f5f5f5",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                    minHeight: "80px",
                  }}
                >
                  {detailsModal.report.adminResponse}
                </Paragraph>
              </>
            )}
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default CleanerReport;
