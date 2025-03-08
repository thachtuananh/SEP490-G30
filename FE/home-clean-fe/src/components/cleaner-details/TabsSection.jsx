import { useState } from "react";
import styles from "./styles.module.css";

export const TabsSection = () => {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <section className={styles.tabsSection}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "info" ? styles.active : ""
            }`}
          onClick={() => setActiveTab("info")}
        >
          Thông tin
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reviews" ? styles.active : ""
            }`}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá
        </button>
      </div>
      <p className={styles.tabContent}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </section>
  );
};
