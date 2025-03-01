import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import WorkDetailsDesCription from "../../components/work/WorkDetailsDescription";
import ServiceCard from "../../components/service-details/ServiceCard";
import styles from "../../assets/CSS/work/WorkDetails.module.css";

const WorkDetails = () => {
    return (
        <div className={styles.container}>
            <div className={styles.backButton}>
                <Link to="/homeclean" className={styles.backLink}>
                    <FaArrowLeft />
                    <span>Quay lại trang chủ</span>
                </Link>
            </div>

            <WorkDetailsDesCription />

            <div className={styles.similarServices}>
                <h2 className={styles.sectionTitle}>Dịch vụ tương tự</h2>
                <div className={styles.serviceList}>
                    {Array(5)
                        .fill(null)
                        .map((_, index) => (
                            <ServiceCard key={index} />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default WorkDetails;