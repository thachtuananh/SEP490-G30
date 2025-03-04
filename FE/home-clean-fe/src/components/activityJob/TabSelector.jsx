import React from "react";
import styles from "./JobList.module.css";

const TabSelector = ({ activeTab, onTabChange }) => {
  return (
    <nav className={styles.tabs}>
      <button
        className={activeTab === "active" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("active")}
      >
        Công việc đang làm
      </button>
      <button
        className={activeTab === "completed" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("completed")}
      >
        Công việc đã làm
      </button>
    </nav>
  );
};

export default TabSelector;
