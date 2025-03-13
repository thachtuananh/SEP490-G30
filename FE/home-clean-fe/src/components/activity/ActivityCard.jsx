import React, { useEffect, useState, useContext } from "react";
import { Modal, List, Button, Table, message, Empty, Badge } from "antd";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import { FaRegCommentAlt } from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
    fetchCleanerApplications,
    fetchCleanerDetail,
    hireCleaner,
    startJob,
    completeJob,
    deleteJobPosting
} from "../../services/owner/StatusJobAPI";

export const ActivityCard = ({ data, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cleanerList, setCleanerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCleaner, setSelectedCleaner] = useState(null);
    const { customerId } = useContext(AuthContext);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applicationsCount, setApplicationsCount] = useState({});

    const getStatusColor = (status) => {
        switch (status) {
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
    const getStatusText = (status) => {
        switch (status) {
            case "OPEN": return "Đang chờ người nhận";
            case "PENDING_APPROVAL": return "Chờ phê duyệt";
            case "IN_PROGRESS": return "Người nhận việc đang tới";
            case "ARRIVED": return "Người nhận việc đã tới";
            case "STARTED": return "Người nhận việc đang làm";
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
        if (data && data.length > 0) {
            data.forEach(async (activity) => {
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
    }, [data, customerId]);

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

    const openModal = (jobId) => {
        setIsModalOpen(true);
        fetchCleaners(jobId);
        setSelectedJobId(jobId);
    };

    // Hire a cleaner
    const handleHireCleaner = async (jobId, cleanerId, customerId) => {
        if (!jobId) {
            console.error("Không tìm thấy jobId!");
            return;
        }

        try {
            await hireCleaner(jobId, cleanerId, customerId);
            console.log("✅ Thuê cleaner thành công!", { jobId, cleanerId, customerId });
            message.success("✅ Thuê cleaner thành công!");
            setIsModalOpen(false);
        } catch (error) {
            console.error("❌ Lỗi khi thuê cleaner:", error);
            message.error("❌ Lỗi khi thuê cleaner");
        }
    };

    // Start a job
    const handleStartJob = async (jobId) => {
        try {
            await startJob(jobId, customerId);
            message.success("✅ Công việc đã bắt đầu!");
        } catch (error) {
            console.error("❌ Lỗi khi bắt đầu công việc:", error);
            message.error("❌ Không thể bắt đầu công việc.");
        }
    };

    // Complete a job
    const handleCompleteJob = async (jobId) => {
        try {
            await completeJob(jobId);
            message.success("✅ Công việc đã hoàn thành!");
        } catch (error) {
            console.error("❌ Lỗi khi hoàn thành công việc:", error);
            message.error("❌ Không thể hoàn thành công việc.");
        }
    };

    // Handle delete job posting
    // const handleDeleteJobPosting = async (jobId) => {
    //     try {
    //         await deleteJobPosting(jobId);
    //         onDelete(jobId);
    //         message.success("✅ Xóa bài đăng thành công!");
    //     } catch (error) {
    //         console.error("❌ Lỗi khi xóa bài đăng:", error);
    //         message.error("❌ Không thể xóa bài đăng.");
    //     }
    // };

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
                    onClick={() => fetchCleanerDetail(record.cleanerId)}
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
                    <Button danger>Từ chối</Button>
                </>
            ),
        }
    ];

    return (
        <div className={styles.cardlist}>
            <div className={styles.container}>
                {data.map((activity, index) => (
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
                                        <p><strong>{service.serviceName}</strong> - {service.serviceDetailAreaRange}</p>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.deleteButton} onClick={() => onDelete(activity.jobId)}>
                                <b>Xóa bài đăng</b>
                            </div>

                            <div className={styles.price}>
                                <b>{activity.totalPrice.toLocaleString("vi-VN")} VNĐ</b>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.footer}>
                            <b style={{ color: getStatusColor(activity.status) }}>{getStatusText(activity.status)}</b>

                            {activity.status === "DONE" && (
                                <div className={styles.reviewButton}>
                                    <FaRegCommentAlt className={styles.reviewIcon} />
                                    <span>Thêm đánh giá</span>
                                </div>
                            )}

                            {activity.status === "OPEN" && (
                                <Badge count={applicationsCount[activity.jobId] || 0} size="small">
                                    <Button type="primary" className={styles.statusButton}
                                        onClick={() => openModal(activity.jobId)}>
                                        Xem thông tin Cleaner
                                    </Button>
                                </Badge>
                            )}
                            {activity.status === "ARRIVED" && (
                                <Button type="primary" className={styles.statusButton}
                                    onClick={() => handleStartJob(activity.jobId)}>
                                    Bắt đầu làm việc
                                </Button>
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
        </div>
    );
};