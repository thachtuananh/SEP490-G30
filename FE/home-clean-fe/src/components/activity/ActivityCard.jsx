import React, { useEffect, useState } from "react";
import { InfoCleanerCard } from "../activity/InfoCleanerCard";
import styles from "../activity/ActivityCard.module.css";
import { FaArchive, FaRegCommentAlt } from "react-icons/fa";
import { MdCalendarToday, MdLocationOn, MdAccessTime } from "react-icons/md";

export const ActivityCard = () => {
    const [isView, setIsView] = useState(false);

    const data = [
        {
            title: "Dọn phòng ngủ",
            time: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            duration: "3 giờ - Từ 13:00 đến 16:00",
            location: "Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đả...",
            price: "900.000 VND",
            status: "Đang chờ...",
        },
        {
            title: "Dọn phòng khách",
            time: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            duration: "3 giờ - Từ 13:00 đến 16:00",
            location: "Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đả...",
            price: "900.000 VND",
            status: "Đang chờ...",
        },
        {
            title: "Dọn bếp",
            time: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            duration: "3 giờ - Từ 13:00 đến 16:00",
            location: "Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đả...",
            price: "900.000 VND",
            status: "Đang thực hiện",
        },
        {
            title: "Dọn bếp",
            time: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            duration: "3 giờ - Từ 13:00 đến 16:00",
            location: "Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đả...",
            price: "900.000 VND",
            status: "Đã hoàn thành",
        },
    ];

    // Xử lý ẩn/hiện popup khi resize hoặc bấm ESC
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

    return (
        <div className={styles.cardlist}>
            <div className={styles.container}>
                {data.map((activity, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.header}>
                                <h3>{activity.title}</h3>
                                <p className={activity.time === "Vừa xong" ? styles.timeNew : styles.timeOld}>
                                    {activity.time}
                                </p>
                            </div>

                            <p><MdCalendarToday className={styles.icon} /> {activity.date}</p>
                            <p><MdAccessTime className={styles.icon} /> {activity.duration}</p>

                            <div className={styles.location}>
                                <MdLocationOn className={styles.icon} /> {activity.location}
                            </div>

                            <div className={styles.deleteButton}>
                                <b>Xóa bài đăng</b>
                                <FaArchive className={styles.deleteIcon} />
                            </div>

                            <div className={styles.price}>
                                <b>{activity.price}</b>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.footer}>
                            <b>{activity.status}</b>

                            {activity.status === "Đã hoàn thành" && (
                                <div className={styles.reviewButton}>
                                    <FaRegCommentAlt className={styles.reviewIcon} />
                                    <span>Thêm đánh giá</span>
                                </div>
                            )}

                            {activity.status === "Đang chờ..." && (
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