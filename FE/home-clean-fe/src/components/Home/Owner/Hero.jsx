import style from "../../../styles/hero.module.css";

function Hero() {
  return (
    <div className={style.hero}>
      <div className={style.heroContent}>
        <h1>Nhà Sạch - Sống Vui</h1>
        <p>
          Một không gian sống mới không chỉ mang lại sự thoải mái, mà còn chứa
          đựng tinh thần hướng cuộc sống một cách trọn vẹn hơn. Với dịch vụ dọn
          dẹp chuyên nghiệp của chúng tôi, ngôi nhà của bạn sẽ luôn sạch sẽ,
          thoáng mát, giúp bạn thư giãn và hạnh phúc hơn mỗi ngày!
        </p>
        <div className={style.heroStats}>
          <div className={style.stat}>
            <span className={style.statValue}>4.8 ★</span>
            <span className={style.statLabel}>Rating trên App Store</span>
          </div>
          <div className={style.stat}>
            <span className={style.statValue}>135K+</span>
            <span className={style.statLabel}>Người dùng hoạt động</span>
          </div>
        </div>
        <div className={style.herohireBtn}>
          <button className={style.hireBtn}>Thuê ngay</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
