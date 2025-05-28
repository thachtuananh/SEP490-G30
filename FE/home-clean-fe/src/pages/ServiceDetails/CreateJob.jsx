import React, { useState } from "react";
import Time from "../../components/create-job/Time";
import Note from "../../components/create-job/Note";
import { Typography } from "antd";

import Pay from "../../components/create-job/Pay";
import JobInfomation from "../../components/create-job/JobInfomation";
import styles from "../../assets/CSS/createjob/CreateJob.module.css";

const { Title, Text, Paragraph } = Typography;

const CreateJob = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("VNPay"); // Default payment method
  const [reminder, setReminder] = useState(""); // State for cleaner note/reminder
  const [priceAdjustment, setPriceAdjustment] = useState(null); // State for price adjustment

  const handleTimeChange = (date, hour, minute, adjustment) => {
    setSelectedDate(date);
    setHour(hour);
    setMinute(minute);
    setPriceAdjustment(adjustment);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleNoteChange = (note) => {
    setReminder(note);
  };

  return (
    <div className={styles.createJobContainer}>
      <div className={styles.createJobContent}>
        <Title level={3} style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Chọn thời gian bắt đầu{" "}
        </Title>
        <Time onTimeChange={handleTimeChange} />
        <Note onNoteChange={handleNoteChange} />
        <Pay onPaymentMethodChange={handlePaymentMethodChange} />
        <Title
          level={3}
          className={styles.sectionTitle}
          style={{ fontSize: "1.25rem", fontWeight: "bold" }}
        >
          Thông tin công việc
        </Title>
        <JobInfomation
          selectedDate={selectedDate}
          hour={hour}
          minute={minute}
          paymentMethod={paymentMethod}
          reminder={reminder}
          priceAdjustment={priceAdjustment}
        />
      </div>
    </div>
  );
};

export default CreateJob;
