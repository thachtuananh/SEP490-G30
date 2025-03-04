import React, { useEffect, useState } from "react";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import { FaArchive, FaRegCommentAlt } from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";

export const ActivityCard = ({ data, onDelete }) => {
    const [isView, setIsView] = useState(false);

    //  API GET
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                document.body.style.overflow = isView ? "hidden" : "auto";
            } else {
                document.body.style.overflow = "auto";
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") setIsView(false);
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("keydown", handleEscape);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [isView]);

    //  TRANG THAI
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


    return (
        <div className={styles.cardlist}>
            <div className={styles.container}>
                {data.map((activity, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.header}>
                                <h3>{activity.serviceName}</h3>
                                <p className={activity.createdAt === "Vừa xong" ? styles.timeNew : styles.timeOld}>
                                    {new Date(activity.createdAt).toLocaleDateString("vi-VN")} -
                                    {new Date(activity.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </p>
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
                            <b style={{ color: getStatusColor(activity.status) }}>{activity.status}</b>

                            {activity.status === "Đã hoàn thành" && (
                                <div className={styles.reviewButton}>
                                    <FaRegCommentAlt className={styles.reviewIcon} />
                                    <span>Thêm đánh giá</span>
                                </div>
                            )}

                            {activity.status === "OPEN" && (
                                <div className={styles.viewButton} onClick={() => setIsView(true)}>
                                    Xem thông tin Cleaner
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isView && (
                    <div className={styles.modal}>
                        <div className={styles.overlay} onClick={() => setIsView(false)}></div>

                        <div className={styles.popup}>
                            <InfoCleanerCard />

                            <p
                                className={styles.exitButton}
                                onClick={() => setIsView(false)}
                            >
                                Đóng
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};