import React, { useEffect, useState, useContext } from "react";
import { Modal, List, Button, Table, message, Empty, Badge } from "antd";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import { FaRegCommentAlt, FaRulerHorizontal } from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
    fetchCleanerApplications,
    fetchCleanerDetail,
    hireCleaner,
    startJob,
    completeJob,
    deleteJobPosting,
    rejectCleaner
} from "../../services/owner/StatusJobAPI";
import { FeedbackModal } from "../../components/activity/FeedbackModal"; // Import the new FeedbackModal component
import { createConversation } from "../../services/ChatService";
import { sendNotification } from "../../services/NotificationService";

export const ActivityCard = ({ data, onDelete }) => {
    const [activities, setActivities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cleanerList, setCleanerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCleaner, setSelectedCleaner] = useState(null);
    const { customerId } = useContext(AuthContext);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applicationsCount, setApplicationsCount] = useState({});
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // New state for feedback modal
    const [selectedJobIdForFeedback, setSelectedJobIdForFeedback] = useState(null); // New state for selected job ID for feedback

    // Initialize activities from props
    useEffect(() => {
        if (data) {
            setActivities(data);
        }
    }, [data]);


    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "#3498db";
            case "PAID": return "#5dade2";
            case "PENDING_APPROVAL": return "#f1c40f";
            case "IN_PROGRESS": return "#e67e22";
            case "COMPLETED": return "#2ecc71";
            case "CANCELLED": return "#e74c3c";
            case "DONE": return "#27ae60";
            case "BOOKED": return "#8e44ad";
            default: return "#bdc3c7";
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case "OPEN": return "Đang chờ người nhận";
            case "PAID": return "Đang chờ thanh toán qua VNPay";
            case "PENDING_APPROVAL": return "Chờ phê duyệt";
            case "IN_PROGRESS": return "Người nhận việc đang tới";
            case "COMPLETED": return "Người nhận việc đã hoàn thành";
            case "CANCELLED": return "Đã hủy";
            case "DONE": return "Hoàn tất công việc";
            case "BOOKED": return "Đã đặt lịch";
            default: return "Không xác định";
        }
    };

    // Fetch cleaner applications
    const fetchCleaners = async (jobId) => {
        setLoading(true);
        try {
            const data = await fetchCleanerApplications(customerId, jobId);
            setCleanerList(data);
            setApplicationsCount(prev => ({
                ...prev,
                [jobId]: data.length
            }));
        } catch (error) {
            message.error("Không thể tải danh sách Cleaner");
            setCleanerList([]);
            setApplicationsCount(prev => ({
                ...prev,
                [jobId]: 0
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
                        const applications = await fetchCleanerApplications(customerId, activity.jobId);
                        setApplicationsCount(prev => ({
                            ...prev,
                            [activity.jobId]: applications.length
                        }));
                    } catch (error) {
                        console.error("Lỗi khi lấy số lượng ứng viên:", error);
                        setApplicationsCount(prev => ({
                            ...prev,
                            [activity.jobId]: 0
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

    // Close feedback modal
    const closeFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
        setSelectedJobIdForFeedback(null);
    };

    // Update activity status locally
    const updateActivityStatus = (jobId, newStatus) => {
        setActivities(prevActivities =>
            prevActivities.map(activity =>
                activity.jobId === jobId
                    ? { ...activity, status: newStatus }
                    : activity
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
            sendNotification(cleanerId,
                `Người thuê ${localStorage.getItem('name')} đã chấp nhận công việc`,
                'BOOKED',
                'Cleaner'
            )
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
            console.log("Từ chối cleaner thành công!", { jobId, cleanerId, customerId });
            message.success("Từ chối cleaner thành công!");
            sendNotification(cleanerId,
                `Người thuê ${localStorage.getItem('name')} từ chối công việc`,
                'BOOKED',
                'Cleaner'
            )
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
    const handleDeleteJob = async (jobId) => {
        try {
            await onDelete(jobId);
            // Remove deleted job from local state
            setActivities(prevActivities =>
                prevActivities.filter(activity => activity.jobId !== jobId)
            );
            message.success("Huỷ việc thành công");
        } catch (error) {
            console.error("❌ Lỗi khi xóa công việc:", error);
            message.error("Lỗi khi không huỷ được công việc");
        }
    };

    const columns = [
        {
            title: "Ảnh",
            dataIndex: "profileImage",
            key: "profileImage",
            render: (base64) => (
                <img src={`data:image/png;base64,${base64}`} alt="Avatar" style={{ width: 40, borderRadius: "50%" }} />
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
                        onClick={() => handleHireCleaner(selectedJobId, record.cleanerId, customerId)}
                        disabled={!record.cleanerId}
                    >
                        Thuê
                    </Button>
                    <Button
                        danger
                        onClick={() => handleRejectCleaner(selectedJobId, record.cleanerId, customerId)}
                        disabled={!record.cleanerId}
                    >
                        Từ chối
                    </Button>
                </>
            ),
        }
    ];

    return (
        <div className={styles.cardlist}>
            <div className={styles.container}>
                {activities.map((activity, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.header}>
                                {activity.services && activity.services.map((service, idx) => (
                                    <div key={idx} className={styles.serviceItem}>
                                        <h3>{service.serviceName}</h3>
                                    </div>
                                ))}

                            </div>

                            <p><MdCalendarToday className={styles.icon} /> {new Date(activity.scheduledTime).toLocaleDateString("vi-VN")}</p>
                            <p><MdAccessTime className={styles.icon} /> {new Date(activity.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>


                            <div className={styles.location}>
                                <MdLocationOn className={styles.icon} /> {activity.customerAddress}
                            </div>
                            <div className={styles.services}>
                                {activity.services && activity.services.map((service, idx) => (
                                    <div key={idx} className={styles.serviceItem}>
                                        <p><strong>{service.serviceName}</strong>: {service.serviceDetailAreaRange}</p>
                                    </div>
                                ))}
                            </div>

                            {(activity.status === "OPEN"
                                || activity.status === "BOOKED"
                                || activity.status === "IN_PROGRESS") &&
                                (
                                    <div className={styles.deleteButton} onClick={() => handleDeleteJob(activity.jobId)}>
                                        <b>Huỳ việc</b>
                                    </div>
                                )}

                            <div className={styles.price}>
                                <b>{activity.totalPrice.toLocaleString("vi-VN")} VNĐ</b>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.footer}>
                            <b style={{ color: getStatusColor(activity.status) }}>{getStatusText(activity.status)}</b>

                            {(activity.status === "DONE") && (
                                <Button
                                    className={styles.reviewButton}
                                    onClick={() => openFeedbackModal(activity.jobId)}
                                >
                                    <FaRegCommentAlt />
                                    <span>
                                        {activity.status === "DONE" ? "Xem đánh giá" : "Đánh giá"}
                                    </span>
                                </Button>
                            )}

                            {(activity.status === "OPEN" || activity.status === "BOOKED") &&
                                (applicationsCount[activity.jobId] > 0) && (
                                    <Badge count={applicationsCount[activity.jobId]} size="small">
                                        <Button type="primary" className={styles.statusButton}
                                            onClick={() => openModal(activity.jobId)}>
                                            Xem thông tin Cleaner
                                        </Button>
                                    </Badge>
                                )}


                            {activity.status === "COMPLETED" && (
                                <Button type="primary" className={styles.statusButton}
                                    onClick={() => handleCompleteJob(activity.jobId)}>
                                    Đã hoàn thành
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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
                ) : (
                    loading ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            {/* You can use Antd's Spin component here if needed */}
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
                            locale={{ emptyText: <Empty description="Chưa có Cleaner nào nhận việc" /> }}
                        />
                    )
                )}
            </Modal>

            {/* Feedback Modal */}
            <FeedbackModal
                visible={isFeedbackModalOpen}
                jobId={selectedJobIdForFeedback}
                customerId={customerId}
                onClose={closeFeedbackModal}
            />
        </div>
    );
};