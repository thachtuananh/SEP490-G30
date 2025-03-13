import { Link } from "react-router-dom";

function CleanerCard({ cleanerId, cleanerImg, cleanerName, rating, reviews }) {
  return (
    <div className="service-card">
      <div className="card-image">
        <img src={cleanerImg} alt={cleanerName} />
      </div>
      <div className="card-content">
        <h3 className="service-title">{cleanerName}</h3>
        <p
          className="service-description"
        // style={{
        //   height: 72,
        //   overflow: "hidden",
        //   textOverflow: "ellipsis",
        //   display: "-webkit-box",
        //   WebkitLineClamp: 3,
        //   WebkitBoxOrient: "vertical"
        // }}
        >
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
  );
}

export default CleanerCard;
