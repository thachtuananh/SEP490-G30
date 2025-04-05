import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./JobUpload.module.css";
import { Card } from "antd";

const JobUploadCard = ({ id, icon, title, description, onComboSelect }) => {
  const [truncatedDescription, setTruncatedDescription] = useState("");

  // Hàm cập nhật độ dài chuỗi theo kích thước màn hình
  const updateDescription = () => {
    if (!description) return;

    // if (window.innerWidth <= 700) {
    //   setTruncatedDescription(`${description.substring(0, 40)}...`);
    // } else
    if (window.innerWidth <= 2000) {
      setTruncatedDescription(`${description.substring(0, 20)}...`);
    } else {
      setTruncatedDescription(description);
    }
  };

  // Cập nhật mô tả khi component mount và khi thay đổi kích thước màn hình
  useEffect(() => {
    updateDescription();
    window.addEventListener("resize", updateDescription);

    return () => {
      window.removeEventListener("resize", updateDescription);
    };
  }, [description]);

  return (
    <Card
      hoverable
      style={{ height: "100%", position: "relative", cursor: "default" }}
      bodyStyle={{ height: "100%" }}
    >
      <div className={styles.serviceCard}>
        <div className={styles.iconWrapper}>
          <img src={icon} alt={title} className={styles.serviceIcon} />
        </div>
        <div className={styles.serviceContent}>
          <h3 className={styles.serviceTitle}>{title}</h3>
          <p className={styles.serviceDescription}>
            {truncatedDescription || description}
          </p>
        </div>
        <div className={styles.buttonContainer}>
          {id === 5 ? (
            <button className={styles.serviceButton} onClick={onComboSelect}>
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
    </Card>
  );
};

export default JobUploadCard;
