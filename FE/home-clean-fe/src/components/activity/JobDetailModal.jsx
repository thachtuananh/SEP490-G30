import React, { useState, useEffect } from "react";
import { Modal, Button, Badge, message, Table, Empty } from "antd";
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
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import { InfoCleanerCardDetail } from "../activity/InfoCleanerCardDetail";

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
  fetchCleanerApplications,
  fetchCleanerDetail,
  hireCleaner,
  startJob,
  rejectCleaner,
  applicationsCount,
  isProcessing,
  customerId,
}) => {
  const [localJobDetail, setLocalJobDetail] = useState(null);
  const [cleanerList, setCleanerList] = useState({});
  const [isCleanerListModalOpen, setIsCleanerListModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [cleanerListLoading, setCleanerListLoading] = useState(false);
  const [isCleanerDetailModalOpen, setIsCleanerDetailModalOpen] =
    useState(false);

  useEffect(() => {
    if (jobDetail) {
      setLocalJobDetail({ ...jobDetail });
      // Fetch cleaner applications for each sub-job with OPEN or BOOKED status
      if (jobDetail.subJobs) {
        jobDetail.subJobs.forEach((subJob) => {
          if (subJob.status === "OPEN") {
            fetchApplicationsForSubJob(subJob.jobId);
          }
        });
      } else if (jobDetail.status === "OPEN") {
        // Fetch applications for single job if no subJobs
        fetchApplicationsForSubJob(jobDetail.jobId);
      }
    }
  }, [jobDetail]);

  const fetchApplicationsForSubJob = async (jobId) => {
    try {
      const data = await fetchCleanerApplications(customerId, jobId);
      setCleanerList((prev) => ({
        ...prev,
        [jobId]: data,
      }));
    } catch (error) {
      console.error("Error fetching cleaner applications:", error);
      message.error("Không thể tải danh sách người dọn dẹp");
      setCleanerList((prev) => ({
        ...prev,
        [jobId]: [],
      }));
    }
  };

  const fetchCleanersForModal = async (jobId) => {
    setCleanerListLoading(true);
    try {
      const data = await fetchCleanerApplications(customerId, jobId);
      setCleanerList((prev) => ({
        ...prev,
        [jobId]: data,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách người dọn dẹp");
      setCleanerList((prev) => ({
        ...prev,
        [jobId]: [],
      }));
    }
    setCleanerListLoading(false);
  };

  const handleFetchCleanerDetail = async (cleanerId) => {
    setCleanerListLoading(true);
    try {
      const data = await fetchCleanerDetail(cleanerId);
      setSelectedCleaner(data);
    } catch (error) {
      message.error("Không thể tải thông tin người dọn dẹp");
      setSelectedCleaner(null);
    }
    setCleanerListLoading(false);
  };

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
    } else {
      setLocalJobDetail({
        ...localJobDetail,
        status: newStatus,
      });
    }
  };

  const handleDeleteJobWithUpdate = async (jobId) => {
    const result = await handleDeleteJob(jobId);
    if (result !== false) {
      updateSubJobStatus(jobId, "CANCELLED");
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
    const result = await handleRetryPayment(jobId);
    if (result && result.paymentUrl) {
      let countDown = 3;
      const messageKey = "redirectCountdown";

      message.info({
        content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
        key: messageKey,
        duration: 3.5,
      });

      const interval = setInterval(() => {
        countDown -= 1;
        message.info({
          content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
          key: messageKey,
          duration: 1.5,
        });

        if (countDown === 0) {
          clearInterval(interval);
        }
      }, 1000);
      setTimeout(() => {
        window.location.href = result.paymentUrl;
      }, 3000);
    }
    return result;
  };

  const handleHireCleanerWithUpdate = async (jobId, cleanerId) => {
    if (isProcessing) return;
    try {
      await hireCleaner(jobId, cleanerId, customerId);
      message.success("Thuê người dọn dẹp thành công!");
      updateSubJobStatus(jobId, "IN_PROGRESS");
      fetchApplicationsForSubJob(jobId);
      setIsCleanerListModalOpen(false);
    } catch (error) {
      console.error("Error hiring cleaner:", error);
      message.error("Không thể thuê người dọn dẹp");
    }
  };

  const handleRejectCleanerWithUpdate = async (jobId, cleanerId) => {
    try {
      await rejectCleaner(jobId, cleanerId, customerId);
      message.success("Từ chối người siano dọn dẹp thành công!");
      fetchApplicationsForSubJob(jobId);
    } catch (error) {
      console.error("Error rejecting cleaner:", error);
      message.error("Không thể từ chối người dọn dẹp");
    }
  };

  const handleStartJobWithUpdate = async (jobId) => {
    try {
      await startJob(jobId, customerId);
      message.success("Công việc đã bắt đầu!");
      updateSubJobStatus(jobId, "ARRIVED");
    } catch (error) {
      console.error("Error starting job:", error);
      message.error("Không thể bắt đầu công việc");
    }
  };

  const openCleanerListModal = (jobId) => {
    setSelectedJobId(jobId);
    fetchCleanersForModal(jobId);
    setIsCleanerListModalOpen(true);
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "profileImage",
      key: "profileImage",
      render: (base64) => (
        <img
          src={`data:image/png;base64,${base64}`}
          alt="Avatar"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
      ),
    },
    {
      title: "Tên người dọn",
      dataIndex: "cleanerName",
      key: "cleanerName",
    },
    {
      title: "Xem thông tin",
      key: "view",
      render: (_, record) => (
        <Button
          type="default"
          onClick={() => handleFetchCleanerDetail(record.cleanerId)}
          disabled={!record.cleanerId || isProcessing}
        >
          Xem
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() =>
              handleHireCleanerWithUpdate(selectedJobId, record.cleanerId)
            }
            disabled={!record.cleanerId || isProcessing}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            onClick={() =>
              handleRejectCleanerWithUpdate(selectedJobId, record.cleanerId)
            }
            disabled={!record.cleanerId || isProcessing}
          >
            Từ chối
          </Button>
        </>
      ),
    },
  ];

  const renderSubJob = (subJob, index) => {
    const progressStep = getProgressStep(subJob.status);
    const cleaners = cleanerList[subJob.jobId] || [];

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
                disabled={isProcessing}
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
                  disabled={isProcessing}
                >
                  Đánh giá
                </Button>
                <Button
                  className={styles.reportButton}
                  onClick={() => openReportModal(subJob.jobId)}
                  danger
                  icon={<FaFlag />}
                  disabled={isProcessing}
                >
                  Báo cáo
                </Button>
              </div>
            )}
            {subJob.status === "OPEN" &&
              applicationsCount[subJob.jobId] > 0 && (
                <Badge count={applicationsCount[subJob.jobId]} size="small">
                  <Button
                    type="primary"
                    className={styles.statusButton}
                    onClick={() => openCleanerListModal(subJob.jobId)}
                    disabled={isProcessing}
                  >
                    Người dọn dẹp đã ứng tuyển
                  </Button>
                </Badge>
              )}
            {(subJob.status === "DONE" ||
              subJob.status === "COMPLETED" ||
              subJob.status === "IN_PROGRESS" ||
              subJob.status === "ARRIVED") && (
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

  const renderService = (service, index, jobDetail) => {
    const progressStep = getProgressStep(jobDetail.status);
    const cleaners = cleanerList[jobDetail.jobId] || [];

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
        </div>
        <div className={styles.services}>
          <div className={styles.serviceDetails}>
            <div className={styles.serviceTitle}>{service.serviceName}</div>
            <div className={styles.serviceArea}>
              {service.serviceDetailAreaRange}
            </div>
          </div>
        </div>

        <div className={styles.statusAndPrice}>
          <div
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(jobDetail.status) }}
          >
            {getStatusText(jobDetail.status)}
          </div>
          <div className={styles.price}>
            <b>{jobDetail.totalPrice.toLocaleString("vi-VN")} VNĐ</b>
          </div>
        </div>

        <div className={styles.divider}></div>
        <div className={styles.footer}>
          <div className={styles.actionButtons}>
            {(jobDetail.status === "OPEN" ||
              jobDetail.status === "BOOKED" ||
              jobDetail.status === "IN_PROGRESS" ||
              jobDetail.status === "ARRIVED") && (
              <Button
                danger
                className={styles.cancelButton}
                onClick={() => handleDeleteJobWithUpdate(jobDetail.jobId)}
                disabled={isProcessing}
              >
                Huỷ việc
              </Button>
            )}
            {(jobDetail.status === "BOOKED" ||
              jobDetail.status === "IN_PROGRESS" ||
              jobDetail.status === "CANCELLED" ||
              jobDetail.status === "COMPLETED") && (
              <Button
                className={styles.reportButton}
                onClick={() => openReportModal(jobDetail.jobId)}
                danger
                icon={<FaFlag />}
                disabled={isProcessing}
              >
                Báo cáo
              </Button>
            )}
            {jobDetail.status === "DONE" && (
              <div className={styles.buttonGroup}>
                <Button
                  className={styles.reviewButton}
                  onClick={() => openFeedbackModal(jobDetail.jobId)}
                  icon={<FaRegCommentAlt />}
                  disabled={isProcessing}
                >
                  Đánh giá
                </Button>
                <Button
                  className={styles.reportButton}
                  onClick={() => openReportModal(jobDetail.jobId)}
                  danger
                  icon={<FaFlag />}
                  disabled={isProcessing}
                >
                  Báo cáo
                </Button>
              </div>
            )}
            {jobDetail.status === "OPEN" &&
              applicationsCount[jobDetail.jobId] > 0 && (
                <Badge count={applicationsCount[jobDetail.jobId]} size="small">
                  <Button
                    type="primary"
                    className={styles.statusButton}
                    onClick={() => openCleanerListModal(jobDetail.jobId)}
                    disabled={isProcessing}
                  >
                    Người dọn dẹp đã ứng tuyển
                  </Button>
                </Badge>
              )}
            {(jobDetail.status === "DONE" ||
              jobDetail.status === "COMPLETED" ||
              jobDetail.status === "IN_PROGRESS" ||
              jobDetail.status === "ARRIVED") && (
              <Button
                type="default"
                onClick={() => handleViewCleanerDetail(jobDetail.cleanerId)}
                disabled={!jobDetail.cleanerId || isProcessing}
              >
                Xem chi tiết người dọn dẹp
              </Button>
            )}
            {jobDetail.status === "COMPLETED" && (
              <Button
                type="primary"
                className={styles.statusButton}
                onClick={() => handleCompleteJobWithUpdate(jobDetail.jobId)}
                disabled={isProcessing}
              >
                Xác nhận đã hoàn thành
              </Button>
            )}
            {jobDetail.status === "PAID" && (
              <Button
                type="primary"
                className={styles.statusButton}
                onClick={() => handleRetryPaymentWithUpdate(jobDetail.jobId)}
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
    if (!localJobDetail) return null;

    const isGroupJob = String(localJobDetail.jobId).startsWith("JG");

    return (
      <div style={{ boxShadow: "none" }}>
        <div className={styles.cardContent}>
          {isGroupJob &&
          localJobDetail.subJobs &&
          localJobDetail.subJobs.length > 0 ? (
            <div className={styles.subJobs}>
              {localJobDetail.subJobs.map((subJob, idx) =>
                renderSubJob(subJob, idx)
              )}
            </div>
          ) : localJobDetail.services && localJobDetail.services.length > 0 ? (
            <div className={styles.subJobs}>
              {localJobDetail.services.map((service, idx) =>
                renderService(service, idx, localJobDetail)
              )}
            </div>
          ) : (
            <Empty description="Không có thông tin dịch vụ hoặc công việc phụ" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
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
      <Modal
        title="Danh sách người dọn dẹp"
        open={isCleanerListModalOpen}
        onCancel={() => {
          setIsCleanerListModalOpen(false);
          setSelectedCleaner(null);
          setSelectedJobId(null);
        }}
        width={1050}
        footer={null}
      >
        {selectedCleaner ? (
          <>
            <InfoCleanerCard cleaner={selectedCleaner} />
            <Button onClick={() => setSelectedCleaner(null)}>Quay lại</Button>
          </>
        ) : cleanerListLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            Đang tải...
          </div>
        ) : (cleanerList[selectedJobId] || []).length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có Cleaner nào nhận việc"
          />
        ) : (
          <Table
            dataSource={cleanerList[selectedJobId] || []}
            columns={columns}
            rowKey="cleanerId"
            loading={cleanerListLoading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="Chưa có Cleaner nào nhận việc" />,
            }}
          />
        )}
      </Modal>
      <Modal
        title="Chi tiết người dọn dẹp"
        open={isCleanerDetailModalOpen}
        onCancel={() => {
          setIsCleanerDetailModalOpen(false);
          setSelectedCleaner(null);
        }}
        width={1050}
        footer={[
          ...(localJobDetail?.subJobs?.find(
            (subJob) => subJob.cleanerId === selectedCleaner?.cleanerId
          )?.status === "DONE" || localJobDetail?.status === "DONE"
            ? [
                <Button
                  type="primary"
                  key="reorder"
                  onClick={() => {
                    window.location.href = `/cleaner/${selectedCleaner?.cleanerId}`;
                  }}
                >
                  Đặt lại dịch vụ
                </Button>,
              ]
            : []),
          <Button key="back" onClick={() => setIsCleanerDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {cleanerListLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            Đang tải...
          </div>
        ) : selectedCleaner ? (
          <InfoCleanerCardDetail cleaner={selectedCleaner} />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy thông tin người dọn dẹp"
          />
        )}
      </Modal>
    </>
  );
};
