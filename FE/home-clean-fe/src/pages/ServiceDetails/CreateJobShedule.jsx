import React, { useState } from "react";
import Time from "../../components/create-job-schedule/Time";
import Note from "../../components/create-job-schedule/Note";
import { Typography } from "antd";
import Pay from "../../components/create-job-schedule/Pay";
import JobInfomation from "../../components/create-job-schedule/JobInfomation";
import styles from "../../assets/CSS/createjob/CreateJob.module.css";

const { Title } = Typography;

const CreateJobSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("VNPay");
  const [reminder, setReminder] = useState("");
  const [priceAdjustment, setPriceAdjustment] = useState(null);

  const handleTimeChange = (newSchedules, adjustment) => {
    setSchedules(newSchedules);
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
          Chọn thời gian bắt đầu
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
          schedules={schedules}
          paymentMethod={paymentMethod}
          reminder={reminder}
          priceAdjustment={priceAdjustment}
        />
      </div>
    </div>
  );
};

export default CreateJobSchedule;
