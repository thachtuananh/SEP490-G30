function ServiceCard() {
  return (
    <div className="service-card">
      <div className="card-image">
        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80" alt="Cleaning Service" />
        <button className="favorite-btn">♡</button>
      </div>
      <div className="card-content">
        <h3 className="service-title">Tên dịch vụ</h3>
        <p className="service-description">Mô tả giới thiệu dịch vụ</p>
        <div className="service-meta">
          <div className="rating">
            <span className="stars">4.8 ★</span>
            <span className="review-count">(150)</span>
          </div>
          <div className="price">100.000đ/h</div>
        </div>
        <div className="card-footer">
          <button className="hire-btn">Thuê ngay</button>
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
  )
}

export default ServiceCard

