import React, { useState } from "react";
import styles from "../components/activityJob/JobList.module.css";
import JobListHeader from "../components/activityJob/JobListHeader";
import TabSelector from "../components/activityJob/TabSelector";
import JobCard from "../components/activityJob/JobCard";

const ActivityJob = () => {
    const [activeTab, setActiveTab] = useState("active");

    return (
        <div className={styles.container}>
            <div className={styles.containerbody}>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />

                <JobListHeader />
                <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
                <JobCard />
            </div>
        </div>
    );
};

export default ActivityJob;
