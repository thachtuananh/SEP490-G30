import React from "react";
import { Link } from "react-router-dom";
import styles from "./JobUpload.module.css";

const JobUploadCard = ({ id, icon, title, description }) => {
    return (
        <article className={styles.serviceCard}>
            <div className={styles.iconWrapper}>
                <img src={icon} alt={title} className={styles.serviceIcon} />
            </div>
            <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{title}</h3>
                <p className={styles.serviceDescription}>{description}</p>
                <Link to={`/service/${id}`} state={id} className={styles.serviceButton} style={{ textDecoration: "none" }} >Đăng việc</Link>
            </div>
        </article>
    );
};

export default JobUploadCard;
