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
        setSelectedDate(date);
        onTimeChange(date, hour, minute);
    };

    const handleHourChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 23) value = 23;
        setHour(value);
        onTimeChange(selectedDate, value, minute);
    };

    const handleMinuteChange = (e) => {
        let value = e.target.value.replace(/^0+/, "");
        value = parseInt(value, 10);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 59) value = 59;
        setMinute(value);
        onTimeChange(selectedDate, hour, value);
    };

    return (
        <div className={styles.container}>
            <h4>Thời gian làm việc</h4>
            <p>Chọn thời gian</p>

            <Card className={styles.card}>
                <div className={styles.weekNavigation}>
                    <Button onClick={() => setWeekOffset(weekOffset - 7)}>Tuần trước</Button>
                    <Button onClick={() => setWeekOffset(weekOffset + 7)}>Tuần tiếp theo</Button>
                </div>

                <div className={styles.selectedDate}>
                    <p>Chọn ngày làm</p>
                    <p>
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
                            className={`${styles.dayButton} ${selectedDate?.toDateString() === day.fullDate.toDateString() ? styles.selected : ""
                                }`}
                            onClick={() => handleDateChange(day.fullDate)}
                        >
                            <b>{day.label}</b>
                            {day.date}
                        </Button>
                    ))}
                </div>
            </Card>

            <div className={styles.timeSelection}>
                <h4>Chọn giờ làm việc</h4>
                <p>Giờ mà người giúp việc sẽ đến</p>
                <div className={styles.timeInputGroup}>
                    <div className={styles.timeInput}>
                        <input type="number" value={hour} onChange={handleHourChange} min="0" max="23" />
                        <span>h</span>
                    </div>
                    <span className={styles.timeSeparator}>:</span>
                    <div className={styles.timeInput}>
                        <input type="number" value={minute} onChange={handleMinuteChange} min="0" max="59" />
                        <span>p</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Time;
