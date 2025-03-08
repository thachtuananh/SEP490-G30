import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { BackArrowIcon } from "./BackArrowIcon";

export const BackLink = () => (
  <button className={styles.backLink}>
    <BackArrowIcon />
    <Link to="/" style={{ textDecoration: "none" }}>
      <span className={styles.backText}>Quay lại trang chủ</span>
    </Link>
  </button>
);
