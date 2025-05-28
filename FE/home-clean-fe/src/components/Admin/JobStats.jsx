import React from "react";
import { Card, Row, Col, Spin, Progress } from "antd";

const JobStats = ({ jobData, loading }) => {
  if (loading)
    return (
      <Card title="Thống kê công việc" className="shadow-sm">
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );

  if (!jobData)
    return (
      <Card title="Thống kê công việc" className="shadow-sm">
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          Không có dữ liệu công việc
        </div>
      </Card>
    );

  // Chuyển đổi mã trạng thái sang tiếng Việt
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case "OPEN":
        return "Đang chờ người nhận";
      case "PAID":
        return "Đang chờ thanh toán qua VNPay";
      case "PENDING_APPROVAL":
        return "Chờ phê duyệt";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "ARRIVED":
        return "Người nhận việc đã tới";
      case "COMPLETED":
        return "Người nhận việc đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "AUTO_CANCELLED":
        return "Đã hủy do quá thời gian hoặc trùng lịch";
      case "DONE":
        return "Hoàn tất công việc";
      case "BOOKED":
        return "Đã đặt lịch";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "#3498db";
      case "PAID":
        return "#5dade2";
      case "PENDING_APPROVAL":
        return "#f1ab0f";
      case "IN_PROGRESS":
        return "#e67e22";
      case "ARRIVED":
        return "#9b59b6";
      case "COMPLETED":
        return "#2ecc71";
      case "CANCELLED":
        return "#e74c3c";
      case "AUTO_CANCELLED":
        return "#e74c3c";
      case "DONE":
        return "#27ae60";
      case "BOOKED":
        return "#8e44ad";
      default:
        return "#bdc3c7";
    }
  };

  // Tạo dữ liệu cho biểu đồ với tên tiếng Việt
  const jobStatusData = [
    {
      type: getStatusText("IN_PROGRESS"),
      value: jobData.IN_PROGRESS || 0,
      color: getStatusColor("IN_PROGRESS"),
      code: "IN_PROGRESS",
    },
    {
      type: getStatusText("OPEN"),
      value: jobData.OPEN || 0,
      color: getStatusColor("OPEN"),
      code: "OPEN",
    },
    {
      type: getStatusText("DONE"),
      value: jobData.DONE || 0,
      color: getStatusColor("DONE"),
      code: "DONE",
    },
    {
      type: getStatusText("CANCELLED"),
      value: jobData.CANCELLED || 0,
      color: getStatusColor("CANCELLED"),
      code: "CANCELLED",
    },
  ];

  const total = jobStatusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card
      title={
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>
          Thống kê công việc
        </div>
      }
      className="shadow-sm"
      headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      bodyStyle={{ padding: "20px" }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {jobStatusData.map((item) => (
              <div
                key={item.code}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${item.color}30`,
                  transition: "transform 0.2s ease",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.08)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                    backgroundColor: `${item.color}15`,
                    borderRadius: "10px 0 0 10px",
                    zIndex: 0,
                    transition: "width 0.5s ease",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: "15px" }}>
                    {item.type}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", zIndex: 1 }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: item.color,
                      marginRight: "10px",
                    }}
                  >
                    {item.value}
                  </span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              borderRadius: "10px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: "15px", color: "#666" }}>
                  Tỉ lệ thành công:
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    color: getStatusColor("DONE"),
                    fontSize: "16px",
                  }}
                >
                  {jobData.doneRate}%
                </span>
              </div>
              <Progress
                percent={parseFloat(jobData.doneRate)}
                showInfo={false}
                strokeColor={getStatusColor("DONE")}
                style={{ marginBottom: 16 }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: "15px", color: "#666" }}>
                  Tỉ lệ hủy:
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    color: getStatusColor("CANCELLED"),
                    fontSize: "16px",
                  }}
                >
                  {jobData.cancelledRate}%
                </span>
              </div>
              <Progress
                percent={parseFloat(jobData.cancelledRate)}
                showInfo={false}
                strokeColor={getStatusColor("CANCELLED")}
              />
            </div>

            {/* <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  backgroundColor: "#f9f9f9",
                  padding: "12px",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${getStatusColor("IN_PROGRESS")}`,
                }}
              >
                <strong>Lưu ý:</strong> Theo dõi tỉ lệ thành công và hủy để đánh
                giá hiệu quả hoạt động.
              </div>
            </div> */}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default JobStats;
