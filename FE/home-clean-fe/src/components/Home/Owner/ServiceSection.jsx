import ServiceCard from "./ServiceCard";

const services = [
  {
    id: 1,
    image: "https://lotushotel.vn/wp-content/uploads/2021/01/7-quy-tac-don-phong-khach-san-housekeeping-can-nho-thay-ga-giuong-sach-se.jpg",
    title: "Dịch vụ dọn phòng khách",
    description: "Giữ không gian phòng khách luôn sạch sẽ, ngăn nắp, mang lại cảm giác thoải mái và sang trọng.",
    rating: 4.8,
    reviews: 150,
    price: "100.000",
  },
  {
    id: 2,
    image: "https://www.cleanipedia.com/images/5iwkm8ckyw6v/45bh8zwYG31C8o3jzwBPhV/2d978a35cdfd3b05b19508eea61b6400/NS1tYXUtdGhpZXQta2Utbm9pLXRoYXQtcGhvbmctbmd1LTIwbTItaGllbi1kYWktdmEtc2lldS10aWVuLW5naGktMi5qcGc/600w/ph%C3%B2ng-ng%E1%BB%A7-s%E1%BA%A1ch-s%E1%BA%BD-v%E1%BB%9Bi-gi%C6%B0%E1%BB%9Dng%2C-t%E1%BB%A7-qu%E1%BA%A7n-%C3%A1o%2C-k%E1%BB%87-s%C3%A1ch-v%C3%A0-khu-v%E1%BB%B1c-l%C3%A0m-vi%E1%BB%87c..jpg",
    title: "Dịch vụ dọn phòng ngủ",
    description: "Đảm bảo phòng ngủ luôn sạch sẽ, thơm mát, giúp bạn có giấc ngủ ngon và thoải mái.",
    rating: 4.7,
    reviews: 120,
    price: "80.000",
  },
  {
    id: 3,
    image: "https://file.hstatic.net/1000317132/file/38879381_l_b3812863aa1e4f9a9b30a8149bbe54b4_grande.jpg",
    title: "Dịch vụ dọn phòng bếp",
    description: "Làm sạch khu vực bếp, loại bỏ dầu mỡ và vi khuẩn, đảm bảo không gian nấu ăn luôn an toàn và vệ sinh.",
    rating: 4.9,
    reviews: 200,
    price: "150.000",
  },
  {
    id: 4,
    image: "https://www.cleanipedia.com/images/5iwkm8ckyw6v/6zPlOPMSf6eW14h6Qbidgk/8fd8f93e07635f59606ef57bb83eb27c/bmVuLWRvbi1kZXAtbmhhLXZlLXNpbmgtbWF5LWxhbi1tb3QtdHVhbi00LWJpLWtpcC1sYW0tc2FjaC1oaWV1LXF1YS5qcGVn/1200w/tay-ng%C6%B0%E1%BB%9Di-%C4%91eo-g%C4%83ng-tay-cao-su-m%C3%A0u-v%C3%A0ng-%C4%91ang-lau-g%E1%BA%A1ch-men-tr%E1%BA%AFng..jpg",
    title: "Dịch vụ dọn nhà vệ sinh",
    description: "Tẩy rửa và khử trùng nhà vệ sinh kỹ lưỡng, giúp không gian luôn sạch bóng và không có mùi khó chịu.",
    rating: 4.6,
    reviews: 100,
    price: "120.000",
  },
];

function ServiceSection({ title }) {
  return (
    <section className="service-section">
      <h2 className="section-title">{title}</h2>
      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </section>
  );
}

export default ServiceSection;
