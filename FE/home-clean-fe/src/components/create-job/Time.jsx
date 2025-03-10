import React, { useState, useEffect } from "react";
import { Card, Button } from "antd";
import styles from "../../assets/CSS/createjob/Time.module.css";

const Time = ({ onTimeChange }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const today = new Date();
    today.setDate(today.getDate() + weekOffset);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return {
            label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][i],
            date: day.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
            fullDate: day,
        };
    });

    const [selectedDate, setSelectedDate] = useState(today);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        const now = new Date();
        setHour(now.getHours());
        setMinute(now.getMinutes());
        onTimeChange(today, now.getHours(), now.getMinutes());
    }, []);

    const handleDateChange = (date) => {
        const now = new Date();
        if (date < now.setHours(0, 0, 0, 0)) return; // Chặn chọn ngày trong quá khứ

        setSelectedDate(date);

        // Nếu chọn ngày hôm nay, kiểm tra giờ phút
        if (date.toDateString() === now.toDateString()) {
            const validHour = hour >= now.getHours() ? hour : now.getHours();
            const validMinute = validHour === now.getHours() && minute < now.getMinutes() ? now.getMinutes() : minute;
            setHour(validHour);
            setMinute(validMinute);
            onTimeChange(date, validHour, validMinute);
        } else {
            onTimeChange(date, hour, minute);
        }
    };


    const handleHourChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 23) value = 23;

        const now = new Date();
        if (selectedDate.toDateString() === now.toDateString() && value < now.getHours()) {
            value = now.getHours(); // Không cho chọn giờ nhỏ hơn hiện tại
        }

        setHour(value);
        onTimeChange(selectedDate, value, minute);
    };


    const handleMinuteChange = (e) => {
        let value = parseInt(e.target.value.replace(/^0+/, ""), 10);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 59) value = 59;

        const now = new Date();
        if (selectedDate.toDateString() === now.toDateString() && hour === now.getHours() && value < now.getMinutes()) {
            value = now.getMinutes(); // Không cho chọn phút nhỏ hơn hiện tại nếu giờ trùng
        }

        setMinute(value);
        onTimeChange(selectedDate, hour, value);
    };


    return (
        <div className={styles.container}>
            <h4>Thời gian làm việc</h4>
            <p>Chọn thời gian</p>

            <Card className={styles.card}>
                <div className={styles.weekNavigation}>
                    <Button
                        onClick={() => setWeekOffset(weekOffset - 7)}
                        className={styles.navButton}
                    >
                        Tuần trước
                    </Button>
                    <Button
                        onClick={() => setWeekOffset(weekOffset + 7)}
                        className={styles.navButton}
                    >
                        Tuần tiếp theo
                    </Button>
                </div>

                <div className={styles.selectedDate}>
                    <p>Chọn ngày làm</p>
                    <p className={styles.dateDisplay}>
                        {selectedDate
                            ? `Ngày ${selectedDate.getDate()} - Tháng ${selectedDate.getMonth() + 1} - Năm ${selectedDate.getFullYear()}`
                            : "Chưa chọn ngày"}
                    </p>
                </div>

                <div className={styles.dayList}>
                    {days.map((day) => (
                        <Button
                            key={day.date}
                            type={selectedDate?.toDateString() === day.fullDate.toDateString() ? "primary" : "default"}
                            className={`${styles.dayButton} ${selectedDate?.toDateString() === day.fullDate.toDateString() ? styles.selected : ""}`}
                            onClick={() => handleDateChange(day.fullDate)}
                        >
                            <b>{day.label}</b>
                            <span>{day.date}</span>
                        </Button>
                    ))}
                </div>
            </Card>

            <div className={styles.timeSelection}>
                <div className={styles.timeHeader}>
                    <h4>Chọn giờ làm việc</h4>
                    <p>Giờ mà người giúp việc sẽ đến</p>
                </div>
                <div className={styles.timeInputGroup}>
                    <div className={styles.timeInput}>
                        <input
                            type="number"
                            value={hour}
                            onChange={handleHourChange}
                            min="0"
                            max="23"
                        />
                        <span>h</span>
                    </div>
                    <span className={styles.timeSeparator}>:</span>
                    <div className={styles.timeInput}>
                        <input
                            type="number"
                            value={minute}
                            onChange={handleMinuteChange}
                            min="0"
                            max="59"
                        />
                        <span>p</span>
                    </div>
                </div>
            </div>

            <div className={styles.phoneSection}>
                <div className={styles.phoneInfo}>
                    <h4>Số điện thoại</h4>
                    <p>Nhân công sẽ liên hệ với bạn khi đến nơi</p>
                </div>
                <div className={styles.phoneContainer}>
                    <span className={styles.phonePrefix}>(+84)</span>
                    <span className={styles.phoneNumber}>947736987</span>
                    <button className={styles.changeButton}>
                        Thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Time;