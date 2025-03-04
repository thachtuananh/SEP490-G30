import React from 'react';

function NewsSection() {
  const news = [
    {
      id: 1,
      date: "27/12/2024",
      title: "Bốn quy tắc của người có nhà cửa gọn gàng",
      description: "Những quy tắc sinh hoạt này nếu được xây dựng và xuy trì thường xuyên sẽ có không gian sống sạch sẽ, ngăn nắp.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&h=200&q=80"
    },
    {
      id: 2,
      date: "12/12/2024",
      title: "Những điều khách chú ý nhất khi đến nhà bạn",
      description: "Có người đến nhà, dù là buổi họp mặt thân mật hay tiệc tối sang trọng, đều có thể gây căng thẳng cho gia chủ.",
      image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=300&h=200&q=80"
    },
    {
      id: 3,
      date: "21/10/2024",
      title: "Bốn phương pháp dọn nhà",
      description: "Ai cũng muốn ngôi nhà của mình gọn gàng, sạch đẹp nhưng rất nhiều người gặp tình trạng đốn mãi mà vẫn bừa bộn.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&h=200&q=80"
    },
    {
      id: 4,
      date: "10/10/2024",
      title: "Cách lau gương không để lại vết",
      description: "Bên cạnh dung dịch để lau, bạn cần dùng đúng loại khăn và kỹ thuật, gương sẽ sáng bóng, không để lại vết.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&h=200&q=80"
    },
    {
      id: 5,
      date: "10/10/2024",
      title: "Cách lau gương không để lại vết",
      description: "Bên cạnh dung dịch để lau, bạn cần dùng đúng loại khăn và kỹ thuật, gương sẽ sáng bóng, không để lại vết.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&h=200&q=80"
    }
  ];

  return (
    <section className="news-section">
      <h2 className="section-title">Tin tức mới nhất</h2>
      <div className="news-grid">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-image">
              <img src={item.image} alt={item.title} />
              <span className="news-date">{item.date}</span>
            </div>
            <div className="news-content">
              <h3 className="news-title">{item.title}</h3>
              <p className="news-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NewsSection;