import React, { useState, useEffect } from "react";
import styles from "../components/activityJob/JobList.module.css";
import JobListHeader from "../components/activityJob/JobListHeader";
import TabSelector from "../components/activityJob/TabSelector";
import JobCard from "../components/activityJob/JobCard";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";

const ActivityJob = () => {
    const [activeTab, setActiveTab] = useState("active");
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const cleanerId = localStorage.getItem("cleanerId");
        const token = localStorage.getItem("token");

        if (!cleanerId || !token) {
            console.error("Missing cleanerId or token in localStorage");
            return;
        }

        fetch(`http://localhost:8080/api/cleaner/${cleanerId}/listjobsapply`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => setJobs(data))
            .catch((error) => console.error("Error fetching jobs:", error));
    }, []);

    return (
        <>
            <Navbar />
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
                    {jobs.map((job) => (
                        <JobCard key={job.jobId} job={job} />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ActivityJob;