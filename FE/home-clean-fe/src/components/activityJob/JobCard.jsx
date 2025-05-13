import React, { useContext, useState, useEffect } from "react";
import {
  Modal,
  Button,
  message,
  Rate,
  List,
  Typography,
  Spin,
  Empty,
  Divider,
  Row,
  Col,
  Pagination,
} from "antd";
import {
  DollarOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
} from "@ant-design/icons";
import styles from "./JobList.module.css";
import { BASE_URL } from "../../utils/config";
import { createConversation } from "../../services/ChatService";
import { sendNotification } from "../../services/NotificationService";
import { sendSms } from "../../services/SMSService";
import { FeedbackModal } from "./FeedbackModal";
import { AuthContext } from "../../context/AuthContext";
import { ReportModal } from "../../components/activityJob/ReportModal";
import { FaFlag, FaRegCommentAlt } from "react-icons/fa";

const getStatusColor = (status) => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case "OPEN":
      return "#3498db";
    case "PAID":
      return "#5dade2";
    case "PENDING_APPROVAL":
    case "PENDING":
      return "#f1ab0f";
    case "IN_PROGRESS":
      return "#e67e22";
    case "ARRIVED":
      return "#9b59b6";
    case "COMPLETED":
      return "#2ecc71";
    case "CANCELLED":
    case "REJECTED":
      return "#e74c3c";
    case "DONE":
      return "#27ae60";
    case "BOOKED":
    case "ACCEPTED":
      return "#8e44ad";
    default:
      return "#bdc3c7";
  }
};

const getStatusLabel = (status) => {
  const statusMap = {
    OPEN: "Đang tuyển",
    PAID: "Đang chờ thanh toán",
    PENDING_APPROVAL: "Chờ phê duyệt",
    PENDING: "Đang chờ phê duyệt",
    IN_PROGRESS: "Đang đến",
    ARRIVED: "Đã đến",
    COMPLETED: "Đã hoàn thành công việc",
    CANCELLED: "Đã hủy",
    REJECTED: "Đã từ chối",
    DONE: "Hoàn tất công việc",
    BOOKED: "Đã đặt lịch",
    ACCEPTED: "Đã được chấp nhận",
  };
  return statusMap[status.toUpperCase()] || "Không xác định";
};

