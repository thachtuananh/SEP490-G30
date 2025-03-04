import React from "react";
import styles from "../Owner/JobUpload.module.css";

const JobUploadCard = ({ icon, title, description }) => {
    return (
        <article className={styles.serviceCard}>
            <div dangerouslySetInnerHTML={{ __html: icon }} />
            <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{title}</h3>
                <p className={styles.serviceDescription}>{description}</p>
                <button className={styles.serviceButton}>Đăng việc</button>
            </div>
        </article>
    );
};

export default JobUploadCard;
