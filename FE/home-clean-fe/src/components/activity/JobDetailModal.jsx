import React, { useState, useEffect } from "react";
import { Modal, Button, Badge } from "antd";
import styles from "../activity/ActivityCard.module.css";
import {
  FaHourglassHalf,
  FaRunning,
  FaClipboardCheck,
  FaCheck,
  FaFlag,
  FaRegCommentAlt,
} from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";

export const JobDetailModal = ({
  isOpen,
  onClose,
  jobDetail,
  loading,
  handleDeleteJob,
  openReportModal,
  openFeedbackModal,
  openModal,
  handleViewCleanerDetail,
  handleCompleteJob,
  handleRetryPayment,
  applicationsCount,
  isProcessing,
}) => {
  const [localJobDetail, setLocalJobDetail] = useState(null);

  useEffect(() => {
    if (jobDetail) {
      setLocalJobDetail({ ...jobDetail });
    }
  }, [jobDetail]);

  if (!localJobDetail && !loading) {
    return null;
  }

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

  const getProgressStep = (status) => {
    switch (status) {
      case "OPEN":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "ARRIVED":
        return 3;
      case "COMPLETED":
      case "DONE":
        return 4;
      default:
        return 1;
    }
  };

  const ProgressIcon = ({ active, step }) => {
    const iconStyle = {
      fontSize: "20px",
      color: active ? "#fff" : "#ccc",
    };
    switch (step) {
      case 1:
        return <FaHourglassHalf style={iconStyle} />;
      case 2:
        return <FaRunning style={iconStyle} />;
      case 3:
        return <FaClipboardCheck style={iconStyle} />;
      case 4:
        return <FaCheck style={iconStyle} />;
      default:
        return <FaHourglassHalf style={iconStyle} />;
    }
  };

  const renderLoading = () => (
    <div style={{ textAlign: "center", padding: "40px 0" }}>Đang tải...</div>
  );

  const updateSubJobStatus = (jobId, newStatus) => {
    if (localJobDetail && localJobDetail.subJobs) {
      const updatedSubJobs = localJobDetail.subJobs.map((subJob) =>
        subJob.jobId === jobId ? { ...subJob, status: newStatus } : subJob
      );
      setLocalJobDetail({
        ...localJobDetail,
        subJobs: updatedSubJobs,
      });
    }
  };

  // Wrapper functions to update local state
  const handleDeleteJobWithUpdate = async (jobId) => {
    const result = await handleDeleteJob(jobId);
    // Close the modal after deletion - optional
    if (result !== false) {
      onClose();
    }
    return result;
  };

  const handleCompleteJobWithUpdate = async (jobId) => {
    const result = await handleCompleteJob(jobId);
    if (result !== false) {
      updateSubJobStatus(jobId, "DONE");
    }
    return result;
  };

  const handleRetryPaymentWithUpdate = async (jobId) => {
    return await handleRetryPayment(jobId);
  };

  const renderSubJob = (subJob, index) => {
    const progressStep = getProgressStep(subJob.status);

    return (
      <div key={index} className={styles.subJobItem}>
        <div className={styles.progressContainer}>
          <h3 className={styles.progressTitle}>Trạng thái triển khai</h3>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressStep} ${
                progressStep >= 1 ? styles.active : ""
              }`}
            >
              <div className={styles.progressIcon}>
                <ProgressIcon active={progressStep >= 1} step={1} />
              </div>
              <div className={styles.progressLabel}>
                <div>Tiếp nhận</div>
              </div>
            </div>
            <div
              className={`${styles.progressConnector} ${
                progressStep >= 2 ? styles.active : ""
              }`}
            ></div>
            <div
              className={`${styles.progressStep} ${
                progressStep >= 2 ? styles.active : ""
              }`}
            >
              <div className={styles.progressIcon}>
                <ProgressIcon active={progressStep >= 2} step={2} />
              </div>
              <div className={styles.progressLabel}>Cử nhân viên</div>
            </div>
            <div
              className={`${styles.progressConnector} ${
                progressStep >= 3 ? styles.active : ""
              }`}
            ></div>
            <div
              className={`${styles.progressStep} ${
                progressStep >= 3 ? styles.active : ""
              }`}
            >
              <div className={styles.progressIcon}>
                <ProgressIcon active={progressStep >= 3} step={3} />
              </div>
              <div className={styles.progressLabel}>Đến nơi</div>
            </div>
            <div
              className={`${styles.progressConnector} ${
                progressStep >= 4 ? styles.active : ""
              }`}
            ></div>
            <div
              className={`${styles.progressStep} ${
                progressStep >= 4 ? styles.active : ""
              }`}
            >
              <div className={styles.progressIcon}>
                <ProgressIcon active={progressStep >= 4} step={4} />
              </div>
              <div className={styles.progressLabel}>Hoàn tất</div>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <MdCalendarToday className={styles.icon} />
            <span>
              {new Date(subJob.scheduledTime).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className={styles.infoItem}>
            <MdAccessTime className={styles.icon} />
            <span>
              {new Date(subJob.scheduledTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className={styles.infoItem}>
            <MdLocationOn className={styles.icon} />
            <span>{localJobDetail.customerAddress}</span>
          </div>
        </div>
        <div className={styles.services}>
          <div className={styles.serviceDetails}>
            <div className={styles.serviceTitle}>
              {subJob.services[0]?.serviceName}
            </div>
            <div className={styles.serviceArea}>
              {subJob.services[0]?.serviceDetailAreaRange}
            </div>
          </div>
        </div>

        <div className={styles.statusAndPrice}>
          <div
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(subJob.status) }}
          >
            {getStatusText(subJob.status)}
          </div>
          <div className={styles.price}>
            <b>{subJob.totalPrice.toLocaleString("vi-VN")} VNĐ</b>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.footer}>
          <div className={styles.actionButtons}>
            {(subJob.status === "OPEN" ||
              subJob.status === "BOOKED" ||
              subJob.status === "IN_PROGRESS" ||
              subJob.status === "ARRIVED") && (
              <Button
                danger
                className={styles.cancelButton}
                onClick={() => handleDeleteJobWithUpdate(subJob.jobId)}
                disabled={isProcessing}
              >
                Huỷ việc
              </Button>
            )}
            {(subJob.status === "BOOKED" ||
              subJob.status === "IN_PROGRESS" ||
              subJob.status === "CANCELLED" ||
              subJob.status === "COMPLETED") && (
              <Button
                className={styles.reportButton}
                onClick={() => openReportModal(subJob.jobId)}
                danger
                icon={<FaFlag />}
              >
                Báo cáo
              </Button>
            )}
            {subJob.status === "DONE" && (
              <div className={styles.buttonGroup}>
                <Button
                  className={styles.reviewButton}
                  onClick={() => openFeedbackModal(subJob.jobId)}
                  icon={<FaRegCommentAlt />}
                >
                  Đánh giá
                </Button>
                <Button
                  className={styles.reportButton}
                  onClick={() => openReportModal(subJob.jobId)}
                  danger
                  icon={<FaFlag />}
                >
                  Báo cáo
                </Button>
              </div>
            )}
            {(subJob.status === "OPEN" || subJob.status === "BOOKED") &&
              applicationsCount[subJob.jobId] > 0 && (
                <Badge count={applicationsCount[subJob.jobId]} size="small">
                  <Button
                    type="primary"
                    className={styles.statusButton}
                    onClick={() => openModal(subJob.jobId)}
                  >
                    Người dọn dẹp đã ứng tuyển
                  </Button>
                </Badge>
              )}
            {(subJob.status === "DONE" ||
              subJob.status === "COMPLETED" ||
              subJob.status === "IN_PROGRESS") && (
              <Button
                type="default"
                onClick={() => handleViewCleanerDetail(subJob.cleanerId)}
                disabled={!subJob.cleanerId || isProcessing}
              >
                Xem chi tiết người dọn dẹp
              </Button>
            )}
            {subJob.status === "COMPLETED" && (
              <Button
                type="primary"
                className={styles.statusButton}
                onClick={() => handleCompleteJobWithUpdate(subJob.jobId)}
                disabled={isProcessing}
              >
                Xác nhận đã hoàn thành
              </Button>
            )}
            {subJob.status === "PAID" && (
              <Button
                type="primary"
                className={styles.statusButton}
                onClick={() => handleRetryPaymentWithUpdate(subJob.jobId)}
                disabled={isProcessing}
              >
                Thanh toán lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderJobDetail = () => {
    return (
      <div style={{ boxShadow: "none" }}>
        <div className={styles.cardContent}>
          {/* <div className={styles.orderCode}>
            <strong>Mã đơn hàng:</strong> {jobDetail.orderCode}
          </div> */}
          {/* <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <MdCalendarToday className={styles.icon} />
              <span>
                {new Date(jobDetail.scheduledTime).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className={styles.infoItem}>
              <MdAccessTime className={styles.icon} />
              <span>
                {new Date(jobDetail.scheduledTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className={styles.infoItem}>
              <MdLocationOn className={styles.icon} />
              <span>{jobDetail.customerAddress}</span>
            </div>
          </div> */}
          {/* <div className={styles.clientInfo}>
            <div className={styles.infoItem}>
              <strong>Khách hàng:</strong> {jobDetail.customerName}
            </div>
            <div className={styles.infoItem}>
              <strong>Số điện thoại:</strong> {jobDetail.customerPhone}
            </div>
          </div> */}
          {/* <div className={styles.services}>
            <h3>Chi tiết dịch vụ:</h3>
            {jobDetail.services &&
              jobDetail.services.map((service, idx) => (
                <div key={idx} className={styles.serviceDetails}>
                  <div className={styles.serviceTitle}>
                    {service.serviceName}
                  </div>
                  <div className={styles.serviceArea}>
                    {service.serviceDetailAreaRange}
                  </div>
                  <div className={styles.servicePrice}>
                    Giá: {service.serviceDetailPrice?.toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </div>
                  <div className={styles.serviceDescription}>
                    Mô tả: {service.serviceDescription}
                  </div>
                </div>
              ))}
          </div> */}
          {localJobDetail &&
            localJobDetail.subJobs &&
            localJobDetail.subJobs.length > 0 && (
              <div className={styles.subJobs}>
                {/* <h3>Lịch đặt:</h3> */}
                {localJobDetail.subJobs.map((subJob, idx) =>
                  renderSubJob(subJob, idx)
                )}
              </div>
            )}
          {/* <div className={styles.statusAndPrice}>
            <div
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(jobDetail.status) }}
            >
              {getStatusText(jobDetail.status)}
            </div>
            <div className={styles.price}>
              <b>Tổng: {jobDetail.totalPrice?.toLocaleString("vi-VN")} VNĐ</b>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  return (
    <Modal
      title="Chi tiết công việc"
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      {loading ? renderLoading() : renderJobDetail()}
    </Modal>
  );
};
