import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  Timeline,
  Card,
  Tag,
  Typography,
  Divider,
  Empty,
  Alert,
} from "antd";
import {
  SendOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  createReport,
  getReportByJobId,
} from "../../services/cleaner/ReportAPI";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export const ReportModal = ({ visible, jobId, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("view"); // "view" or "create"
  const [hasSubmittedReport, setHasSubmittedReport] = useState(false);
  const cleanerId = sessionStorage.getItem("cleanerId");

  // Fetch existing reports when the modal is opened
  useEffect(() => {
    if (visible && jobId) {
      fetchReports();
    }
  }, [visible, jobId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setActiveTab("view");
    }
  }, [visible, form]);

  // Fetch reports for the current job
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getReportByJobId(jobId, cleanerId);

      // Handle the new response format which has a nested 'report' object
      if (response && response.report) {
        // Convert the single report object to an array for consistency
        setReports([response.report]);
        // If there's already a report submitted by this cleaner, set hasSubmittedReport to true
        setHasSubmittedReport(true);
      } else if (Array.isArray(response) && response.length > 0) {
        // Handle the case where response might still be an array
        setReports(response);
        setHasSubmittedReport(true);
      } else {
        setReports([]);
        setHasSubmittedReport(false);
        // Automatically switch to create tab when there's no data
        setActiveTab("create");
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.info(error.response.data.message);
      } else {
        // message.info("Không có báo cáo nào");
      }
      setLoading(false);
      // Automatically switch to create tab when there's an error
      setActiveTab("create");
    }
  };

  // Submit a new report
  const handleSubmit = async (values) => {
    if (hasSubmittedReport) {
      message.error("Bạn đã gửi báo cáo cho công việc này rồi!");
      return;
    }

    setSubmitting(true);
    try {
      await createReport(jobId, {
        report_type: values.report_type,
        description: values.description,
      });

      message.success("Báo cáo đã được gửi thành công!");
      fetchReports(); // Refresh reports list
      setHasSubmittedReport(true);
      setActiveTab("view");
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      message.error("Không thể gửi báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status color for report status tags
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "gold";
      case "PROCESSING":
        return "blue";
      case "RESOLVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "PROCESSING":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  // Get report type text in Vietnamese
  const getReportTypeText = (type) => {
    switch (type?.toUpperCase()) {
      case "CUSTOMER_ISSUE":
        return "Vấn đề về khách hàng";
      case "PROPERTY_ACCESS":
        return "Khó khăn trong việc tiếp cận địa điểm";
      case "EQUIPMENT_ISSUE":
        return "Vấn đề về thiết bị";
      case "SAFETY_CONCERN":
        return "Vấn đề về an toàn";
      case "WORK_SCOPE":
        return "Phạm vi công việc";
      case "OTHER":
        return "Khác";
      default:
        return type || "Không xác định";
    }
  };

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  // Render View Reports Tab
  const renderViewReportsTab = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <p>Đang tải báo cáo...</p>
        </div>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có báo cáo nào cho công việc này"
        />
      );
    }

    return (
      <div className="reports-list">
        <Timeline mode="left">
          {reports.map((report, index) => (
            <Timeline.Item
              key={index}
              color={getStatusColor(report.status)}
              dot={<FileTextOutlined style={{ fontSize: "16px" }} />}
            >
              <Card
                style={{ marginBottom: 16 }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Báo cáo #{report.id}</span>
                    <Tag color={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Tag>
                  </div>
                }
              >
                <div>
                  <Text strong>Loại báo cáo:</Text>{" "}
                  <Text>{getReportTypeText(report.reportType)}</Text>
                </div>

                <div style={{ margin: "12px 0" }}>
                  <Text strong>Mô tả vấn đề:</Text>
                  <Paragraph
                    style={{
                      background: "#f5f5f5",
                      padding: 12,
                      borderRadius: 4,
                      marginTop: 8,
                    }}
                  >
                    {report.description || "Không có mô tả"}
                  </Paragraph>
                </div>

                {report.status === "RESOLVED" && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Phản hồi từ Admin:</Text>
                      <Paragraph
                        style={{
                          background: "#f0f8ff",
                          padding: 12,
                          borderRadius: 4,
                          marginTop: 8,
                        }}
                      >
                        {report.adminResponse || "Không có phản hồi"}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong>Thời gian giải quyết:</Text>{" "}
                      <Text>{formatDate(report.resolvedAt)}</Text>
                    </div>
                  </>
                )}
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  // Render Create Report Form
  const renderCreateReportForm = () => {
    // If user has already submitted a report, show a message
    // if (hasSubmittedReport) {
    //   return (
    //     <Alert
    //       message="Không thể tạo báo cáo mới"
    //       description="Bạn đã gửi báo cáo cho công việc này rồi. Mỗi công việc chỉ được phép gửi một báo cáo."
    //       type="warning"
    //       showIcon
    //       style={{ marginBottom: 16 }}
    //     />
    //   );
    // }

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          report_type: "CUSTOMER_ISSUE",
        }}
      >
        <Form.Item
          name="report_type"
          label="Loại báo cáo"
          rules={[{ required: true, message: "Vui lòng chọn loại báo cáo" }]}
        >
          <Select placeholder="Chọn loại báo cáo">
            <Option value="CUSTOMER_ISSUE">Vấn đề về khách hàng</Option>
            <Option value="PROPERTY_ACCESS">
              Khó khăn trong việc tiếp cận địa điểm
            </Option>
            <Option value="EQUIPMENT_ISSUE">Vấn đề về thiết bị</Option>
            <Option value="SAFETY_CONCERN">Vấn đề về an toàn</Option>
            <Option value="WORK_SCOPE">Phạm vi công việc</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả vấn đề"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả vấn đề" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    );
  };

  // Main modal render
  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <ExclamationCircleOutlined
            style={{ color: "#faad14", marginRight: 8 }}
          />
          {activeTab === "view" ? "Danh sách báo cáo" : "Tạo báo cáo mới"}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={
        activeTab === "view" ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={onClose}>Đóng</Button>
            {/* Hide the "Create new report" button when hasSubmittedReport is true */}
            {!hasSubmittedReport && reports.length === 0 && (
              <Button type="primary" onClick={() => setActiveTab("create")}>
                Tạo báo cáo mới
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => setActiveTab("view")}>Quay lại</Button>
            {!hasSubmittedReport && (
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={submitting}
                icon={<SendOutlined />}
              >
                Gửi báo cáo
              </Button>
            )}
          </div>
        )
      }
    >
      {activeTab === "view" ? renderViewReportsTab() : renderCreateReportForm()}
    </Modal>
  );
};
