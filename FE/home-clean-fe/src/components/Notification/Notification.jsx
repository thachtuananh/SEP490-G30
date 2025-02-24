import React from "react";
import { FaRegNewspaper } from "react-icons/fa";
import anhdaidien from "../../assets/bgintroduce.png";
import styles from "../../assets/CSS/Notification/Notification.module.css";

export const Notification = () => {
    let data = [
        { id: 1, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 2, tittle: "Hết hạn đăng tải công việc", time: "14:56", day: "Thứ 4" },
        { id: 3, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 4, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 5, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 6, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
    ];

    // Sắp xếp data theo ID giảm dần (mới nhất lên trên)
    data = data.sort((a, b) => b.id - a.id);

    // ID lớn nhất (mới nhất)
    const latestId = data[0].id;

    return (
        <div className={styles.container}>
            {data.slice(0, 5).map((item) => (
                <div key={item.id} className={styles.notificationItem}>
                    <div className={styles.header}>
                        <div className={styles.iconWrapper}>
                            <FaRegNewspaper />
                        </div>
                        <div className={styles.headerText}>
                            <b>{item.tittle}</b>
                            <p className={styles.timestamp}>{item.day}: {item.time}</p>
                        </div>
                    </div>

                    {item.id === latestId && (
                        <div className={styles.card}>
                            <div>
                                <img className={styles.image} src={anhdaidien} alt="ảnh đại diện" />
                            </div>
                            <div className={styles.cardContent}>
                                <strong>{item.name}</strong>
                                <p>Dọn phòng ngủ</p>
                                <p className={styles.phone}>{item.phone}</p>
                            </div>
                            <button className={styles.viewButton}>Xem</button>
                        </div>
                    )}
                </div>
            ))}
            <div className={styles.more}>Xem thêm</div>
        </div>
    );
};
