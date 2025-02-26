import React from 'react';

function FeaturesSection() {
  const features = [
    {
      id: 1,
      icon: "🚚",
      title: "Tiện lợi",
      description: "Đơn đẹp theo nhu cầu"
    },
    {
      id: 2,
      icon: "🏆",
      title: "Chuyên nghiệp",
      description: "Nhanh nhẹn - Sạch sẽ"
    },
    {
      id: 3,
      icon: "💬",
      title: "Chăm sóc khách hàng",
      description: "Đội ngũ trực tuyến 24/7"
    },
    {
      id: 4,
      icon: "💰",
      title: "Tối ưu chi phí",
      description: "Cung cấp dịch vụ mức giá tốt nhất"
    }
  ];

  return (
    <section className="features-section">
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;