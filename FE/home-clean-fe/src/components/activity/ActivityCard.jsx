import React, { useEffect, useState, useContext } from "react";
import { Modal, List, Button, Table, message } from "antd";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import { FaRegCommentAlt } from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export const ActivityCard = ({ data, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cleanerList, setCleanerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCleaner, setSelectedCleaner] = useState(null);
    const { customerId } = useContext(AuthContext);
    const [selectedJobId, setSelectedJobId] = useState(null);

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
            case "OPEN": return "Đang mở";
            case "PENDING_APPROVAL": return "Chờ phê duyệt";
            case "IN_PROGRESS": return "Đang thực hiện";
            case "ARRIVED": return "Đã đến nơi";
            case "STARTED": return "Đã bắt đầu";
            case "COMPLETED": return "Đã hoàn thành";
            case "CANCELLED": return "Đã hủy";
            case "DONE": return "Hoàn tất";
            case "BOOKED": return "Đã đặt lịch";
            default: return "Không xác định";
        }
    };

    //  API LIST CLEARN
    const fetchCleaners = async (jobId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const response = await axios.get(`http://localhost:8080/api/customer/applications/${customerId}/${jobId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setCleanerList(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cleaner:", error);
        }
        setLoading(false);
    };

    //  API DETAILS
    const fetchCleanerDetail = async (cleanerId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8080/api/customer/cleaner/${cleanerId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setSelectedCleaner(response.data); // Lưu dữ liệu cleaner vào state
        } catch (error) {
            console.error("Lỗi khi lấy thông tin cleaner:", error);
        }
        setLoading(false);
    };

    const openModal = (jobId) => {
        setIsModalOpen(true);
        fetchCleaners(jobId); // Gọi API khi mở modal
        setSelectedJobId(jobId);
    };

    //  API THUE
    const handleHireCleaner = async (jobId, cleanerId, customerId) => {
        if (!jobId) {
            console.error("Không tìm thấy jobId!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8080/api/customer/accept-job/${jobId}/cleaner/${cleanerId}/customer/${customerId}`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("✅ Thuê cleaner thành công!", { jobId, cleanerId, customerId });
            message.success("✅ Thuê cleaner thành công!");
        } catch (error) {
            console.error("❌ Lỗi khi thuê cleaner:", error);
            message.error("❌ Lỗi khi thuê cleaner");
        }
    };


    //  API BAT DAU LAM VIEC
    const handleStartJob = async (jobId) => {
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const customerId = localStorage.getItem("customerId");
            await axios.post(
                `http://localhost:8080/api/customer/job/start/${jobId}/${customerId}`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    },
                }
            );
            message.success("✅ Công việc đã bắt đầu!");
            // Cập nhật trạng thái công việc thành "STARTED"
        } catch (error) {
            console.error("❌ Lỗi khi bắt đầu công việc:", error);
            message.error("❌ Không thể bắt đầu công việc.");
        }
    };

    const handleCompleteJob = async (jobId) => {
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            await axios.post(
                `http://localhost:8080/api/customer/job/done/customer/${jobId}`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    },
                }
            );
            message.success("✅ Công việc đã hoàn thành!");
        } catch (error) {
            console.error("❌ Lỗi khi hoàn thành công việc:", error);
            message.error("❌ Không thể hoàn thành công việc.");
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
                    onClick={() => fetchCleanerDetail(record.cleanerId)}
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
                    >
                        Thuê
                    </Button>
                    <Button type="danger">Từ chối</Button>
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
                                <h3>{activity.serviceName}</h3>
                                {/* <p className={activity.createdAt === "Vừa xong" ? styles.timeNew : styles.timeOld}>
                                    {new Date(activity.createdAt).toLocaleDateString("vi-VN")} -
                                    {new Date(activity.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </p> */}
                            </div>

                            <p><MdCalendarToday className={styles.icon} /> {new Date(activity.scheduledTime).toLocaleDateString("vi-VN")}</p>
                            <p><MdAccessTime className={styles.icon} /> {new Date(activity.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>

                            <div className={styles.location}>
                                <MdLocationOn className={styles.icon} /> {activity.customerAddress}
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
                                <Button type="primary" className={styles.statusButton}
                                    onClick={() => openModal(activity.jobId)}>
                                    Xem thông tin Cleaner
                                </Button>
                            )}
                            {activity.status === "ARRIVED" && (
                                <Button type="primary" className={styles.statusButton}
                                    onClick={() => handleStartJob(activity.jobId, selectedCleaner?.cleanerId)}>
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
                        <Button className="back-btn" onClick={() => setSelectedCleaner(null)}>Quay lại</Button>
                    </>
                ) : cleanerList.length === 0 && !loading ? (
                    <div style={{ textAlign: "center", padding: "20px", fontSize: "16px", color: "#888" }}>
                        Chưa có Cleaner nào nhận việc
                    </div>
                ) : (
                    <Table
                        dataSource={cleanerList}
                        columns={columns}
                        rowKey="cleanerId"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </Modal>


        </div>
    );
};