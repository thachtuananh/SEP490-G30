import React from "react";
import { ActivityCard } from "../components/activity/ActivityCard";
import styles from "../components/activity/ActivityList.module.css";

export const ActivityList = () => {
    return (
        <div className={styles.actlist}>
            <div className={styles.container}>
                <h2 className={styles.title}>Hoạt động gần đây</h2>
                <p className={styles.subtitle}>Quản lý các hoạt động đăng bài</p>
                <ActivityCard />
            </div>
        </div>
    );
};
