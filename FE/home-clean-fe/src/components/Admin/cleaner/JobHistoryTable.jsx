import React from "react";
import {
  Table,
  Tag,
  Button,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

const JobHistoryTable = ({
  jobData,
  isMobile,
  isTablet,
  navigate,
  title = "Thống kê công việc",
}) => {
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

  // Define responsive columns for job history table
  const getJobColumns = () => {
    // Base columns for all screen sizes (prioritizing the most important columns)
    const baseColumns = [
      {
        title: "Khách hàng",
        dataIndex: "fullName",
        key: "fullName",
        // ellipsis: isMobile || isTablet,
      },
      {
        title: "Dịch vụ",
        dataIndex: "services",
        key: "services",
        render: (services) => (
          <span>
            {services
              .slice(0, isMobile || isTablet ? 1 : 2)
              .map((service, index) => (
                <Tag key={index} color="blue">
                  {service}
                </Tag>
              ))}
            {services.length > (isMobile || isTablet ? 1 : 2) && (
              <Tag color="blue">
                +{services.length - (isMobile || isTablet ? 1 : 2)}
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
            onClick={() => navigate(`/admin/jobs/${record.jobId}`)}
          >
            Chi tiết
          </Button>
        ),
      },
    ];

    // Add date and total price columns only for desktop view
    if (!isMobile && !isTablet) {
      baseColumns.splice(1, 0, {
        title: "Ngày",
        dataIndex: "scheduledTime",
        key: "scheduledTime",
        render: (text) =>
          new Date(text).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        sorter: (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime),
      });

      baseColumns.splice(3, 0, {
        title: "Tổng tiền (VND)",
        dataIndex: "totalPrice",
        key: "totalPrice",
        render: (price) => `${price.toLocaleString("vi-VN")}`,
        sorter: (a, b) => a.totalPrice - b.totalPrice,
      });
    }

    return baseColumns;
  };

  return (
    <div>
      <Card title={title} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Tổng số công việc"
              value={jobData.length}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Tổng doanh thu"
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
              {(isMobile || isTablet) && (
                <Descriptions.Item label="Ngày">
                  {new Date(record.scheduledTime).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Descriptions.Item>
              )}
              {(isMobile || isTablet) && (
                <Descriptions.Item label="Tổng tiền">
                  <strong>
                    {record.totalPrice.toLocaleString("vi-VN")} VND
                  </strong>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Số điện thoại">
                {record.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {record.paymentMethod === "cash"
                  ? "Tiền mặt"
                  : record.paymentMethod === "vnpay"
                  ? "VNPay"
                  : record.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={isMobile ? 1 : 2}>
                {record.reminder || "Không có ghi chú"}
              </Descriptions.Item>
              {record.feedback && (
                <Descriptions.Item label="Phản hồi" span={isMobile ? 1 : 2}>
                  {record.feedback}
                </Descriptions.Item>
              )}
              {(isMobile || isTablet) && record.services.length > 1 && (
                <Descriptions.Item label="Tất cả dịch vụ" span={1}>
                  {record.services.map((service, index) => (
                    <Tag key={index} color="blue" style={{ margin: "2px" }}>
                      {service}
                    </Tag>
                  ))}
                </Descriptions.Item>
              )}
            </Descriptions>
          ),
        }}
      />
    </div>
  );
};

export default JobHistoryTable;
