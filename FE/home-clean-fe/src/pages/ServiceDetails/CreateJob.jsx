import React, { useState } from "react";
import Time from '../../components/create-job/Time';
import Note from '../../components/create-job/Note';
import Pay from '../../components/create-job/Pay';
import JobInfomation from "../../components/create-job/JobInfomation";
import styles from "../../assets/CSS/createjob/CreateJob.module.css";

const CreateJob = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);

    const handleTimeChange = (date, hour, minute) => {
        setSelectedDate(date);
        setHour(hour);
        setMinute(minute);
    };

    return (
        <div className={styles.createJobContainer}>
            <div className={styles.createJobContent}>
                <h3 className={styles.sectionTitle}>Chọn thời gian bắt đầu</h3>
                <Time onTimeChange={handleTimeChange} />
                <Note />
                <Pay />
                <h3 className={styles.sectionTitle}>Thông tin công việc</h3>
                <JobInfomation
                    selectedDate={selectedDate}
                    hour={hour}
                    minute={minute}
                />
            </div>
        </div>
    );
};

export default CreateJob;