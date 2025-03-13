import React, { useState } from "react";
import { Modal, List, Button, Table, message } from "antd";
import styles from "./JobList.module.css";

const getStatusColor = (status) => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case "OPEN": return "#3498db";
    case "PENDING_APPROVAL": return "#f1c40f";
    case "IN_PROGRESS": return "#e67e22";
    case "ARRIVED": return "#9b59b6";
    case "STARTED": return "#2980b9";
    case "COMPLETED": return "#2ecc71";
    case "CANCELLED": return "#e74c3c";
    case "DONE": return "#27ae60";
    case "BOOKED": return "#8e44ad";
    default: return "#bdc3c7";
  }
};
const getStatusLabel = (status) => {
  const statusMap = {
    OPEN: "Đang mở",
    PENDING_APPROVAL: "Chờ phê duyệt",
    IN_PROGRESS: "Đang đến ",
    ARRIVED: "Đã đến nơi",
    STARTED: "Bắt đầu làm việc",
    COMPLETED: "Đã hoàn thành công việc",
    CANCELLED: "Đã hủy",
    DONE: "Hoàn tất công việc",
    BOOKED: "Đã đặt lịch",
  };
  return statusMap[status.toUpperCase()] || "Không xác định";
};

const JobCard = ({ job }) => {

  const [currentStatus, setCurrentStatus] = useState(job.status.toUpperCase());

  const handleStatusUpdate = (newStatus) => {
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc muốn cập nhật trạng thái thành '${getStatusLabel(newStatus)}' không?`,
      onOk: () => {
        const token = localStorage.getItem("token");
        fetch(`http://localhost:8080/api/cleaner/job/${newStatus}/${job.jobId}`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Status updated:", data);
            setCurrentStatus(newStatus.toUpperCase());
          })
          .catch((error) => console.error("Error updating status:", error));
      },
    });
  };




  return (
    <article className={styles.jobCard}>
      <header className={styles.jobHeader}>
        <h2 className={styles.jobTitle}>
          {job.services
            ? (Array.isArray(job.services)
              ? job.services.map(service => service.serviceName).join(", ")
              : job.services.serviceName || "Unnamed Service")
            : "Unnamed Service"}
        </h2>
        <span className={styles.status} style={{ color: getStatusColor(currentStatus) }}>
          {getStatusLabel(currentStatus)}
        </span>

      </header>

      <section className={styles.jobDetails}>
        <div className={styles.detailItem}>
          <div>
            <svg
              width="51"
              height="51"
              viewBox="0 0 51 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.75 25.5C6.75 28.0115 7.23498 30.4985 8.17726 32.8188C9.11953 35.1392 10.5006 37.2475 12.2417 39.0234C13.9828 40.7993 16.0498 42.2081 18.3247 43.1692C20.5995 44.1303 23.0377 44.625 25.5 44.625C27.9623 44.625 30.4005 44.1303 32.6753 43.1692C34.9502 42.2081 37.0172 40.7993 38.7582 39.0234C40.4993 37.2475 41.8805 35.1392 42.8227 32.8188C43.765 30.4985 44.25 28.0115 44.25 25.5C44.25 22.9885 43.765 20.5015 42.8227 18.1812C41.8805 15.8608 40.4993 13.7525 38.7582 11.9766C37.0172 10.2007 34.9502 8.79193 32.6753 7.8308C30.4005 6.86968 27.9623 6.375 25.5 6.375C23.0377 6.375 20.5995 6.86968 18.3247 7.8308C16.0498 8.79193 13.9828 10.2007 12.2417 11.9766C10.5006 13.7525 9.11953 15.8608 8.17726 18.1812C7.23498 20.5015 6.75 22.9885 6.75 25.5Z"
                stroke="#039855"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M31.3333 19.125C30.9559 18.4572 30.4076 17.9067 29.747 17.5324C29.0865 17.1581 28.3386 16.9741 27.5833 17H23.4167C22.3116 17 21.2518 17.4478 20.4704 18.2448C19.689 19.0418 19.25 20.1228 19.25 21.25C19.25 22.3772 19.689 23.4582 20.4704 24.2552C21.2518 25.0522 22.3116 25.5 23.4167 25.5H27.5833C28.6884 25.5 29.7482 25.9478 30.5296 26.7448C31.311 27.5418 31.75 28.6228 31.75 29.75C31.75 30.8772 31.311 31.9582 30.5296 32.7552C29.7482 33.5522 28.6884 34 27.5833 34H23.4167C22.6614 34.0259 21.9135 33.8419 21.253 33.4676C20.5924 33.0933 20.0441 32.5428 19.6667 31.875M25.5 14.875V36.125"
                stroke="#039855"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Thù lao</span>
            <strong className={styles.detailValue}>{job.totalPrice.toLocaleString()} VND</strong>
          </div>
        </div>

        <div className={styles.detailItem}>
          <div>
            <svg
              width="51"
              height="51"
              viewBox="0 0 51 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.5 4.25C30.5723 4.25 35.4368 6.26495 39.0234 9.85158C42.61 13.4382 44.625 18.3027 44.625 23.375C44.625 29.9072 41.0635 35.2538 37.3108 39.0894C35.4358 40.985 33.39 42.7036 31.1993 44.2234L30.294 44.8396L29.869 45.1222L29.0679 45.6323L28.3539 46.0679L27.4699 46.5821C26.8698 46.9246 26.1909 47.1047 25.5 47.1047C24.8091 47.1047 24.1302 46.9246 23.5301 46.5821L22.6461 46.0679L21.5411 45.3879L21.1331 45.1222L20.2619 44.5421C17.8985 42.9431 15.6972 41.1168 13.6892 39.0894C9.9365 35.2516 6.375 29.9072 6.375 23.375C6.375 18.3027 8.38995 13.4382 11.9766 9.85158C15.5632 6.26495 20.4277 4.25 25.5 4.25Z"
                fill="#039855"
              />
              <circle cx="25" cy="24" r="8" fill="white" />
            </svg>
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Địa điểm</span>
            <strong className={styles.detailValue}>{job.customerAddress}</strong>
          </div>
        </div>

        <div className={styles.detailItem}>
          <div>
            <svg
              width="52"
              height="51"
              viewBox="0 0 52 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="26" cy="25.5" r="21.75" fill="#039855" />
              <line x1="26" y1="12" x2="26" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="26" y1="26" x2="35" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
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
          <Button type="primary">Hủy công việc</Button>
        )}
        {job.status === "IN_PROGRESS" && (
          <Button type="primary" onClick={() => handleStatusUpdate("arrived")}>Đã tới</Button>
        )}
        {job.status === "STARTED" && (
          <Button type="primary" onClick={() => handleStatusUpdate("completed")}>Hoàn thành công việc</Button>
        )}

      </footer>
    </article>
  );
};

export default JobCard;
