import styles from "./styles.module.css";

export const ImageGallery = ({ image }) => (
  <section className={styles.imageSection}>
    <div className={styles.mainImage}>
      {image ? <img src={image} alt="Cleaner Profile" /> : <p>Không có ảnh</p>}
    </div>
    {/* <div className={styles.thumbnailContainer}>
      <div className={styles.thumbnail} />
      <div className={styles.thumbnail} />
      <div className={styles.thumbnail} />
      <div className={styles.thumbnail} />
    </div> */}
  </section>
);
