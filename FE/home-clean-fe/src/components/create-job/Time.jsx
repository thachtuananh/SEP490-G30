import React, { useState, useEffect } from "react";
import { Card, Button, DatePicker, TimePicker, Typography, Row, Col, Space, Input, Divider, InputNumber } from "antd";
import { EditOutlined, ClockCircleOutlined } from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Time.module.css";
import dayjs from "dayjs";
const { Title, Text, Paragraph } = Typography;

const Time = ({ onTimeChange }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(dayjs());
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        // Khởi tạo thời gian ban đầu
        const now = new Date();
        const currentDayjs = dayjs();

        // Use current time directly without adding 30 minutes
        setSelectedTime(currentDayjs);
        setCurrentTime(currentDayjs);

        // Pass current time to parent component
        onTimeChange(selectedDate, currentDayjs.hour(), currentDayjs.minute());

        // Thiết lập interval để cập nhật thời gian thực mỗi 30 giây
        const timer = setInterval(() => {
            const updatedTime = dayjs();
            setCurrentTime(updatedTime);

            // If you want to automatically update the selected time as well:
            // setSelectedTime(updatedTime);
            // onTimeChange(selectedDate, updatedTime.hour(), updatedTime.minute());
        }, 30000);

        // Dọn dẹp interval khi component unmount
        return () => clearInterval(timer);
    }, []);

    const handleDateChange = (date) => {
        if (!date) return;

        const selectedDateObj = date.toDate();
        const now = new Date();

        if (selectedDateObj < now.setHours(0, 0, 0, 0)) return;

        setSelectedDate(selectedDateObj);

        // Nếu chọn ngày hôm nay, kiểm tra thời gian
        if (selectedDateObj.toDateString() === new Date().toDateString()) {
            if (selectedTime.isBefore(currentTime)) {
                // Thêm 30 phút vào thời gian hiện tại làm mặc định
                const defaultTime = currentTime.add(30, 'minute');
                setSelectedTime(defaultTime);
                onTimeChange(selectedDateObj, defaultTime.hour(), defaultTime.minute());
            } else {
                onTimeChange(selectedDateObj, selectedTime.hour(), selectedTime.minute());
            }
        } else {
            onTimeChange(selectedDateObj, selectedTime.hour(), selectedTime.minute());
        }
    };

    const handleTimeChange = (time) => {
        if (!time) return;

        // Kiểm tra nếu ngày đã chọn là hôm nay và thời gian đã chọn < thời gian hiện tại
        if (selectedDate.toDateString() === new Date().toDateString() &&
            time.isBefore(currentTime)) {
            // Thêm 15 phút vào thời gian hiện tại làm mặc định
            const defaultTime = currentTime.add(15, 'minute');
            setSelectedTime(defaultTime);
            onTimeChange(selectedDate, defaultTime.hour(), defaultTime.minute());
        } else {
            setSelectedTime(time);
            onTimeChange(selectedDate, time.hour(), time.minute());
        }
    };

    // Tùy chỉnh rendering ngày để vô hiệu hóa các ngày trong quá khứ
    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    // Vô hiệu hóa các tùy chọn thời gian trong quá khứ nếu ngày đã chọn là hôm nay
    const disabledTime = () => {
        if (selectedDate.toDateString() === new Date().toDateString()) {
            return {
                disabledHours: () => Array.from({ length: currentTime.hour() }, (_, i) => i),
                disabledMinutes: (selectedHour) =>
                    selectedHour === currentTime.hour()
                        ? Array.from({ length: currentTime.minute() }, (_, i) => i)
                        : []
            };
        }
        return {};
    };

    return (
        <div className={styles.container}>
            <Title level={5}>Thời gian làm việc</Title>
            <div className={styles.selectedDate}>

                <Paragraph>Chọn thời gian</Paragraph>
                <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleDateChange}
                    disabledDate={disabledDate}
                    placeholder="Chọn ngày"
                    className={styles.datePicker}
                    size="large"
                    value={dayjs(selectedDate)}
                    showNow={false}
                />
            </div>
            {/* <Card className={styles.card}>
                <div className={styles.selectedDate}>
                    <Paragraph>Chọn ngày làm</Paragraph>

                </div>
            </Card> */}

            <div className={styles.timeSelection}>
                <div className={styles.timeHeader}>
                    <Title level={5}>Chọn giờ làm việc</Title>
                    <Paragraph>Giờ mà người giúp việc sẽ đến</Paragraph>
                </div>
                <div className={styles.timeInputGroup}>
                    <TimePicker
                        format="HH:mm"
                        value={selectedTime}
                        onChange={handleTimeChange}
                        disabledTime={disabledTime}
                        size="large"
                        className={styles.timePicker}
                        hideDisabledOptions={true}
                        use12Hours={false}
                        allowClear={false}
                        showNow={false}
                    />
                    {/* <Button
                        icon={<ClockCircleOutlined />}
                        onClick={handleUpdateToCurrentTime}
                        className={styles.updateTimeButton}
                        title="Cập nhật thời gian hiện tại + 30 phút"
                    >
                        Cập nhật
                    </Button> */}
                </div>
                {/* <div className={styles.currentTimeDisplay}>
                    <Paragraph>
                        Thời gian hiện tại: {currentTime.format('HH:mm')} |
                        Thời gian đã chọn: {selectedTime.format('HH:mm')}
                    </Paragraph>
                </div> */}
            </div>

            <div className={styles.phoneSection}>
                <div className={styles.phoneInfo}>
                    <Title level={5}>Số điện thoại</Title>
                    <Paragraph>Nhân công sẽ liên hệ với bạn khi đến nơi</Paragraph>
                </div>
                <div className={styles.phoneContainer}>
                    <Col flex="auto">
                        <Input
                            value="0384244398"
                            disabled
                        />
                    </Col>
                </div>
            </div>
        </div>
    );
};

export default Time;