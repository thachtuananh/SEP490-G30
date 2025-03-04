import React from "react";
import styles from "./JobList.module.css";

const JobListHeader = () => {
  return (
    <header className={styles.titleSection}>
      <h1 className={styles.title}>Danh sách công việc đã nhận</h1>
      <p className={styles.subtitle}>
        Xem những công việc mà bận đã và đang làm
      </p>
    </header>
  );
};

export default JobListHeader;
