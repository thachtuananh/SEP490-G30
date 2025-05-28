import styles from "../../assets/CSS/Service/ServiceCard.module.css";
import serviceImg from "../../assets/imgService/service-suggest.png";
import avatarRated from "../../assets/imgService/avatar-rated.png";
import StarIcon from "../../components/iconsvg/StarIcon";
import { Link } from "react-router-dom";

const ServiceCard = ({
  id,
  image,
  title,
  description,
  rating,
  reviews,
  serviceId,
}) => {
  // Use the provided image or fallback to default
  const displayImage = image || serviceImg;

  // Generate random rating if not provided
  const displayRating = rating || (Math.random() * 2 + 3).toFixed(1);

  // Generate random reviews count if not provided
  const displayReviews = reviews || Math.floor(Math.random() * 100 + 20);

  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceImageContainer}>
        <div className={styles.serviceStatus}></div>
        <img
          className={styles.serviceImage}
          src={displayImage}
          alt={title || "Service"}
        />
      </div>

      <div className={styles.serviceInfo}>
        <h3 className={styles.serviceName}>{title || "Dịch vụ"}</h3>
        <p className={styles.serviceDescription}>
          {description || "Thông tin dịch vụ chưa cập nhật"}
        </p>
      </div>

      <div className={styles.serviceFooter}>
        <div className={styles.ratingSection}>
          <div className={styles.ratingContainer}>
            <p className={styles.ratingStars}>
              {displayRating} <StarIcon />
            </p>
            <p className={styles.ratingCount}>({displayReviews})</p>
          </div>
          <div className={styles.avatarContainer}>
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <img
                  key={index}
                  className={styles.avatar}
                  src={avatarRated}
                  alt="Rated Avatar"
                  style={{ zIndex: 5 - index }}
                />
              ))}
          </div>
        </div>

        <Link
          className={styles.hireNowButton}
          to={`/service/${id}`}
          state={serviceId}
        >
          <button className={styles.hireButton}>
            <span>Thuê Ngay</span>
            <svg
              className={styles.arrowIcon}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
