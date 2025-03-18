import React from "react";
import styles from "./JobList.module.css";

const TabSelector = ({ activeTab, onTabChange }) => {
  return (
    <nav className={styles.tabs}>
      <button
        className={activeTab === "doing" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("doing")}
      >
        Công việc đang làm
      </button>
      <button
        className={activeTab === "booked" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("booked")}
      >
        Công việc đã được đặt
      </button>
      <button
        className={activeTab === "done" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("done")}
      >
        Công việc đã làm
      </button>
      <button
        className={activeTab === "applied" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("applied")}
      >
        Công việc đã nhận
      </button>
    </nav>
  );
};

export default TabSelector;