const JobCard = ({ job, refreshJobs, isAppliedTab }) => {
  const { cleanerId } = useContext(AuthContext);
  const [currentStatus, setCurrentStatus] = useState(
    isAppliedTab && job.jobApplicationStatus
      ? job.jobApplicationStatus.toUpperCase()
      : job.status
      ? job.status.toUpperCase()
      : "Không xác định"
  );
  const [loading, setLoading] = useState(false);
  const [customerDetailsVisible, setCustomerDetailsVisible] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedJobIdForFeedback, setSelectedJobIdForFeedback] =
    useState(null);
  const cleanerName = sessionStorage.getItem("name");
  const cleanerPhone = sessionStorage.getItem("phone");
  const [isProcessing, setIsProcessing] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedJobIdForReport, setSelectedJobIdForReport] = useState(null);

  // Pagination states for feedbacks
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);

  // Check which status to use based on tab
  const displayStatus =
    isAppliedTab && job.jobApplicationStatus
      ? job.jobApplicationStatus
      : job.status || "Không xác định ";

  let serviceInfoText = "";
  if (job.services) {
    if (Array.isArray(job.services)) {
      serviceInfoText = job.services
        .map((service) => `${service.serviceName} (${service.areaRange})`)
        .join(", ");
    } else {
      serviceInfoText = `${job.services.serviceName || "Không xác định"} (${
        job.services.areaRange || "Không xác định"
      })`;
    }
  } else {
    serviceInfoText = "Không xác định";
  }

  // Format date for SMS
  const formattedDate = new Date(job.scheduledTime).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const fetchCustomerDetails = () => {
    // if (isProcessing) return;
    setIsProcessing(true);

    setLoadingCustomerDetails(true);
    const token = sessionStorage.getItem("token");
    const cleanerId = sessionStorage.getItem("cleanerId");

    fetch(`${BASE_URL}/cleaner/${cleanerId}/viewcustomer/${job.customerId}`, {
      method: "GET",
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
        setCustomerDetails(data);
        setCustomerDetailsVisible(true);

        // After fetching customer details, fetch feedbacks
        fetchFeedbacks(data.customerId);
      })
      .catch((error) => {
        console.error("Error fetching customer details:", error);
        message.error(
          "Không thể lấy thông tin khách hàng. Vui lòng thử lại sau."
        );
      })
      .finally(() => {
        setLoadingCustomerDetails(false);
      });
  };

  const fetchFeedbacks = (customerId) => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (!cleanerId || !customerId) return;

    setLoadingFeedbacks(true);
    const token = sessionStorage.getItem("token");

    fetch(
      `${BASE_URL}/customer/cleaners/${cleanerId}/customer/${customerId}/feedbacks`,
      {
        method: "GET",
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
        // Extract average rating from the response
        const avgRating =
          data.find((item) => item.hasOwnProperty("averageRating"))
            ?.averageRating || 0;
        setAverageRating(avgRating);

        // Filter out the item containing averageRating to get only feedback items
        const feedbackItems = data.filter(
          (item) => !item.hasOwnProperty("averageRating")
        );
        setFeedbacks(feedbackItems);

        // Reset to first page when new data is loaded
        setCurrentPage(1);
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
        message.error(
          "Không thể lấy thông tin đánh giá. Vui lòng thử lại sau."
        );
      })
      .finally(() => {
        setLoadingFeedbacks(false);
      });
  };

  const handleStatusUpdate = (newStatus) => {
    if (isProcessing) return;
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc muốn cập nhật trạng thái thành '${getStatusLabel(
        newStatus
      )}' không?`,
      onOk: () => {
        setLoading(true);
        const token = sessionStorage.getItem("token");
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
            // Chỉ cập nhật trạng thái mới trên component hiện tại
            setCurrentStatus(newStatus.toUpperCase());
            message.success(
              `Đã cập nhật trạng thái thành ${getStatusLabel(newStatus)}`
            );
            // sendNotification(
            //   job.customerId,
            //   `Người dọn dẹp ${sessionStorage.getItem(
            //     "name"
            //   )} cập nhật trạng thái: ${
            //     getStatusLabel(newStatus) || "Trạng thái"
            //   }`,
            //   "STATUS",
            //   "Customer"
            // );
            if (newStatus.toUpperCase() === "COMPLETED") {
              const smsMessageCompleted = `[HouseClean] Cleaner ${cleanerName} đã hoàn thành công việc. Mời bạn đánh giá trên ứng dụng. Cảm ơn bạn!`;

              // sendSms(job.customerPhone, smsMessageCompleted)
              //   .then(() => {
              //     console.log("Completion SMS sent successfully");
              //   })
              //   .catch((error) => {
              //     console.error("Error sending completion SMS:", error);
              //   });
            }
            if (newStatus.toUpperCase() === "ARRIVED") {
              const smsMessageArrived = `[HouseClean] Cleaner ${cleanerName} đã đến ${job.customerAddress} để làm việc lúc ${formattedDate}. SĐT Cleaner: ${cleanerPhone}. Bạn vui lòng mở cửa và để ý điện thoại nhé.`;
              // sendSms(job.customerPhone, smsMessageArrived)
              //   .then(() => {
              //     console.log("Arrival SMS sent successfully");
              //   })
              //   .catch((error) => {
              //     console.error("Error sending arrival SMS:", error);
              //   });
            }
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

  const handleCancelJob = () => {
    if (isProcessing) return;
    Modal.confirm({
      title: "Xác nhận hủy ứng tuyển",
      content: "Bạn có chắc muốn hủy ứng tuyển công việc này không?",
      onOk: () => {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const customerId = job.customerId;
        const jobId = job.jobId;
        fetch(`${BASE_URL}/cleaner/cancel-application/${jobId}`, {
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
            console.log("Job application cancelled:", data);
            setCurrentStatus("CANCELLED");
            message.success("Đã hủy ứng tuyển công việc thành công");

            // Notify customer about cancellation
            // sendNotification(
            //   customerId,
            //   `Người dọn dẹp ${sessionStorage.getItem(
            //     "name"
            //   )} đã hủy ứng tuyển dịch vụ: ${
            //     job.services[0]?.serviceName || "Dọn dẹp"
            //   }`,
            //   "CANCELLED",
            //   "Customer"
            // ).catch((error) => {
            //   console.error("Error sending cancellation notification:", error);
            // });

            // Refresh job list if refreshJobs function is provided
            if (typeof refreshJobs === "function") {
              refreshJobs();
            }
          })
          .catch((error) => {
            console.error("Error cancelling job application:", error);
            message.error("Không thể hủy ứng tuyển. Vui lòng thử lại sau.");
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const handleJobAction = (action) => {
    if (isProcessing) return;
    setLoading(true);
    const token = sessionStorage.getItem("token");
    const cleanerId = sessionStorage.getItem("cleanerId");

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
          setCurrentStatus("IN_PROGRESS");
          // Build SMS message
          const smsMessageAccept = `[HouseClean] Cleaner ${cleanerName} đã xác nhận. SĐT: ${cleanerPhone}. Dịch vụ: ${serviceInfoText}, ${formattedDate}, ${
            job.customerAddress
          }. Tạm tính: ${job.totalPrice.toLocaleString()} VND.`;
          // Promise.all([
          //   createConversation(job.customerId, cleanerId),
          //   sendNotification(
          //     job.customerId,
          //     `Người dọn dẹp ${sessionStorage.getItem(
          //       "name"
          //     )} đã nhận dịch vụ: ${job.services[0]?.serviceName || "Dọn dẹp"}`,
          //     "BOOKED",
          //     "Customer"
          //   ),
          //   sendSms(job.customerPhone, smsMessageAccept),
          // ])
          //   .then(([conversationData, notificationData]) => {
          //     console.log("Conversation created:", conversationData);
          //     console.log("Notification sent:", notificationData);
          //   })
          //   .catch((error) => {
          //     console.error("Error in post-acceptance operations:", error);
          //     message.error(
          //       "Có lỗi xảy ra khi xử lý sau khi chấp nhận công việc."
          //     );
          //   });
          if (typeof refreshJobs === "function") {
            // Pass the tab to switch to as a parameter
            refreshJobs("doing");
          }
        } else if (action === "reject") {
          setCurrentStatus("CANCELLED");
          const smsMessageReject = `[HouseClean] Cleaner ${cleanerName} (SĐT: ${cleanerPhone}) đã huỷ lịch ${formattedDate}. Vui lòng chọn người thay thế.`;
          // Promise.all([
          //   sendNotification(
          //     job.customerId,
          //     `Người dọn dẹp ${sessionStorage.getItem(
          //       "name"
          //     )} đã từ chối dịch vụ: ${
          //       job.services[0]?.serviceName || "Dọn dẹp"
          //     }`,
          //     "REJECTED",
          //     "Customer"
          //   ),
          //   sendSms(job.customerPhone, smsMessageReject),
          // ])
          //   .then((notificationData) => {
          //     console.log("Rejection notification sent:", notificationData);
          //   })
          //   .catch((error) => {
          //     console.error("Error in sending rejection notification:", error);
          //     message.error("Có lỗi xảy ra khi gửi thông báo từ chối.");
          //   });
          if (typeof refreshJobs === "function") {
            refreshJobs();
          }
        }

        message.success(
          action === "accept"
            ? "Đã chấp nhận công việc"
            : "Đã từ chối công việc"
        );
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

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedJobIdForFeedback(null);
  };

  const openFeedbackModal = (jobId) => {
    if (isProcessing) return;
    setSelectedJobIdForFeedback(jobId);
    setIsFeedbackModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedJobIdForReport(null);
  };

  const openReportModal = (jobId) => {
    if (isProcessing) return;
    setSelectedJobIdForReport(jobId);
    setIsReportModalOpen(true);
  };

  // Calculate the current page's data to display
  const paginatedFeedbacks = feedbacks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            {/* {!["PENDING", "CANCELLED", "ACCEPTED"].includes(
              displayStatus.toUpperCase()
            ) && (
              <div>Mã đơn hàng: {job.orderCode || "Không có thông tin"} </div>
            )} */}
            <div>Mã đơn hàng: {job.orderCode || "Không có thông tin"} </div>

            {!["PENDING", "CANCELLED", "REJECTED"].includes(
              displayStatus.toUpperCase()
            ) && <div>SĐT: {job.customerPhone}</div>}
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
        {/* For Applied tab, show specific actions based on jobApplicationStatus */}
        {isAppliedTab && (
          <>
            {displayStatus.toUpperCase() === "PENDING" && (
              <Button
                className={styles.cancelBtn}
                onClick={handleCancelJob}
                loading={loading}
                // disabled={isProcessing}
              >
                Hủy ứng tuyển
              </Button>
            )}
            {displayStatus.toUpperCase() === "ACCEPTED" && (
              <Button
                className={styles.completeBtn}
                onClick={fetchCustomerDetails}
                loading={loadingCustomerDetails}
                // disabled={isProcessing}
              >
                Xem thông tin Chủ Nhà
              </Button>
            )}
            {displayStatus.toUpperCase() === "REJECTED" && (
              <span className={styles.statusNote}>
                Ứng tuyển của bạn đã bị từ chối
              </span>
            )}
          </>
        )}

        {/* For other tabs, use original logic */}
        {!isAppliedTab && (
          <>
            {currentStatus === "OPEN" && (
              <Button
                className={styles.cancelBtn}
                onClick={handleCancelJob}
                loading={loading}
                disabled={isProcessing}
              >
                Hủy ứng tuyển
              </Button>
            )}
            {currentStatus === "IN_PROGRESS" && (
              <Button
                className={styles.completeBtn}
                onClick={() => handleStatusUpdate("arrived")}
                loading={loading}
                disabled={isProcessing}
              >
                Đã đến nơi
              </Button>
            )}
            {currentStatus === "ARRIVED" && (
              <Button
                className={styles.completeBtn}
                onClick={() => handleStatusUpdate("completed")}
                loading={loading}
                disabled={isProcessing}
              >
                Đã hoàn thành
              </Button>
            )}
            {currentStatus === "DONE" && (
              <>
                <Button
                  className={styles.reviewButton}
                  onClick={() => openFeedbackModal(job.jobId)}
                  loading={loading}
                  disabled={isProcessing}
                  icon={<FaRegCommentAlt />}
                >
                  Đánh giá
                </Button>
                <Button
                  className={styles.reviewButton}
                  onClick={() => openReportModal(job.jobId)}
                  loading={loading}
                  disabled={isProcessing}
                  danger
                  icon={<FaFlag />}
                >
                  Báo cáo
                </Button>
              </>
            )}
            {currentStatus === "BOOKED" && (
              <>
                <Button
                  className={styles.completeBtn}
                  onClick={fetchCustomerDetails}
                  loading={loadingCustomerDetails}
                  // disabled={isProcessing}
                >
                  Xem thông tin Chủ Nhà
                </Button>
                <Button
                  className={styles.cancelBtn}
                  onClick={() => handleJobAction("reject")}
                  loading={loading}
                  // disabled={isProcessing}
                >
                  Từ chối
                </Button>
                <Button
                  className={styles.completeBtn}
                  onClick={() => handleJobAction("accept")}
                  loading={loading}
                  disabled={isProcessing}
                >
                  Chấp nhận
                </Button>
              </>
            )}
          </>
        )}
      </footer>

      {/* Customer Details Modal */}
      <Modal
        title="Thông tin chi tiết khách hàng"
        open={customerDetailsVisible}
        onCancel={() => setCustomerDetailsVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setCustomerDetailsVisible(false)}
            disabled={isProcessing}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Row gutter={24}>
          {/* Left column - Customer Details */}
          <Col span={12}>
            <Typography.Title level={4}>Thông tin cá nhân</Typography.Title>
            {customerDetails ? (
              <div className={styles.customerDetails}>
                <div className={styles.detailItem}>
                  <UserOutlined
                    style={{ fontSize: "20px", color: "#039855" }}
                  />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Trạng thái</span>
                    <strong className={styles.detailValue}>
                      {customerDetails.isDeleted
                        ? "Không hoạt động"
                        : "Đang hoạt động"}
                    </strong>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <UserOutlined
                    style={{ fontSize: "20px", color: "#039855" }}
                  />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Họ tên</span>
                    <strong className={styles.detailValue}>
                      {customerDetails.fullName}
                    </strong>
                  </div>
                </div>

                {/* <div className={styles.detailItem}>
                  <PhoneOutlined
                    style={{ fontSize: "20px", color: "#039855" }}
                  />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Số điện thoại</span>
                    <strong className={styles.detailValue}>
                      {customerDetails.phoneNumber}
                    </strong>
                  </div>
                </div> */}

                <div className={styles.detailItem}>
                  <MailOutlined
                    style={{ fontSize: "20px", color: "#039855" }}
                  />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Email</span>
                    <strong className={styles.detailValue}>
                      {customerDetails.email}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div>Đang tải thông tin khách hàng...</div>
            )}
          </Col>

          {/* Right column - Feedback with Pagination */}
          <Col span={12}>
            <Typography.Title level={4}>
              <StarOutlined style={{ marginRight: "8px", color: "#f5c518" }} />
              Đánh giá
            </Typography.Title>

            {loadingFeedbacks ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <div>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <Typography.Title level={4}>
                    Đánh giá trung bình
                  </Typography.Title>
                  <Rate disabled value={averageRating} allowHalf />
                  <Typography.Text
                    style={{ display: "block", marginTop: "8px" }}
                  >
                    {averageRating.toFixed(1)}/5
                  </Typography.Text>
                </div>

                <Typography.Title level={5}>Chi tiết đánh giá</Typography.Title>

                {feedbacks.length > 0 ? (
                  <>
                    <List
                      itemLayout="horizontal"
                      dataSource={paginatedFeedbacks}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span>Công việc #{item.jobId}</span>
                                <span style={{ marginLeft: "16px" }}>
                                  <Rate disabled value={item.rating} />
                                </span>
                              </div>
                            }
                            description={
                              <div style={{ marginTop: "8px" }}>
                                <Typography.Text>
                                  {item.comment}
                                </Typography.Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />

                    {/* Pagination component */}
                    {feedbacks.length > pageSize && (
                      <div
                        style={{
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Pagination
                          current={currentPage}
                          onChange={handlePageChange}
                          total={feedbacks.length}
                          pageSize={pageSize}
                          showSizeChanger={false}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Empty description="Chưa có đánh giá nào" />
                )}
              </div>
            )}
          </Col>
        </Row>
      </Modal>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={isFeedbackModalOpen}
        jobId={selectedJobIdForFeedback}
        cleanerId={cleanerId}
        onClose={closeFeedbackModal}
      />
      <ReportModal
        visible={isReportModalOpen}
        jobId={selectedJobIdForReport}
        onClose={closeReportModal}
      />
    </article>
  );
};

export default JobCard;
