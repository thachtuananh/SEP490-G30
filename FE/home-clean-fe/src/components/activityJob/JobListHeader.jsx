import React from "react";
import styles from "./JobList.module.css";

const JobListHeader = ({ title, subtitle }) => {
  return (
    <header className={styles.titleSection}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
};

export default JobListHeader;