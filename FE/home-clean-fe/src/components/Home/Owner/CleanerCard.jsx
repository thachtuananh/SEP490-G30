import { Link } from "react-router-dom";

function CleanerCard({ cleanerId, cleanerImg, cleanerName, rating, reviews, isOnline }) {
  return (
    <Link to={`/cleaner/${cleanerId}`} state={{ cleanerId }} style={{ textDecoration: "none" }}>
      <div className="service-card">
        <div className="card-image">
          {/* Đối với hình ảnh base64, cần thêm tiền tố data:image định dạng;base64, */}
          <img
            src={cleanerImg.startsWith('data:') ? cleanerImg : `data:image/jpeg;base64,${cleanerImg}`}
            alt={cleanerName}
          />
        </div>
        <div className="card-content">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 className="service-title">{cleanerName}</h3>
            <p style={{ color: isOnline ? "green" : "gray", fontWeight: "bold" }}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
          <p className="service-description">
            {`Dịch vụ của ${cleanerName}`}
          </p>
          <div className="service-meta">
            <div className="rating">
              <span className="stars">{rating} ★</span>
              <span className="review-count">({reviews} đánh giá)</span>

            </div>
          </div>
          <div className="card-footer">
            <Link to={`/cleaner/${cleanerId}`} state={{ cleanerId }}>
              <button className="hire-btn">Thuê ngay</button>
            </Link>
            <div className="user-avatars">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/30?img=${i}`}
                  alt="User avatar"
                  className="avatar"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CleanerCard;