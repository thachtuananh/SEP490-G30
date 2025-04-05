import React from "react";
import { Space } from "antd";

function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      rating: 4,
      content:
        "Dịch vụ hoàn thành nhanh chóng, nhân viên tư vấn, hỗ trợ rất nhiệt tình.",
      author: "Chị Trần Thị A",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 2,
      rating: 5,
      content:
        "Tôi rất hài lòng với chất lượng dịch vụ mà đơn vị Houseclean đang cung cấp.",
      author: "Chị Trần Thị B",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 3,
      rating: 5,
      content: "Thông tin về từng dịch vụ được mô tả rõ ràng và chi tiết.",
      author: "Anh Nguyễn Văn C",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
    {
      id: 4,
      rating: 5,
      content: "Thông tin về từng dịch vụ được mô tả rõ ràng và chi tiết.",
      author: "Anh Nguyễn Văn C",
      avatar: "https://i.pravatar.cc/100?img=4",
    },
  ];

  return (
    <section className="testimonial-section">
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <Space>
          <h2 className="section-title">Khách hàng nói gì về chúng tôi</h2>
        </Space>
      </div>
      <div className="testimonial-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`star ${
                    index < testimonial.rating ? "filled" : ""
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="testimonial-content">{testimonial.content}</p>
            <div className="testimonial-author">
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="author-avatar"
              />
              <span className="author-name">{testimonial.author}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialSection;
