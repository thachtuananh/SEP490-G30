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
import { InfoCleanerCardDetail } from "../activity/InfoCleanerCardDetail";
import { JobDetailModal } from "./JobDetailModal"; // Import JobDetailModal
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
  retryPayment,
} from "../../services/owner/StatusJobAPI";
import { FeedbackModal } from "../../components/activity/FeedbackModal";
import { createConversation } from "../../services/ChatService";
import { sendNotification } from "../../services/NotificationService";
import { ReportModal } from "../../components/activity/ReportModal";
import { sendSms } from "../../services/SMSService";
import { BASE_URL } from "../../utils/config";

export const ActivityCard = ({ data, onDelete }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
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
  const [isCleanerDetailModalOpen, setIsCleanerDetailModalOpen] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchOrderCode, setSearchOrderCode] = useState("");
  // Thêm state cho JobDetailModal
  const [isJobDetailModalOpen, setIsJobDetailModalOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  const customerName = sessionStorage.getItem("name");
  const customerPhone = sessionStorage.getItem("phone");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // Initialize activities from props
  useEffect(() => {
    if (data) {
      setActivities(data);
      applyFilters(data, statusFilter, searchOrderCode);
    }
  }, [data]);

  useEffect(() => {
    applyFilters(activities, statusFilter, searchOrderCode);
  }, [statusFilter, searchOrderCode]);

  const applyFilters = (data, status, orderCode) => {
    let result = [...data];

    if (status !== "ALL") {
      result = result.filter((activity) => activity.status === status);
    }

    if (orderCode && orderCode.trim() !== "") {
      result = result.filter(
        (activity) =>
          activity.orderCode &&
          activity.orderCode.toLowerCase().includes(orderCode.toLowerCase())
      );
    }

    setFilteredActivities(result);
    setCurrentPage(1);
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

  // Hàm gọi API lấy chi tiết công việc
  const fetchJobDetail = async (jobId) => {
    setJobDetailLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customer/${jobId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Không thể lấy chi tiết công việc");
      }
      const data = await response.json();
      setJobDetail(data);
      setIsJobDetailModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết công việc:", error);
      message.error("Không thể lấy chi tiết công việc");
    } finally {
      setJobDetailLoading(false);
    }
  };

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
      message.error("Không thể tải danh sách người dọn dẹp");
      setCleanerList([]);
      setApplicationsCount((prev) => ({
        ...prev,
        [jobId]: 0,
      }));
    }
    setLoading(false);
  };

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

  const handleViewCleanerDetail = async (cleanerId) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const data = await fetchCleanerDetail(cleanerId);
      setSelectedCleaner(data);
      setIsCleanerDetailModalOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin người dọn dẹp");
      setSelectedCleaner(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchCleanerDetail = async (cleanerId) => {
    setLoading(true);
    try {
      const data = await fetchCleanerDetail(cleanerId);
      setSelectedCleaner(data);
    } catch (error) {
      message.error("Không thể tải thông tin người dọn dẹp");
      setSelectedCleaner(null);
    }
    setLoading(false);
  };

  const openModal = (jobId) => {
    setIsModalOpen(true);
    fetchCleaners(jobId);
    setSelectedJobId(jobId);
  };

  const openFeedbackModal = (jobId) => {
    setSelectedJobIdForFeedback(jobId);
    setIsFeedbackModalOpen(true);
  };

  const openReportModal = (jobId) => {
    setSelectedJobIdForReport(jobId);
    setIsReportModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedJobIdForFeedback(null);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedJobIdForReport(null);
  };

  const updateActivityStatus = (jobId, newStatus) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.jobId === jobId ? { ...activity, status: newStatus } : activity
      )
    );
  };

  const handleHireCleaner = async (jobId, cleanerId, customerId) => {
    if (!jobId) {
      console.error("Không tìm thấy jobId!");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await hireCleaner(jobId, cleanerId, customerId);
      const jobData = activities.find((activity) => activity.jobId === jobId);
      const selectedCleanerData = cleanerList.find(
        (cleaner) => cleaner.cleanerId === cleanerId
      );
      const cleanerPhone = selectedCleanerData?.phoneNumber;

      message.success("Thuê cleaner thành công!");

      let serviceInfoText = "";
      if (jobData.services) {
        if (Array.isArray(jobData.services)) {
          serviceInfoText = jobData.services
            .map(
              (service) =>
                `${service.serviceName} (${service.serviceDetailAreaRange})`
            )
            .join(", ");
        } else {
          serviceInfoText = `${
            jobData.services.serviceName || "Không xác định"
          } (${jobData.services.serviceDetailAreaRange || "Không xác định"})`;
        }
      } else {
        serviceInfoText = "Không xác định";
      }

      const formattedDate = new Date(jobData.scheduledTime).toLocaleString(
        "vi-VN",
        {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      const smsMessageHire = `[HouseClean] Bạn được ${customerName} chấp nhận. Dịch vụ: ${serviceInfoText}, lúc ${formattedDate}, tại ${
        jobData.customerAddress
      }. SĐT chủ nhà: ${customerPhone}. Tạm tính: ${jobData.totalPrice.toLocaleString()} VNĐ.`;

      Promise.all([
        // sendNotification(cleanerId, ...),
        // sendSms(cleanerPhone, smsMessageHire),
      ]);

      updateActivityStatus(jobId, "IN_PROGRESS");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thuê cleaner:", error);
      message.error("Lỗi khi thuê cleaner");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCleaner = async (jobId, cleanerId, customerId) => {
    try {
      await rejectCleaner(jobId, cleanerId, customerId);
      const jobData = activities.find((activity) => activity.jobId === jobId);
      const selectedCleanerData = cleanerList.find(
        (cleaner) => cleaner.cleanerId === cleanerId
      );
      const cleanerPhone = selectedCleanerData?.phoneNumber;

      message.success("Từ chối cleaner thành công!");

      const formattedDate = new Date(jobData.scheduledTime).toLocaleString(
        "vi-VN",
        {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      const smsMessageReject = `[HouseClean] Lịch dọn tại ${jobData.customerAddress}, lúc ${formattedDate} đã bị huỷ bởi ${customerName}`;
      Promise.all([
        // sendNotification(cleanerId, ...),
        // sendSms(cleanerPhone, smsMessageReject),
      ]);
      fetchCleaners(jobId);
    } catch (error) {
      console.error("Lỗi khi từ chối cleaner:", error);
      message.error("Lỗi khi từ chối người dọn dẹp");
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      await startJob(jobId, customerId);
      message.success("Công việc đã bắt đầu!");
      updateActivityStatus(jobId, "STARTED");
    } catch (error) {
      console.error("Lỗi khi bắt đầu công việc:", error);
      message.error("Không thể bắt đầu công việc.");
    }
  };

  const handleRetryPayment = async (jobId) => {
    try {
      const result = await retryPayment(jobId);
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
      } else {
        message.error("Không thể tạo URL thanh toán");
      }
    } catch (error) {
      console.error("Lỗi khi thử thanh toán lại:", error);
      message.error("Không thể thử thanh toán lại. Vui lòng thử lại sau.");
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await completeJob(jobId);
      message.success("Công việc đã hoàn thành!");
      updateActivityStatus(jobId, "DONE");
    } catch (error) {
      console.error("Lỗi khi hoàn thành công việc:", error);
      message.error("Không thể hoàn thành công việc.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteJob = (jobId) => {
    Modal.confirm({
      title: "Xác nhận huỷ việc",
      content: "Bạn có chắc chắn muốn huỷ công việc này không?",
      okText: "Đồng ý",
      cancelText: "Huỷ bỏ",
      onOk: async () => {
        try {
          await deleteJobPosting(jobId, customerId);
          setActivities((prevActivities) =>
            prevActivities.filter((activity) => activity.jobId !== jobId)
          );
          message.success("Huỷ việc thành công");
          const activity = activities.find((a) => a.jobId === jobId);
          if (activity && activity.cleanerId) {
            Promise.all([
              // sendNotification(activity.cleanerId, ...),
            ]);
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
            disabled={!record.cleanerId || isProcessing}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            onClick={() =>
              handleRejectCleaner(selectedJobId, record.cleanerId, customerId)
            }
            disabled={!record.cleanerId || isProcessing}
          >
            Từ chối
          </Button>
        </>
      ),
    },
  ];

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
              <div className={styles.cardContent}>
                <div className={styles.orderCode}>
                  <strong>Mã đơn hàng:</strong> {activity.orderCode}
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
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <MdLocationOn className={styles.icon} />
                    <span>{activity.customerAddress}</span>
                  </div>
                </div>
                <div className={styles.services}>
                  {activity.subJobs &&
                    activity.subJobs.map((subJob, idx) => (
                      <div key={idx} className={styles.serviceDetails}>
                        <div className={styles.serviceTitle}>
                          {subJob.services[0]?.serviceName} -{" "}
                          {new Date(subJob.scheduledTime).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                        <div className={styles.serviceArea}>
                          {subJob.services[0]?.serviceDetailAreaRange}
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
                  {/* Thêm nút Xem chi tiết dịch vụ */}
                  <Button
                    type="default"
                    onClick={() => fetchJobDetail(activity.jobId)}
                    disabled={jobDetailLoading}
                  >
                    Xem chi tiết dịch vụ
                  </Button>
                  {(activity.status === "OPEN" ||
                    activity.status === "BOOKED" ||
                    activity.status === "IN_PROGRESS" ||
                    activity.status === "ARRIVED") && (
                    <Button
                      danger
                      className={styles.cancelButton}
                      onClick={() => handleDeleteJob(activity.jobId)}
                      disabled={isProcessing}
                    >
                      Huỷ việc
                    </Button>
                  )}
                  {(activity.status === "BOOKED" ||
                    activity.status === "IN_PROGRESS" ||
                    activity.status === "CANCELLED" ||
                    activity.status === "COMPLETED") && (
                    <Button
                      className={styles.reportButton}
                      onClick={() => openReportModal(activity.jobId)}
                      danger
                      icon={<FaFlag />}
                    >
                      Báo cáo
                    </Button>
                  )}
                  {activity.status === "DONE" && (
                    <div className={styles.buttonGroup}>
                      <Button
                        className={styles.reviewButton}
                        onClick={() => openFeedbackModal(activity.jobId)}
                        icon={<FaRegCommentAlt />}
                      >
                        Đánh giá
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
                  {/* {(activity.status === "OPEN" ||
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
                          Người dọn dẹp đã ứng tuyển
                        </Button>
                      </Badge>
                    )} */}
                  {(activity.status === "DONE" ||
                    activity.status === "COMPLETED" ||
                    activity.status === "IN_PROGRESS") && (
                    <Button
                      type="default"
                      onClick={() =>
                        handleViewCleanerDetail(activity.cleanerId)
                      }
                      disabled={!activity.cleanerId || isProcessing}
                    >
                      Xem chi tiết người dọn dẹp
                    </Button>
                  )}
                  {activity.status === "COMPLETED" && (
                    <Button
                      type="primary"
                      className={styles.statusButton}
                      onClick={() => handleCompleteJob(activity.jobId)}
                      disabled={isProcessing}
                    >
                      Xác nhận đã hoàn thành
                    </Button>
                  )}
                  {activity.status === "PAID" && (
                    <Button
                      type="primary"
                      className={styles.statusButton}
                      onClick={() => handleRetryPayment(activity.jobId)}
                      disabled={isProcessing}
                    >
                      Thanh toán lại
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
      <Modal
        title="Danh sách người dọn dẹp"
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
      <Modal
        title="Chi tiết người dọn dẹp"
        open={isCleanerDetailModalOpen}
        onCancel={() => {
          setIsCleanerDetailModalOpen(false);
          setSelectedCleaner(null);
        }}
        width={1050}
        footer={[
          ...(activities.find(
            (activity) => activity.cleanerId === selectedCleaner?.cleanerId
          )?.status === "DONE"
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
        {loading ? (
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
      {/* Thêm JobDetailModal */}
      <JobDetailModal
        isOpen={isJobDetailModalOpen}
        onClose={() => {
          setIsJobDetailModalOpen(false);
          setJobDetail(null);
        }}
        jobDetail={jobDetail}
        loading={jobDetailLoading}
        handleDeleteJob={handleDeleteJob}
        openReportModal={openReportModal}
        openFeedbackModal={openFeedbackModal}
        openModal={openModal}
        handleViewCleanerDetail={handleViewCleanerDetail}
        handleCompleteJob={handleCompleteJob}
        handleRetryPayment={handleRetryPayment}
        fetchCleanerApplications={fetchCleanerApplications}
        fetchCleanerDetail={fetchCleanerDetail}
        hireCleaner={hireCleaner}
        startJob={startJob}
        rejectCleaner={rejectCleaner}
        applicationsCount={applicationsCount}
        isProcessing={isProcessing}
        customerId={customerId}
      />

      <FeedbackModal
        visible={isFeedbackModalOpen}
        jobId={selectedJobIdForFeedback}
        customerId={customerId}
        onClose={closeFeedbackModal}
      />
      <ReportModal
        visible={isReportModalOpen}
        jobId={selectedJobIdForReport}
        customerId={customerId}
        onClose={closeReportModal}
      />
    </div>
  );
};
