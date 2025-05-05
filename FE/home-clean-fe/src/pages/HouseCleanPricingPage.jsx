import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Layout,
  Carousel,
  ConfigProvider,
  Divider,
} from "antd";
import {
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

export default function HouseCleanPricingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });
  const carouselRef = React.useRef();

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 576,
        isTablet: width > 576 && width <= 992,
        isDesktop: width > 992,
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Service data
  const services = [
    {
      id: 1,
      title: "Dọn nhà vệ sinh",
      priceRange: "80-140k",
      unit: "/lần",
      features: ["Hoàn thành trong 30-45 phút", "Không cần kinh nghiệm"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 2,
      title: "Dọn phòng khách",
      priceRange: "150-200k",
      unit: "/lần",
      features: ["Hoàn thành trong 1-2 giờ", "Kinh nghiệm 1 tháng trở lên"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 3,
      title: "Dọn phòng ngủ",
      priceRange: "120-170k",
      unit: "/lần",
      features: ["Hoàn thành trong 45-90 phút", "Kinh nghiệm cơ bản"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 4,
      title: "Dọn dẹp nhà mới xây, sau sửa chữa",
      priceRange: "150-250k",
      unit: "/lần",
      features: ["Công việc yêu cầu kỹ năng", "Thời gian linh hoạt"],
      serviceLabel: "Thu nhập người dọn",
    },
    {
      id: 5,
      title: "Dọn phòng bếp",
      priceRange: "130-180k",
      unit: "/lần",
      features: ["Công việc yêu cầu kỹ năng", "Thời gian linh hoạt"],
      serviceLabel: "Thu nhập người dọn",
    },
  ];

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNext = () => {
    carouselRef.current.next();
  };

  // Update currentSlide to reflect the center slide
  const afterChange = (currentIndex) => {
    setCurrentSlide(currentIndex);
  };

  // Calculate slidesToShow based on screen size
  const getSlidesToShow = () => {
    if (screenSize.isMobile) return 1;
    if (screenSize.isTablet) return 2;
    return 3;
  };

  // Render service card
  const renderServiceCard = (service) => {
    const { isMobile, isTablet } = screenSize;

    return (
      <Card
        hoverable
        className="service-card"
        style={{
          minHeight: isMobile ? "350px" : isTablet ? "380px" : "400px",
          margin: isMobile ? "0 auto" : isTablet ? "10px auto" : "20px 10px",
          maxWidth: isMobile ? "280px" : isTablet ? "320px" : "360px",
          width: "100%",
          borderRadius: "16px",
          transition: "all 0.3s ease",
          border: "none",
        }}
        bodyStyle={{
          padding: isMobile ? "24px 16px" : isTablet ? "28px 20px" : "32px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Space
          direction="vertical"
          size={isMobile ? "small" : "middle"}
          style={{ width: "100%", flex: 1 }}
        >
          <Text
            className="service-label"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 500,
            }}
          >
            {service.serviceLabel}
          </Text>

          <Title
            level={isMobile ? 5 : 4}
            className="service-title"
            style={{
              margin: "0",
              fontWeight: 600,
              fontSize: isMobile ? "16px" : isTablet ? "18px" : "20px",
            }}
          >
            {service.title}
          </Title>

          <Space align="baseline">
            <Title
              level={isMobile ? 3 : 2}
              className="service-price"
              style={{
                margin: "8px 0",
                fontWeight: 700,
                fontSize: isMobile ? "20px" : isTablet ? "24px" : "28px",
              }}
            >
              {service.priceRange}
            </Title>
            <Text
              className="service-unit"
              style={{
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              {service.unit}
            </Text>
          </Space>

          <Divider
            className="service-divider"
            style={{
              margin: isMobile ? "12px 0" : "16px 0",
            }}
          />

          <Space
            direction="vertical"
            size={isMobile ? "small" : "small"}
            style={{ width: "100%", flex: 1 }}
          >
            {service.features.map((feature, idx) => (
              <Space key={idx} align="start">
                <CheckCircleFilled
                  className="service-icon-carousel"
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    marginTop: "3px",
                  }}
                />
                <Text
                  className="service-feature"
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  {feature}
                </Text>
              </Space>
            ))}
          </Space>
        </Space>
      </Card>
    );
  };

  // Carousel for both mobile and desktop
  const renderCarousel = () => {
    const { isMobile, isTablet } = screenSize;

    return (
      <div
        style={{
          padding: isMobile ? "0 8px" : isTablet ? "0 24px" : "0 40px",
          position: "relative",
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handlePrev}
          size={isMobile ? "middle" : "large"}
          style={{
            position: "absolute",
            left: isMobile ? 0 : isTablet ? 4 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "#0D9466",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            width: isMobile ? "32px" : "40px",
            height: isMobile ? "32px" : "40px",
          }}
        />

        <Carousel
          ref={carouselRef}
          afterChange={afterChange}
          dots={{ className: "custom-carousel-dots" }}
          slidesToShow={getSlidesToShow()}
          slidesToScroll={1}
          centerMode={true}
          centerPadding={isMobile ? "0" : isTablet ? "20px" : "40px"}
          effect="scrollx"
          autoplay
          autoplaySpeed={5000}
          initialSlide={0}
          className="service-carousel"
          responsive={[
            {
              breakpoint: 576,
              settings: {
                slidesToShow: 1,
                centerPadding: "0",
              },
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 2,
                centerPadding: "20px",
              },
            },
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 3,
                centerPadding: "40px",
              },
            },
          ]}
        >
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                padding: isMobile ? "0" : isTablet ? "0 5px" : "0 10px",
              }}
            >
              {renderServiceCard(service)}
            </div>
          ))}
        </Carousel>

        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleNext}
          size={isMobile ? "middle" : "large"}
          style={{
            position: "absolute",
            right: isMobile ? 0 : isTablet ? 4 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "#0D9466",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            width: isMobile ? "32px" : "40px",
            height: isMobile ? "32px" : "40px",
          }}
        />
      </div>
    );
  };

  return (
    <ConfigProvider>
      <Layout>
        <Navbar />
        <Content>
          <div
            style={{
              padding: screenSize.isMobile
                ? "24px 12px"
                : screenSize.isTablet
                ? "40px 24px"
                : "64px 32px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <Row
              justify="center"
              style={{ marginBottom: screenSize.isMobile ? 32 : 48 }}
            >
              <Col
                xs={24}
                sm={22}
                md={20}
                lg={16}
                style={{ textAlign: "center" }}
              >
                <Title
                  level={screenSize.isMobile ? 2 : 1}
                  style={{
                    fontSize: screenSize.isMobile
                      ? 24
                      : screenSize.isTablet
                      ? 30
                      : 36,
                    fontWeight: 700,
                    color: "#262626",
                    marginBottom: screenSize.isMobile ? 12 : 16,
                  }}
                >
                  BẢNG GIÁ DỊCH VỤ
                </Title>
                <Paragraph
                  style={{
                    fontSize: screenSize.isMobile
                      ? 14
                      : screenSize.isTablet
                      ? 16
                      : 18,
                    color: "#595959",
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  Bảng giá hiển thị dưới đây là mức giá mà Chủ Nhà sẽ thanh toán
                  cho mỗi công việc dọn dẹp. Sau khi hoàn thành công việc và
                  được xác nhận, Cleaner sẽ nhận được 85% tổng giá trị dịch vụ,
                  phần còn lại 15% sẽ được khấu trừ làm phí trung gian cho nền
                  tảng HouseClean. Phí này bao gồm chi phí vận hành hệ thống,
                  duy trì ứng dụng và hỗ trợ khách hàng.
                </Paragraph>
              </Col>
            </Row>

            {renderCarousel()}
          </div>
        </Content>
        <Footer />
      </Layout>

      <style jsx global>{`
        /* Hide dots */
        .custom-carousel-dots,
        .custom-carousel-dots li {
          display: none !important;
        }

        /* Basic slide styling */
        .ant-carousel .slick-slide {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Default card styles */
        .service-card {
          background-color: white;
          transform: scale(0.95);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .service-card:hover {
          transform: translateY(-4px) scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }

        .service-label {
          color: #8c8c8c;
        }

        .service-title {
          color: #262626;
        }

        .service-price {
          color: #0d9466;
        }

        .service-unit {
          color: #595959;
        }

        .service-divider {
          border-color: #e8e8e8;
        }

        .service-icon-carousel {
          color: #0d9466;
        }

        .service-feature {
          color: #595959;
        }

        /* Center slide styling - this is key for fixing the highlight issue */
        .slick-current .service-card {
          background-color: #0d9466 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(13, 148, 102, 0.3) !important;
        }

        .slick-current .service-label,
        .slick-current .service-title,
        .slick-current .service-price,
        .slick-current .service-unit,
        .slick-current .service-feature {
          color: #ffffff !important;
        }

        .slick-current .service-icon-carousel {
          color: #b3e6d1 !important;
        }

        .slick-current .service-divider {
          border-color: #4db38e !important;
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .slick-current .service-card {
            height: auto !important;
            padding: 24px 16px !important;
          }

          /* Ensure navigation buttons don't overlap content on very small screens */
          .ant-carousel {
            margin: 0 10px;
          }
        }

        @media (min-width: 577px) and (max-width: 992px) {
          .slick-current .service-card {
            height: auto !important;
            padding: 28px 20px !important;
          }
        }

        @media (min-width: 993px) {
          .slick-current .service-card {
            height: 460px !important;
            padding: 40px 32px !important;
          }
        }
      `}</style>
    </ConfigProvider>
  );
}
