import React, { useState } from "react";
import Time from '../../components/create-job-to-cleaner/Time';
import Note from '../../components/create-job-to-cleaner/Note';
import { Typography } from "antd";

import Pay from '../../components/create-job-to-cleaner/Pay';
import JobInfomation from "../../components/create-job-to-cleaner/JobInfomation";
import styles from "../../assets/CSS/createjob/CreateJob.module.css";

const { Title, Text, Paragraph } = Typography;

const CreateJob = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash"); // Default payment method

    const handleTimeChange = (date, hour, minute) => {
        setSelectedDate(date);
        setHour(hour);
        setMinute(minute);
    };
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };
    return (
        <div className={styles.createJobContainer}>
            <div className={styles.createJobContent}>
                <Title level={3} style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Chọn thời gian bắt đầu </Title>
                <Time onTimeChange={handleTimeChange} />
                <Note />
                <Pay onPaymentMethodChange={handlePaymentMethodChange} />
                <Title level={3} className={styles.sectionTitle} style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Thông tin công việc</Title>
                <JobInfomation
                    selectedDate={selectedDate}
                    hour={hour}
                    minute={minute}
                    paymentMethod={paymentMethod}
                />
            </div>
        </div>
    );
};

export default CreateJob;