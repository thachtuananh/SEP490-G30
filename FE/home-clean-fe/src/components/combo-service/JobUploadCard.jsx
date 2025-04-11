import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./JobUpload.module.css"; // Import your CSS module here
import { Card } from "antd";

const JobUploadCard = ({
  id,
  icon,
  title,
  description,
  onComboSelect,
  isDisabled = false,
}) => {
  const [truncatedDescription, setTruncatedDescription] = useState("");

  // Hàm cập nhật độ dài chuỗi theo kích thước màn hình
  const updateDescription = () => {
    if (!description) return;

    if (window.innerWidth <= 700) {
      setTruncatedDescription(`${description.substring(0, 40)}...`);
    } else if (window.innerWidth <= 3000) {
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

  // Xử lý sự kiện click cho nút Đăng việc
  const handleComboClick = (e) => {
    if (isDisabled) {
      e.preventDefault(); // Ngăn mọi hành động nếu bị vô hiệu hóa
      return;
    }
    if (id === 5 && onComboSelect) {
      onComboSelect();
    }
  };

  return (
    <Card
      hoverable={!isDisabled} // Chỉ hover nếu không bị vô hiệu hóa
      style={{
        height: "100%",
        position: "relative",
        cursor: isDisabled ? "not-allowed" : "default",
        opacity: isDisabled ? 0.6 : 1, // Làm mờ card nếu bị vô hiệu hóa
      }}
      styles={{ body: { height: "100%" } }}
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
            <button
              className={`${styles.serviceButton} ${
                isDisabled ? styles.disabledButton : ""
              }`}
              onClick={handleComboClick}
              disabled={isDisabled}
            >
              Đăng việc
            </button>
          ) : (
            <button
              className={`${styles.serviceButton} ${
                isDisabled ? styles.disabledButton : ""
              }`}
              disabled={isDisabled}
            >
              <Link
                to={isDisabled ? "#" : `/service/${id}`} // Không điều hướng nếu bị vô hiệu hóa
                state={id}
                style={{
                  textDecoration: "none",
                  color: isDisabled ? "#999" : "#29322e",
                  pointerEvents: isDisabled ? "none" : "auto", // Ngăn click vào Link
                }}
                onClick={(e) => isDisabled && e.preventDefault()} // Ngăn hành động mặc định
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
