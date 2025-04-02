import React from "react";
import { Link } from "react-router-dom";
import styles from "./JobUpload.module.css";

const JobUploadCard = ({ id, icon, title, description, onComboSelect }) => {
  // Handle click for service with ID 5 (Combo service)
  const handleServiceClick = () => {
    if (id === 5) {
      onComboSelect();
    }
  };

  // Truncate description if it's too long
  const truncatedDescription =
    description && description.length > 100
      ? `${description.substring(0, 35)}...`
      : description;

  return (
    <div className={styles.serviceCard}>
      <div className={styles.iconWrapper}>
        <img src={icon} alt={title} className={styles.serviceIcon} />
      </div>
      <div className={styles.serviceContent}>
        <h3 className={styles.serviceTitle}>{title}</h3>
        <p className={styles.serviceDescription}>{truncatedDescription}</p>
        {id === 5 ? (
          <button className={styles.serviceButton} onClick={handleServiceClick}>
            Đăng việc
          </button>
        ) : (
          <button className={styles.serviceButton}>
            <Link
              to={`/service/${id}`}
              state={id}
              style={{ textDecoration: "none", color: "#29322e" }}
            >
              Đăng việc
            </Link>
          </button>
        )}
      </div>
    </div>
  );
};

export default JobUploadCard;
