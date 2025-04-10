import React from "react";
import styles from "../activity/InfoCleanerCard.module.css";

export const InfoCleanerCard = ({ cleaner }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardContent}>
        {/* Thông tin cơ bản */}
        <div className={styles.basicInfo}>
          <img
            src={`data:image/png;base64,${cleaner.profileImage}`}
            alt="Avatar"
            style={{ borderRadius: "10px" }}
          />
          <strong>Tên : {cleaner.cleanerName}</strong>
          <p>Chuyên môn :</p>
          <div className={styles.divider}></div>
          <p>Năm sinh: </p>
          <p>Giới tính: </p>
          <p>Số điện thoại :</p>
          <p>Email :</p>
        </div>

        {/* Mô tả thông tin */}
        <div className={styles.infoSection}>
          {/* các ô button */}
          {/* <div className={styles.stats}>
                        <div className={styles.statBox}>
                            <p className={styles.statLabel}>Số người theo dõi</p>
                            <b>29 người</b>
                        </div>
                        <div className={styles.statBox}>
                            <p className={styles.statLabel}>Số giờ thuê</p>
                            <b>48h</b>
                        </div>
                        <div className={styles.statBox}>
                            <p className={styles.statLabel}>Tỷ lệ hoàn thành</p>
                            <b>100%</b>
                        </div>
                        <div className={styles.statBox}>
                            <p className={styles.statLabel}>Đánh giá</p>
                            <b>25 đánh giá</b>
                        </div>
                    </div> */}

          {/* Thông tin địa chỉ */}
          {/* <div className={styles.location}>
            <b>Khu vực hoạt động</b>
            <p>Quận A - Quận B - HN</p>
          </div> */}

          {/* Mô tả thông tin */}
          {/* <div className={styles.description}>
                        <b>Thông tin</b>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident,
                            sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div> */}
        </div>
      </div>

      {/* các button */}
      {/* <div className={styles.actionButtons}>
                <div className={styles.rejectButton}>
                    <strong>Từ chối</strong>
                </div>
                <div className={styles.acceptButton}>
                    <strong>Chấp nhận</strong>
                </div>
            </div> */}
    </div>
  );
};
