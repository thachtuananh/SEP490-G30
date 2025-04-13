import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Spin,
  Rate,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { BASE_URL } from "../../../utils/config"; // Adjust path as needed

const JobHistoryTable = ({
  jobData,
  isMobile,
  isTablet,
  navigate,
  title = "Thống kê công việc",
}) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "#3498db";
      case "PAID":
        return "#5dade2";
      case "PENDING_APPROVAL":
        return "#f1c40f";
      case "IN_PROGRESS":
        return "#e67e22";
      case "COMPLETED":
        return "#2ecc71";
      case "CANCELLED":
        return "#e74c3c";
      case "DONE":
        return "#27ae60";
      case "BOOKED":
        return "#8e44ad";
      default:
        return "#bdc3c7";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "OPEN":
        return "Đang chờ người nhận";
      case "PAID":
        return "Đang chờ thanh toán qua VNPay";
      case "PENDING_APPROVAL":
        return "Chờ phê duyệt";
      case "IN_PROGRESS":
        return "Người nhận việc đang tới";
      case "COMPLETED":
        return "Người nhận việc đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "DONE":
        return "Hoàn tất công việc";
      case "BOOKED":
        return "Đã đặt lịch";
      default:
        return "Không xác định";
    }
  };

  // Function to fetch job details
  const fetchJobDetails = async (jobId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/admin/customers/jobdetail/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setJobDetails(response.data);
      setDetailsModalVisible(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job details:", error);
      message.error("Không thể tải chi tiết công việc. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Define responsive columns for job history table
  const getJobColumns = () => {
    // Desktop columns (all columns)
    if (!isMobile && !isTablet) {
      return [
        {
          title: "Ngày",
          dataIndex: "scheduledTime",
          key: "scheduledTime",
          render: (text) =>
            new Date(text).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          sorter: (a, b) =>
            new Date(a.scheduledTime) - new Date(b.scheduledTime),
        },
        {
          title: "Tổng tiền (VND)",
          dataIndex: "totalPrice",
          key: "totalPrice",
          render: (price) => `${price.toLocaleString("vi-VN")}`,
          sorter: (a, b) => a.totalPrice - b.totalPrice,
        },
        {
          title: "Dịch vụ",
          dataIndex: "services",
          key: "services",
          render: (services) => (
            <span>
              {services.map((service, index) => (
                <Tag key={index} color="blue">
                  {service}
                </Tag>
              ))}
            </span>
          ),
        },
        {
          title: "Trạng thái",
          dataIndex: "jobStatus",
          key: "jobStatus",
          render: (status) => {
            const color = getStatusColor(status);
            const text = getStatusText(status);
            return (
              <Tag
                color={color}
                style={{ color: "#fff", backgroundColor: color }}
              >
                {text}
              </Tag>
            );
          },
          filters: [
            { text: "Đang chờ người nhận", value: "OPEN" },
            { text: "Đang chờ thanh toán qua VNPay", value: "PAID" },
            { text: "Chờ phê duyệt", value: "PENDING_APPROVAL" },
            { text: "Người nhận việc đang tới", value: "IN_PROGRESS" },
            { text: "Người nhận việc đã hoàn thành", value: "COMPLETED" },
            { text: "Đã hủy", value: "CANCELLED" },
            { text: "Hoàn tất công việc", value: "DONE" },
            { text: "Đã đặt lịch", value: "BOOKED" },
          ],
          onFilter: (value, record) => record.jobStatus === value,
        },
        {
          title: "Hành động",
          key: "action",
          render: (_, record) => (
            <Button
              type="link"
              onClick={() => fetchJobDetails(record.jobId)}
              loading={loading}
            >
              Chi tiết
            </Button>
          ),
        },
      ];
    }

    // Mobile and tablet columns (prioritized columns)
    return [
      {
        title: "Tổng tiền (VND)",
        dataIndex: "totalPrice",
        key: "totalPrice",
        render: (price) => `${price.toLocaleString("vi-VN")}`,
        sorter: (a, b) => a.totalPrice - b.totalPrice,
      },
      {
        title: "Dịch vụ",
        dataIndex: "services",
        key: "services",
        render: (services) => (
          <span>
            {services.length > 0 && (
              <Tag color="blue">
                {services[0]}
                {services.length > 1 ? ` +${services.length - 1}` : ""}
              </Tag>
            )}
          </span>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "jobStatus",
        key: "jobStatus",
        render: (status) => {
          const color = getStatusColor(status);
          const text = getStatusText(status);
          return (
            <Tag
              color={color}
              style={{ color: "#fff", backgroundColor: color }}
            >
              {text}
            </Tag>
          );
        },
        filters: [
          { text: "Đang chờ người nhận", value: "OPEN" },
          { text: "Đang chờ thanh toán qua VNPay", value: "PAID" },
          { text: "Chờ phê duyệt", value: "PENDING_APPROVAL" },
          { text: "Người nhận việc đang tới", value: "IN_PROGRESS" },
          { text: "Người nhận việc đã hoàn thành", value: "COMPLETED" },
          { text: "Đã hủy", value: "CANCELLED" },
          { text: "Hoàn tất công việc", value: "DONE" },
          { text: "Đã đặt lịch", value: "BOOKED" },
        ],
        onFilter: (value, record) => record.jobStatus === value,
      },
      {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
          <Button
            type="link"
            onClick={() => fetchJobDetails(record.jobId)}
            loading={loading}
          >
            Chi tiết
          </Button>
        ),
      },
    ];
  };

  // Format date time for modal display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN"
    )}`;
  };

  return (
    <div>
      <Card title={title} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Tổng số việc đã đăng"
              value={jobData.length}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Tổng tiền đã thanh toán"
              value={jobData
                .filter((job) => job.jobStatus === "DONE")
                .reduce((sum, job) => sum + job.totalPrice, 0)
                .toLocaleString("vi-VN")}
              suffix="VND"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Công việc hoàn thành"
              value={jobData.filter((job) => job.jobStatus === "DONE").length}
              suffix={`/ ${jobData.length}`}
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={getJobColumns()}
        dataSource={jobData}
        rowKey="jobId"
        pagination={{ pageSize: isMobile ? 5 : 10 }}
        scroll={{ x: isMobile ? 500 : true }}
        size={isMobile ? "small" : "middle"}
        expandable={{
          expandedRowRender: (record) => (
            <Descriptions column={isMobile ? 1 : 2} size="small" bordered>
              <Descriptions.Item label="Ngày">
                {new Date(record.scheduledTime).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {record.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {record.paymentMethod === "cash"
                  ? "Tiền mặt"
                  : record.paymentMethod === "vnpay"
                  ? "VNPay"
                  : record.paymentMethod === "wallet"
                  ? "Ví điện tử"
                  : record.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={isMobile ? 1 : 2}>
                {record.reminder || "Không có ghi chú"}
              </Descriptions.Item>
              {(isMobile || isTablet) && (
                <Descriptions.Item
                  label="Tất cả dịch vụ"
                  span={isMobile ? 1 : 2}
                >
                  {record.services?.map((service, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      style={{ marginRight: "5px", marginBottom: "5px" }}
                    >
                      {service}
                    </Tag>
                  ))}
                </Descriptions.Item>
              )}
              {record.feedback && (
                <Descriptions.Item label="Phản hồi" span={isMobile ? 1 : 2}>
                  {record.feedback}
                </Descriptions.Item>
              )}
            </Descriptions>
          ),
        }}
      />

      {/* Modal for displaying job details */}
      <Modal
        title="Chi tiết công việc"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailsModalVisible(false)}
            type="primary"
          >
            Đóng
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {jobDetails ? (
          <Descriptions
            bordered
            column={isMobile ? 1 : 2}
            size="middle"
            layout="vertical"
          >
            <Descriptions.Item label="Mã công việc" span={2}>
              {jobDetails.jobId}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {jobDetails.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Người dọn dẹp">
              {jobDetails.cleanerApplications &&
              jobDetails.cleanerApplications.length > 0
                ? jobDetails.cleanerApplications.map((cleaner, index) => (
                    <Tag key={index}>{cleaner}</Tag>
                  ))
                : "Không có người dọn dẹp"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {jobDetails.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(jobDetails.jobStatus)}>
                {getStatusText(jobDetails.jobStatus)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đặt lịch">
              {formatDateTime(jobDetails.scheduledTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {jobDetails.totalPrice?.toLocaleString("vi-VN")} VND
            </Descriptions.Item>
            <Descriptions.Item label="Dịch vụ" span={2}>
              {jobDetails.services?.map((service, index) => (
                <Tag key={index} color="blue" style={{ marginRight: "5px" }}>
                  {service}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {jobDetails.paymentMethod === "cash"
                ? "Tiền mặt"
                : jobDetails.paymentMethod === "vnpay"
                ? "VNPay"
                : jobDetails.paymentMethod === "wallet"
                ? "Ví điện tử"
                : jobDetails.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {jobDetails.reminder || "Không có ghi chú"}
            </Descriptions.Item>
            {jobDetails.feedback && (
              <Descriptions.Item label="Phản hồi" span={2}>
                {jobDetails.feedback}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Spin size="large" /> Đang tải dữ liệu...
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobHistoryTable;
