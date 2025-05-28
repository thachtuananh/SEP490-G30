import style from "../../assets/CSS/Service/ServiceDescription.module.css";

const ServiceDescription = ({ description }) => {
  const tabs = [
    { id: "desc", label: "Mô tả dịch vụ", active: true },
    // { id: "reviews", label: "Đánh giá", active: false },
  ];

  return (
    <div className={style.serviceDescriptionContainer}>
      <div className={style.serviceTabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${style.serviceTab} ${
              tab.active ? style.activeTab : ""
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={style.serviceTabContent}>
        {description ? (
          <p className={style.descriptionText}>{description}</p>
        ) : (
          <div className={style.noDescription}>
            <i className={style.noDescriptionIcon}>ℹ️</i>
            <p>Không có mô tả dịch vụ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDescription;
