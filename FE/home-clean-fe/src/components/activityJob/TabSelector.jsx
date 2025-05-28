import React from "react";
import styles from "./JobList.module.css";

const TabSelector = ({ activeTab, onTabChange }) => {
  return (
    <nav className={styles.tabs}>
      <button
        className={activeTab === "doing" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("doing")}
      >
        Đang làm
      </button>
      <button
        className={activeTab === "booked" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("booked")}
      >
        Chủ nhà đặt trực tiếp
      </button>
      <button
        className={activeTab === "applied" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("applied")}
      >
        Đã ứng tuyển
      </button>
      <button
        className={activeTab === "done" ? styles.tabactive : styles.tab}
        onClick={() => onTabChange("done")}
      >
        Đã làm
      </button>
    </nav>
  );
};

export default TabSelector;
