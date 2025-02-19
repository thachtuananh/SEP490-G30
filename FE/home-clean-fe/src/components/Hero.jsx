function Hero() {
    return (
      <div className="hero">
        <div className="hero-content">
          <h1>Nhà Sạch - Sống Vui</h1>
          <p>
            Một không gian sống mới đang không chỉ mang lại sự thoải mái, mà còn chứa đựng tinh thần hướng cuộc sống một
            cách trọn vẹn hơn. Với dịch vụ dọn dẹp chuyên nghiệp của chúng tôi, ngôi nhà của bạn sẽ luôn sạch sẽ, thoáng
            mát, giúp bạn thư giãn và hạnh phúc hơn mỗi ngày!
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">4.8 ★</span>
              <span className="stat-label">Rating on appstore</span>
            </div>
            <div className="stat">
              <span className="stat-value">135K+</span>
              <span className="stat-label">Active users</span>
            </div>
            <div className="stat">
              <span className="stat-value">135K</span>
              <span className="stat-label">Active users</span>
            </div>
          </div>
          <button className="hire-btn">Thuê ngay</button>
        </div>
      </div>
    )
  }
  
  export default Hero
  
  