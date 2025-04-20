import React, { useState, useEffect } from "react";
import { Card, Button, Typography } from "antd";
import {
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";
import "../styles/HouseCleanPricing.css";

const { Title, Text, Paragraph } = Typography;

export default function HouseCleanPricingPage() {
  const [currentSlide, setCurrentSlide] = useState(1); // Start with the middle slide (index 1)
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Service data - Designed to match the screenshot layout
  // Service data - Modified to show worker salary information
  const services = [
    {
      id: 0,
      title: "Dọn nhà vệ sinh",
      priceRange: "80-140k",
      unit: "/lần",
      features: ["Hoàn thành trong 30-45 phút", "Không cần kinh nghiệm"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 1,
      title: "Dọn phòng khách",
      priceRange: "150-200k",
      unit: "/lần",
      features: ["Hoàn thành trong 1-2 giờ", "Kinh nghiệm 1 tháng trở lên"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 2,
      title: "Dọn phòng ngủ",
      priceRange: "120-170k",
      unit: "/lần",
      features: ["Hoàn thành trong 45-90 phút", "Kinh nghiệm cơ bản"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 3,
      title: "Dọn dẹp nhà mới xây, sau sửa chữa",
      priceRange: "150-250k",
      unit: "/lần",
      features: ["Công việc yêu cầu kỹ năng", "Thời gian linh hoạt"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 4,
      title: "Dọn phòng bếp",
      priceRange: "130-180k",
      unit: "/lần",
      features: ["Công việc yêu cầu kỹ năng", "Thời gian linh hoạt"],
      serviceLabel: "Thu nhập người dọn",
    },
  ];

  // Calculate previous and next indexes with wrap-around
  const getPrevIndex = (current) => {
    return current === 0 ? services.length - 1 : current - 1;
  };

  const getNextIndex = (current) => {
    return current === services.length - 1 ? 0 : current + 1;
  };

  const handlePrev = () => {
    setCurrentSlide(getPrevIndex(currentSlide));
  };

  const handleNext = () => {
    setCurrentSlide(getNextIndex(currentSlide));
  };

  // Render service card with highlight status
  const renderServiceCard = (service, position) => {
    // Position determines styling:
    // -1: left card (prev), 0: center card (current, highlight), 1: right card (next)
    const isHighlighted = position === 0;

    return (
      <div
        className={
          position === 0
            ? "center-card"
            : position === -1
            ? "left-card"
            : "right-card"
        }
      >
        <Card
          className={isHighlighted ? "card-highlight" : "card-normal"}
          style={{
            backgroundColor: isHighlighted ? "#0D9466" : "white",
          }}
        >
          <div className="card-content">
            <Title
              level={5}
              className={isHighlighted ? "text-white" : "text-dark"}
            >
              {service.serviceLabel}
            </Title>
            <Title
              level={4}
              className={isHighlighted ? "title-white" : "title-dark"}
            >
              {service.title}
            </Title>
            {/* <Text
              className={
                isHighlighted ? "description-light" : "description-dark"
              }
            >
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
            </Text> */}

            <Title
              level={3}
              className={isHighlighted ? "price-white" : "price-dark"}
            >
              {service.priceRange}
              <Text className={isHighlighted ? "unit-light" : "unit-dark"}>
                {service.unit}
              </Text>
            </Title>

            {service.priceNote && isHighlighted && (
              <Text className="subtext-light">{service.priceNote}</Text>
            )}

            <div className="features-container">
              <Text
                className={
                  isHighlighted ? "features-label-light" : "features-label-dark"
                }
              >
                Bạn sẽ nhận được
              </Text>
              <ul className="features-list">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <CheckCircleFilled
                      className={isHighlighted ? "check-light" : "check-dark"}
                    />
                    <Text
                      className={
                        isHighlighted
                          ? "feature-text-light"
                          : "feature-text-dark"
                      }
                    >
                      {feature}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type={isHighlighted ? "default" : "primary"}
              block
              style={{
                backgroundColor: isHighlighted ? "white" : "#0D9466",
                color: isHighlighted ? "#0D9466" : "white",
              }}
              className="rent-button"
            >
              Thuê ngay
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // If on mobile, render single card view
  const renderMobileView = () => {
    return (
      <div className="mobile-carousel">
        <div className="mobile-card-container">
          {renderServiceCard(services[currentSlide], 0)}
        </div>

        <div className="mobile-navigation">
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={handlePrev}
            className="carousel-arrow carousel-prev-arrow"
          />

          <div className="carousel-dots">
            {services.map((_, index) => (
              <span
                key={index}
                className={`carousel-dot ${
                  currentSlide === index ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={handleNext}
            className="carousel-arrow carousel-next-arrow"
          />
        </div>
      </div>
    );
  };

  // Get the previous, current, and next services for the carousel
  const prevService = services[getPrevIndex(currentSlide)];
  const currentService = services[currentSlide];
  const nextService = services[getNextIndex(currentSlide)];

  return (
    <>
      <Navbar />
      <div className="pricing-container">
        <div className="pricing-content">
          {/* Header */}
          <div className="pricing-header">
            <Title level={2} className="pricing-title">
              BẢNG TIỀN CÔNG
            </Title>
            {/* <Title level={2} className="pricing-title">
              Bạn sẽ nhận được những gì với số tiền bạn bỏ ra
            </Title>
            */}
            <Paragraph className="pricing-subtitle">
              Chúng tôi cam kết mức thu nhập hấp dẫn và ổn định cho đội ngũ nhân
              viên, đảm bảo quyền lợi tương xứng với công sức bỏ ra
            </Paragraph>
          </div>

          {/* Render different carousel based on screen size */}
          {isMobile ? (
            renderMobileView()
          ) : (
            <>
              {/* Three-Card Carousel for desktop */}
              <div className="three-card-carousel">
                <Button
                  shape="circle"
                  icon={<LeftOutlined />}
                  onClick={handlePrev}
                  className="carousel-arrow carousel-prev-arrow"
                />

                <div className="cards-container">
                  {renderServiceCard(prevService, -1)}
                  {renderServiceCard(currentService, 0)}
                  {renderServiceCard(nextService, 1)}
                </div>

                <Button
                  shape="circle"
                  icon={<RightOutlined />}
                  onClick={handleNext}
                  className="carousel-arrow carousel-next-arrow"
                />
              </div>

              {/* Dots indicator */}
              {/* <div className="carousel-dots">
                {services.map((_, index) => (
                  <span
                    key={index}
                    className={`carousel-dot ${
                      currentSlide === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div> */}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
