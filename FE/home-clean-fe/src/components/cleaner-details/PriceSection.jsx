import { ChatIcon } from "./ChatIcon";
import styles from "./styles.module.css";

export const PriceSection = () => (
  <section className={styles.priceSection}>
    <p className={styles.price}>170.000 đ</p>
    <div className={styles.actionButtons}>
      <button className={styles.chatButton}>
        <ChatIcon />
        <span>Chat ngay</span>
      </button>
      <button className={styles.hireButton}>Thuê ngay</button>
    </div>
  </section>
);
