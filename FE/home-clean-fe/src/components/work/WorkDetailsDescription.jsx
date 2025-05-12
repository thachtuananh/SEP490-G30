import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  message,
  Descriptions,
  Tag,
  Divider,
  Spin,
  List,
  Space,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/CSS/work/WorkDetailsDescription.module.css";
import { BASE_URL } from "../../utils/config";
import { sendNotification } from "../../services/NotificationService"; // Import the sendNotification function

const { Title, Text, Paragraph } = Typography;

const WorkDetailsDescription = () => {
  const { jobId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission status

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine layout based on screen width
  const isMobile = windowWidth < 768;

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/cleaner/job/${jobId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy chi tiết công việc:", error);
        message.error("Không thể tải chi tiết công việc");
        setLoading(false);
      });
  }, [jobId, token]);

  const handleApplyJob = async () => {
    if (!token) {
      message.error("Bạn cần đăng nhập để nhận việc!");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true); // Set submitting state to true

      const response = await fetch(`${BASE_URL}/cleaner/apply-job/${jobId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể nhận việc!");
      }

      const data = await response.json();

      message.success("Ứng tuyển thành công");
      // sendNotification(
      //   job.customerId,
      //   `Người dọn dẹp ${sessionStorage.getItem("name")} đã nhận dịch vụ: ${
      //     job.services[0]?.serviceName || "Dọn dẹp"
      //   }`,
      //   "NHẬN VIỆC",
      //   "Customer"
      // );
      navigate("/homeclean");
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        "Bạn đang ứng tuyển hoặc đã có lịch làm việc trong một công việc cách công việc này nhỏ hơn 2 giờ"
      );
    } finally {
      // Reset submitting state after a short delay to prevent rapid re-submissions
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000); // 2 second cooldown
    }
  };

  // Reset isSubmitting state when modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      setIsSubmitting(false);
    }
  }, [isModalOpen]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" tip="Đang tải chi tiết công việc..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin công việc</Title>
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Xử lý hiển thị tên dịch vụ, lấy từ service đầu tiên nếu có
  const serviceName =
    job.services && job.services.length > 0
      ? job.services[0].serviceName
      : job.serviceName;

  // Xử lý hiển thị mô tả dịch vụ, lấy từ service đầu tiên nếu có
  const serviceDescription =
    job.services && job.services.length > 0
      ? job.services[0].serviceDescription
      : job.serviceDescription || "Không có mô tả";

  return (
    <Row
      gutter={[16, 16]}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: isMobile ? "0 12px" : 0,
      }}
    >
      <Col xs={24} md={12}>
        <Card bodyStyle={{ padding: isMobile ? 16 : 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {job.services && job.services.length > 0 ? (
                job.services.map((service, index) => (
                  <React.Fragment key={index}>
                    <Title
                      level={4}
                      style={{ margin: isMobile ? "0 0 8px 0" : 0 }}
                    >
                      {service.serviceName}
                    </Title>
                    {index < job.services.length - 1 && (
                      <Title
                        level={4}
                        style={{ margin: isMobile ? "0 0 8px 0" : "0 5px" }}
                      >
                        &{" "}
                      </Title>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Title level={4} style={{ margin: isMobile ? "0 0 8px 0" : 0 }}>
                  {serviceName}
                </Title>
              )}
            </div>

            {/* <Tag
              color={job.status === "OPEN" ? "green" : "default"}
              style={{ marginTop: isMobile ? 8 : 0 }}
            >
              {job.status === "OPEN" ? "Đang mở" : "Đã đóng"}
            </Tag> */}
          </div>

          <Descriptions
            layout={isMobile ? "horizontal" : "vertical"}
            column={isMobile ? 1 : 3}
            colon={false}
            style={{ marginBottom: isMobile ? 16 : 24 }}
          >
            <Descriptions.Item
              label={<Text type="secondary">Thù lao</Text>}
              labelStyle={{ fontSize: 14 }}
              contentStyle={{ fontWeight: "bold" }}
            >
              <div style={{ fontSize: isMobile ? 14 : 16 }}>
                <DollarOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                {job.totalPrice.toLocaleString()} VNĐ
              </div>
            </Descriptions.Item>

            <Descriptions.Item
              label={<Text type="secondary">Địa điểm</Text>}
              labelStyle={{ fontSize: 14 }}
              contentStyle={{ fontWeight: "bold" }}
            >
              <div style={{ fontSize: isMobile ? 14 : 16 }}>
                <EnvironmentOutlined
                  style={{ color: "#52c41a", marginRight: 8 }}
                />
                {job.customerAddress}
              </div>
            </Descriptions.Item>

            <Descriptions.Item
              label={<Text type="secondary">Thời gian</Text>}
              labelStyle={{ fontSize: 14 }}
              contentStyle={{ fontWeight: "bold" }}
            >
              <div style={{ fontSize: isMobile ? 14 : 16 }}>
                <ClockCircleOutlined
                  style={{ color: "#52c41a", marginRight: 8 }}
                />
                {formatTime(job.scheduledTime)} -{" "}
                {formatDate(job.scheduledTime)}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <div
            style={{
              marginTop: isMobile ? 16 : 24,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              type="primary"
              size={isMobile ? "middle" : "large"}
              icon={<CheckCircleOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{
                width: isMobile ? "100%" : "auto",
                minWidth: isMobile ? "auto" : 200,
                background: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Ứng tuyển
            </Button>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card bodyStyle={{ padding: isMobile ? 16 : 24 }}>
          <Title level={4}>Thông tin chung</Title>

          <Title level={5}>Loại dịch vụ</Title>
          <ul
            style={{
              listStyleType: "disclosure-closed",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            {(job.services && job.services.length > 0
              ? job.services
              : job.serviceDetails || []
            ).map((item, index) => (
              <li key={index} style={{ border: "none", paddingBottom: "8px" }}>
                <Typography.Text style={{ marginRight: "5px" }}>
                  {item.serviceDetailName || item.name}
                </Typography.Text>
                <Typography.Text>
                  {item.areaRange && `(${item.areaRange})`}
                </Typography.Text>
              </li>
            ))}
          </ul>

          <Title level={5}>Mô tả công việc</Title>
          <ul
            style={{
              listStyleType: "disclosure-closed",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            {(job.services && job.services.length > 0
              ? job.services
              : job.serviceDetails || []
            ).map((item, index) => (
              <li key={index} style={{ border: "none", paddingBottom: "8px" }}>
                <Typography.Text>{item.serviceDescription}</Typography.Text>
              </li>
            ))}
          </ul>

          <Title level={5}>Ghi chú</Title>
          <ul
            style={{
              listStyleType: "disclosure-closed",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            <li style={{ border: "none", paddingBottom: "8px" }}>
              <Typography.Text>
                {job.reminder || "Không có ghi chú"}
              </Typography.Text>
            </li>
          </ul>

          {/* <Title level={5}>Ưu đãi</Title>
          <Paragraph>
            {job.services && job.services.length > 0 && job.services[0].discounts
              ? job.services[0].discounts
              : "Không có ưu đãi"}
          </Paragraph> */}

          <Title level={5}>Khách hàng</Title>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                marginBottom: isMobile ? 8 : 0,
              }}
            >
              <div
                style={{
                  width: isMobile ? "100%" : "120px",
                  flexShrink: 0,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: "16px",
                }}
              >
                Tên khách hàng:
              </div>
              <div
                style={{
                  fontSize: "16px",
                }}
              >
                {job.customerName}
              </div>
            </div>
            {/* <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <div style={{
                width: isMobile ? '100%' : '150px',
                flexShrink: 0,
                marginBottom: isMobile ? 4 : 0
              }}>
                Số điện thoại:
              </div>
              <div>{job.customerPhone}</div>
            </div> */}
          </Space>
        </Card>
      </Col>

      <Modal
        title="Xác nhận ứng tuyển"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={isMobile ? "90%" : 520}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleApplyJob}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
            disabled={isSubmitting} // Disable button while submitting
            loading={isSubmitting} // Show loading state while submitting
          >
            {isSubmitting ? "Xác nhận" : "Xác nhận"}
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn ứng tuyển công việc này không?</p>
      </Modal>
    </Row>
  );
};

export default WorkDetailsDescription;
