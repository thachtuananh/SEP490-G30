import React, { useEffect, useState, useContext } from "react";
import {
  Modal,
  List,
  Button,
  Table,
  message,
  Empty,
  Badge,
  Pagination,
} from "antd";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import {
  FaRegCommentAlt,
  FaRulerHorizontal,
  FaFlag,
  FaCheck,
  FaHourglassHalf,
  FaRunning,
  FaClipboardCheck,
} from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchCleanerApplications,
  fetchCleanerDetail,
  hireCleaner,
  startJob,
  completeJob,
  deleteJobPosting,
  rejectCleaner,
} from "../../services/owner/StatusJobAPI";
import { FeedbackModal } from "../../components/activity/FeedbackModal";
import { createConversation } from "../../services/ChatService";
import { sendNotification } from "../../services/NotificationService";
import { ReportModal } from "../../components/activity/ReportModal";

export const ActivityCard = ({ data, onDelete }) => {
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cleanerList, setCleanerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const { customerId } = useContext(AuthContext);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState({});
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedJobIdForFeedback, setSelectedJobIdForFeedback] =
    useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedJobIdForReport, setSelectedJobIdForReport] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // Initialize activities from props
  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

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
      case "COMPLETED":
        return "Người nhận việc đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "AUTO_CANCELLED":
        return "Đã hủy do quá thời gian";
      case "DONE":
        return "Hoàn tất công việc";
      case "BOOKED":
        return "Đã đặt lịch";
      default:
        return "Không xác định";
    }
  };

  // Get current progress step based on status
  const getProgressStep = (status) => {
    switch (status) {
      case "OPEN":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "COMPLETED":
        return 3;
      case "DONE":
        return 4;
      default:
        return 1;
    }
  };

  // Fetch cleaner applications
  const fetchCleaners = async (jobId) => {
    setLoading(true);
    try {
      const data = await fetchCleanerApplications(customerId, jobId);
      setCleanerList(data);
      setApplicationsCount((prev) => ({
        ...prev,
        [jobId]: data.length,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách Cleaner");
      setCleanerList([]);
      setApplicationsCount((prev) => ({
        ...prev,
        [jobId]: 0,
      }));
    }
    setLoading(false);
  };

  // Fetch application counts for all OPEN jobs on component mount
  useEffect(() => {
    if (activities && activities.length > 0) {
      activities.forEach(async (activity) => {
        if (activity.status === "OPEN") {
          try {
            const applications = await fetchCleanerApplications(
              customerId,
              activity.jobId
            );
            setApplicationsCount((prev) => ({
              ...prev,
              [activity.jobId]: applications.length,
            }));
          } catch (error) {
            console.error("Lỗi khi lấy số lượng ứng viên:", error);
            setApplicationsCount((prev) => ({
              ...prev,
              [activity.jobId]: 0,
            }));
          }
        }
      });
    }
  }, [activities, customerId]);

  // Fetch cleaner details
  const handleFetchCleanerDetail = async (cleanerId) => {
    setLoading(true);
    try {
      const data = await fetchCleanerDetail(cleanerId);
      setSelectedCleaner(data);
    } catch (error) {
      message.error("Không thể tải thông tin Cleaner");
      setSelectedCleaner(null);
    }
    setLoading(false);
  };

  // Open cleaner modal
  const openModal = (jobId) => {
    setIsModalOpen(true);
    fetchCleaners(jobId);
    setSelectedJobId(jobId);
  };

  // Open feedback modal
  const openFeedbackModal = (jobId) => {
    setSelectedJobIdForFeedback(jobId);
    setIsFeedbackModalOpen(true);
  };

  // Open report modal
  const openReportModal = (jobId) => {
    setSelectedJobIdForReport(jobId);
    setIsReportModalOpen(true);
  };

  // Close feedback modal
  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedJobIdForFeedback(null);
  };

  //close report modal
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedJobIdForReport(null);
  };

  // Update activity status locally
  const updateActivityStatus = (jobId, newStatus) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.jobId === jobId ? { ...activity, status: newStatus } : activity
      )
    );
  };

  // Hire a cleaner
  const handleHireCleaner = async (jobId, cleanerId, customerId) => {
    if (!jobId) {
      console.error("Không tìm thấy jobId!");
      return;
    }

    try {
      // First, hire the cleaner
      await hireCleaner(jobId, cleanerId, customerId);

      // Then create a conversation
      await createConversation(customerId, cleanerId);

      console.log("Thuê cleaner thành công!", { jobId, cleanerId, customerId });
      message.success("Thuê cleaner thành công!");
      sendNotification(
        cleanerId,
        `Chúc mừng, người thuê ${localStorage.getItem(
          "name"
        )} đã chấp nhận công việc`,
        "BOOKED",
        "Cleaner"
      );
      updateActivityStatus(jobId, "IN_PROGRESS");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thuê cleaner:", error);
      message.error("Lỗi khi thuê cleaner");
    }
  };

  // Handle reject cleaner
  const handleRejectCleaner = async (jobId, cleanerId, customerId) => {
    try {
      await rejectCleaner(jobId, cleanerId, customerId);
      console.log("Từ chối cleaner thành công!", {
        jobId,
        cleanerId,
        customerId,
      });
      message.success("Từ chối cleaner thành công!");
      sendNotification(
        cleanerId,
        `Rất tiếc, người thuê ${localStorage.getItem(
          "name"
        )} từ chối công việc`,
        "BOOKED",
        "Cleaner"
      );
      // Refresh cleaner list
      fetchCleaners(jobId);
    } catch (error) {
      console.error("Lỗi khi từ chối cleaner:", error);
      message.error("Lỗi khi từ chối cleaner");
    }
  };

  // Start a job
  const handleStartJob = async (jobId) => {
    try {
      await startJob(jobId, customerId);
      message.success("✅ Công việc đã bắt đầu!");
      updateActivityStatus(jobId, "STARTED");
    } catch (error) {
      console.error("❌ Lỗi khi bắt đầu công việc:", error);
      message.error("❌ Không thể bắt đầu công việc.");
    }
  };

  // Complete a job
  const handleCompleteJob = async (jobId) => {
    try {
      await completeJob(jobId);
      message.success("Công việc đã hoàn thành!");
      updateActivityStatus(jobId, "DONE");
    } catch (error) {
      console.error("Lỗi khi hoàn thành công việc:", error);
      message.error("Không thể hoàn thành công việc.");
    }
  };

  // Handle delete job posting with local state update
  const handleDeleteJob = (jobId) => {
    Modal.confirm({
      title: "Xác nhận huỷ việc",
      content: "Bạn có chắc chắn muốn huỷ công việc này không?",
      okText: "Đồng ý",
      cancelText: "Huỷ bỏ",
      onOk: async () => {
        try {
          // Use the deleteJobPosting function imported at the top
          await deleteJobPosting(jobId, customerId);

          // Remove deleted job from local state
          setActivities((prevActivities) =>
            prevActivities.filter((activity) => activity.jobId !== jobId)
          );

          message.success("Huỷ việc thành công");

          // Send notification if needed (assuming you have the cleaner ID)
          const activity = activities.find((a) => a.jobId === jobId);
          if (activity && activity.cleanerId) {
            sendNotification(
              activity.cleanerId,
              `Người thuê ${localStorage.getItem("name")} đã huỷ công việc`,
              "CANCELLED",
              "Cleaner"
            );
          }
        } catch (error) {
          console.error("❌ Lỗi khi huỷ công việc:", error);
          message.error("Không thể huỷ công việc");
        }
      },
    });
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
          style={{ width: 40, borderRadius: "50%" }}
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
      key: "actions",
      render: (_, record) => (
        <Button
          type="default"
          onClick={() => handleFetchCleanerDetail(record.cleanerId)}
          disabled={!record.cleanerId}
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
              handleHireCleaner(selectedJobId, record.cleanerId, customerId)
            }
            disabled={!record.cleanerId}
          >
            Thuê
          </Button>
          <Button
            danger
            onClick={() =>
              handleRejectCleaner(selectedJobId, record.cleanerId, customerId)
            }
            disabled={!record.cleanerId}
          >
            Từ chối
          </Button>
        </>
      ),
    },
  ];

  // Calculate pagination
  const indexOfLastActivity = currentPage * pageSize;
  const indexOfFirstActivity = indexOfLastActivity - pageSize;
  const currentActivities = activities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );
  const totalActivities = activities.length;

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  // Progress bar status icons
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

  return (
    <div className={styles.cardlist}>
      <div className={styles.container}>
        {currentActivities.map((activity, index) => {
          const progressStep = getProgressStep(activity.status);

          return (
            <div key={index} className={styles.card}>
              {/* Progress Status Bar */}
              <div className={styles.progressContainer}>
                <h3 className={styles.progressTitle}>Trạng thái triển khai</h3>
                <div className={styles.progressBar}>
                  {/* Step 1: Waiting for Cleaner */}
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
                      {/* <div className={styles.progressDate}>
                        {new Date(activity.scheduledTime).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div> */}
                    </div>
                  </div>

                  {/* Connector line */}
                  <div
                    className={`${styles.progressConnector} ${
                      progressStep >= 2 ? styles.active : ""
                    }`}
                  ></div>

                  {/* Step 2: Cleaner Arriving */}
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

                  {/* Connector line */}
                  <div
                    className={`${styles.progressConnector} ${
                      progressStep >= 3 ? styles.active : ""
                    }`}
                  ></div>

                  {/* Step 3: Cleaner Completed */}
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

                  {/* Connector line */}
                  <div
                    className={`${styles.progressConnector} ${
                      progressStep >= 4 ? styles.active : ""
                    }`}
                  ></div>

                  {/* Step 4: Job Completed */}
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

              <div className={styles.cardContent}>
                <div className={styles.header}>
                  {activity.services &&
                    activity.services.map((service, idx) => (
                      <div key={idx} className={styles.serviceItem}>
                        <h3>{service.serviceName}</h3>
                      </div>
                    ))}
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <MdCalendarToday className={styles.icon} />
                    <span>
                      {new Date(activity.scheduledTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <MdAccessTime className={styles.icon} />
                    <span>
                      {new Date(activity.scheduledTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <MdLocationOn className={styles.icon} />
                    <span>{activity.customerAddress}</span>
                  </div>
                </div>

                <div className={styles.services}>
                  {activity.services &&
                    activity.services.map((service, idx) => (
                      <div key={idx} className={styles.serviceDetails}>
                        <div className={styles.serviceTitle}>
                          {service.serviceName}
                        </div>
                        <div className={styles.serviceArea}>
                          {service.serviceDetailAreaRange}
                        </div>
                      </div>
                    ))}
                </div>

                <div className={styles.statusAndPrice}>
                  <div
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(activity.status) }}
                  >
                    {getStatusText(activity.status)}
                  </div>

                  <div className={styles.price}>
                    <b>{activity.totalPrice.toLocaleString("vi-VN")} VNĐ</b>
                  </div>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.footer}>
                <div className={styles.actionButtons}>
                  {(activity.status === "OPEN" ||
                    activity.status === "BOOKED" ||
                    activity.status === "IN_PROGRESS") && (
                    <Button
                      danger
                      className={styles.cancelButton}
                      onClick={() => handleDeleteJob(activity.jobId)}
                    >
                      Huỷ việc
                    </Button>
                  )}

                  {activity.status === "DONE" && (
                    <div className={styles.buttonGroup}>
                      <Button
                        className={styles.reviewButton}
                        onClick={() => openFeedbackModal(activity.jobId)}
                        icon={<FaRegCommentAlt />}
                      >
                        Xem đánh giá
                      </Button>

                      <Button
                        className={styles.reportButton}
                        onClick={() => openReportModal(activity.jobId)}
                        danger
                        icon={<FaFlag />}
                      >
                        Báo cáo
                      </Button>
                    </div>
                  )}

                  {(activity.status === "OPEN" ||
                    activity.status === "BOOKED") &&
                    applicationsCount[activity.jobId] > 0 && (
                      <Badge
                        count={applicationsCount[activity.jobId]}
                        size="small"
                      >
                        <Button
                          type="primary"
                          className={styles.statusButton}
                          onClick={() => openModal(activity.jobId)}
                        >
                          Xem thông tin Cleaner
                        </Button>
                      </Badge>
                    )}

                  {activity.status === "COMPLETED" && (
                    <Button
                      type="primary"
                      className={styles.statusButton}
                      onClick={() => handleCompleteJob(activity.jobId)}
                    >
                      Đã hoàn thành
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalActivities > pageSize && (
        <div className={styles.paginationContainer}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalActivities}
            onChange={handleChangePage}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Cleaner List Modal */}
      <Modal
        title="Danh sách Cleaner"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCleaner(null);
        }}
        width={1050}
        footer={null}
      >
        {selectedCleaner ? (
          <>
            <InfoCleanerCard cleaner={selectedCleaner} />
            <Button onClick={() => setSelectedCleaner(null)}>Quay lại</Button>
          </>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            Đang tải...
          </div>
        ) : cleanerList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có Cleaner nào nhận việc"
          />
        ) : (
          <Table
            dataSource={cleanerList}
            columns={columns}
            rowKey="cleanerId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="Chưa có Cleaner nào nhận việc" />,
            }}
          />
        )}
      </Modal>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={isFeedbackModalOpen}
        jobId={selectedJobIdForFeedback}
        customerId={customerId}
        onClose={closeFeedbackModal}
      />

      {/* Report Modal */}
      <ReportModal
        visible={isReportModalOpen}
        jobId={selectedJobIdForReport}
        customerId={customerId}
        onClose={closeReportModal}
      />
    </div>
  );
};
