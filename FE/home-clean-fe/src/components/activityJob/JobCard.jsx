import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import {
  DollarOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "./JobList.module.css";
import { BASE_URL } from "../../utils/config";
import { createConversation } from "../../services/ChatService";
import { sendNotification } from "../../services/NotificationService";

const getStatusColor = (status) => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case "OPEN":
      return "#3498db";
    case "PAID":
      return "#5dade2";
    case "PENDING_APPROVAL":
      return "#f1c40f";
    case "IN_PROGRESS":
      return "#e67e22";
    case "ARRIVED":
      return "#9b59b6";
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

const getStatusLabel = (status) => {
  const statusMap = {
    OPEN: "Đang mở",
    PAID: "Đang chờ thanh toán",
    PENDING_APPROVAL: "Chờ phê duyệt",
    IN_PROGRESS: "Đang đến",
    ARRIVED: "Đã đến",
    COMPLETED: "Đã hoàn thành công việc",
    CANCELLED: "Đã hủy",
    DONE: "Hoàn tất công việc",
    BOOKED: "Đã đặt lịch",
  };
  return statusMap[status.toUpperCase()] || "Không xác định";
};

const JobCard = ({ job, refreshJobs }) => {
  const [currentStatus, setCurrentStatus] = useState(job.status.toUpperCase());
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = (newStatus) => {
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc muốn cập nhật trạng thái thành '${getStatusLabel(
        newStatus
      )}' không?`,
      onOk: () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        fetch(`${BASE_URL}/cleaner/job/${newStatus}/${job.jobId}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`API responded with status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Status updated:", data);
            setCurrentStatus(newStatus.toUpperCase());
            message.success(
              `Đã cập nhật trạng thái thành ${getStatusLabel(newStatus)}`
            );
            sendNotification(
              job.customerId,
              `Người dọn ${localStorage.getItem("name")} cập nhật trạng thái: ${
                getStatusLabel(newStatus) || "Trạng thái"
              }`,
              "STATUS",
              "Customer"
            );
            if (refreshJobs) refreshJobs();
          })
          .catch((error) => {
            console.error("Error updating status:", error);
            message.error(
              "Không thể cập nhật trạng thái. Vui lòng thử lại sau."
            );
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const handleJobAction = (action) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");

    fetch(
      `${BASE_URL}/cleaner/job/${job.jobId}/accept-reject?action=${action}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Job ${action}ed:`, data);

        if (action === "accept") {
          Promise.all([
            createConversation(job.customerId, cleanerId),
            sendNotification(
              job.customerId,
              `Người dọn ${localStorage.getItem("name")} đã nhận dịch vụ: ${
                job.services[0]?.serviceName || "Dọn dẹp"
              }`,
              "BOOKED",
              "Customer"
            ),
          ])
            .then(([conversationData, notificationData]) => {
              console.log("Conversation created:", conversationData);
              console.log("Notification sent:", notificationData);
            })
            .catch((error) => {
              console.error("Error in post-acceptance operations:", error);
              message.error(
                "Có lỗi xảy ra khi xử lý sau khi chấp nhận công việc."
              );
            });
        } else if (action === "reject") {
          sendNotification(
            job.customerId,
            `Người dọn ${localStorage.getItem("name")} đã từ chối dịch vụ: ${
              job.services[0]?.serviceName || "Dọn dẹp"
            }`,
            "REJECTED",
            "Customer"
          )
            .then((notificationData) => {
              console.log("Rejection notification sent:", notificationData);
            })
            .catch((error) => {
              console.error("Error in sending rejection notification:", error);
              message.error("Có lỗi xảy ra khi gửi thông báo từ chối.");
            });
        }

        message.success(
          action === "accept"
            ? "Đã chấp nhận công việc"
            : "Đã từ chối công việc"
        );
        if (refreshJobs) refreshJobs();
      })
      .catch((error) => {
        console.error(`Error ${action}ing job:`, error);
        message.error(
          `Không thể ${
            action === "accept" ? "chấp nhận" : "từ chối"
          } công việc. Vui lòng thử lại sau.`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderServiceInfo = () => {
    if (!job.services) return "Không xác định";
    if (Array.isArray(job.services)) {
      return job.services.map((service, index) => (
        <div key={index}>
          {service.serviceName} ({service.areaRange})
        </div>
      ));
    }
    return `${job.services.serviceName || "Không xác định"} (${
      job.services.areaRange || "Không xác định"
    })`;
  };

  return (
    <article className={styles.jobCard}>
      <header className={styles.jobHeader}>
        <div>
          <h2 className={styles.jobTitle}>
            {job.services
              ? Array.isArray(job.services) && job.services.length > 1
                ? "Dịch vụ combo"
                : Array.isArray(job.services) && job.services.length === 1
                ? job.services[0].serviceName
                : !Array.isArray(job.services)
                ? job.services.serviceName || "Dịch vụ không xác định"
                : "Dịch vụ không xác định"
              : "Dịch vụ không xác định"}
          </h2>
          <div style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
            <div>Khách hàng: {job.customerName}</div>
            <div>SĐT: {job.customerPhone}</div>
          </div>
        </div>
        <span
          className={styles.status}
          style={{
            color: "#ffffff",
            backgroundColor: getStatusColor(currentStatus),
          }}
        >
          {getStatusLabel(currentStatus)}
        </span>
      </header>

      <section className={styles.jobDetails}>
        <div className={styles.detailItem}>
          <DollarOutlined style={{ fontSize: "20px", color: "#039855" }} />
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Thù lao</span>
            <strong className={styles.detailValue}>
              {job.totalPrice.toLocaleString()} VND
            </strong>
          </div>
        </div>

        <div className={styles.detailItem}>
          <HomeOutlined style={{ fontSize: "20px", color: "#039855" }} />
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Dịch vụ & Diện tích</span>
            <strong className={styles.detailValue}>
              {renderServiceInfo()}
            </strong>
          </div>
        </div>

        <div className={styles.detailItem}>
          <EnvironmentOutlined style={{ fontSize: "20px", color: "#039855" }} />
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Địa điểm</span>
            <strong className={styles.detailValue}>
              {job.customerAddress}
            </strong>
          </div>
        </div>

        <div className={styles.detailItem}>
          <ClockCircleOutlined style={{ fontSize: "20px", color: "#039855" }} />
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Thời gian</span>
            <strong className={styles.detailValue}>
              {new Date(job.scheduledTime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </section>

      <footer className={styles.actionButtons}>
        {job.status === "OPEN" && (
          <Button className={styles.cancelBtn}>Hủy công việc</Button>
        )}
        {job.status === "IN_PROGRESS" && (
          <Button
            className={styles.completeBtn}
            onClick={() => handleStatusUpdate("arrived")}
            loading={loading}
          >
            Đã đến nơi
          </Button>
        )}
        {job.status === "ARRIVED" && (
          <Button
            className={styles.completeBtn}
            onClick={() => handleStatusUpdate("completed")}
            loading={loading}
          >
            Đã hoàn thành
          </Button>
        )}
        {job.status === "BOOKED" && (
          <>
            <Button
              className={styles.cancelBtn}
              onClick={() => handleJobAction("reject")}
              loading={loading}
            >
              Từ chối
            </Button>
            <Button
              className={styles.completeBtn}
              onClick={() => handleJobAction("accept")}
              loading={loading}
            >
              Chấp nhận
            </Button>
          </>
        )}
      </footer>
    </article>
  );
};

export default JobCard;
