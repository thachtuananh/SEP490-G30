import styles from "./styles.module.css";

export const ServiceInfo = ({ cleanerName }) => {
  return (
    <section className={styles.infoSection}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{cleanerName || "Tên cleaner"}</h1>
          <div className={styles.category}>
            <p className={styles.categoryText}>
              <span className={styles.bold}>Danh mục: </span>
              <span>Dọn nhà, Dọn theo yêu cầu</span>
            </p>
            <div className={styles.divider} />
          </div>
        </div>
        <button className={styles.reportLink}>Tố cáo</button>
      </header>

      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Số người theo dõi</span>
          <span className={styles.statValue}>29 người</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Số giờ thuê</span>
          <span className={styles.statValue}>48h</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Tỷ lệ hoàn thành</span>
          <span className={styles.statValue}>95.98%</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Đánh giá</span>
          <span className={styles.statValue}>25 đánh giá</span>
        </div>
      </div>

      <div className={styles.serviceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Loại dịch vụ</h2>
          <p className={styles.sectionSubtitle}>Hãy chọn dịch vụ mà bạn muốn</p>
        </div>
        <div className={styles.serviceTags}>
          <button className={styles.tag}>Phòng khách</button>
          <button className={`${styles.tag} ${styles.active}`}>
            Phòng ngủ
          </button>
          <button className={styles.tag}>Nhà vệ sinh</button>
          <button className={styles.tag}>Dọn bếp</button>
        </div>
        <div className={styles.serviceTags}>
          <button className={styles.tag}>Tổng vệ sinh toàn nhà</button>
          <button className={styles.tag}>Giặt sofa, thảm</button>
        </div>
      </div>

      <div className={styles.areaSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Diện tích</h2>
          <p className={styles.sectionSubtitle}>Diện tích không gian của bạn</p>
        </div>
        <div className={styles.serviceTags}>
          <button className={styles.tag}>&lt; 20m2</button>
          <button className={`${styles.tag} ${styles.active}`}>
            20m2 - 40m2
          </button>
          <button className={styles.tag}>&gt; 40m2</button>
        </div>
      </div>
    </section>
  );
};
