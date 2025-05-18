import { useState, useEffect } from "react";
import { Row, Col, Typography, Card, Spin, Alert } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import "../Cleaner/home.css";
import JobCard from "./JobCard";
import iconKhach from "../../../assets/icon-pageClean/icon-clean-phongkhach.svg";
import iconNgu from "../../../assets/icon-pageClean/icon-clean-phongngu.svg";
import iconBep from "../../../assets/icon-pageClean/icon-clean-phongbep.svg";
import iconToilet from "../../../assets/icon-pageClean/icon-clean-donnhavs.svg";
import iconSk from "../../../assets/icon-pageClean/icon-clean-sk.svg";
import iconSua from "../../../assets/icon-pageClean/icon-clean-suachua.svg";
import iconVanPhong from "../../../assets/icon-pageClean/icon-clean-vanphong.svg";
import iconDinhKy from "../../../assets/icon-pageClean/icon-clean-dinhky.svg";
import { BASE_URL } from "../../../utils/config";

const { Title, Paragraph, Text } = Typography;

// Initial static service data
const initialServices = [
  {
    id: 1,
    image: iconKhach,
    title: "Dọn phòng khách",
    description:
      "Lau sàn, hút bụi, lau bàn ghế, vệ sinh cửa kính, sắp xếp gọn gàng",
    count: "0 việc làm",
  },
  {
    id: 2,
    image: iconBep,
    title: "Dọn phòng bếp",
    description:
      "Lau chùi bếp, vệ sinh bồn rửa, dọn dẹp bàn ăn, lau sàn, hút bụi",
    count: "0 việc làm",
  },
  {
    id: 3,
    image: iconNgu,
    title: "Dọn phòng ngủ",
    description:
      "Gấp chăn gối, thay ga giường, lau bụi, hút bụi, lau sàn, sắp xếp đồ đạc",
    count: "0 việc làm",
  },
  {
    id: 4,
    image: iconToilet,
    title: "Dọn nhà vệ sinh",
    description: "Cọ rửa bồn cầu, bồn rửa mặt, gương, lau sàn, khử mùi",
    count: "0 việc làm",
  },
  {
    id: 5,
    image: iconSk,
    title: "Dọn dẹp theo Combo",
    description: "Chọn nhiều dịch vụ dọn dẹp cùng lúc để tiết kiệm thời gian",
    count: "0 việc làm",
  },
  {
    id: 6,
    image: iconSua,
    title: "Dọn dẹp nhà mới xây, sau sửa chữa",
    description: "Dọn dẹp bụi bẩn, lau chùi cửa kính, tường, sàn nhà, hút bụi",
    count: "0 việc làm",
  },
  {
    id: 7,
    image: iconVanPhong,
    title: "Dọn dẹp văn phòng, cửa hàng",
    description:
      "Lau bàn ghế, quét và lau sàn, vệ sinh cửa kính, sắp xếp lại không gian",
    count: "0 việc làm",
  },
  {
    id: 8,
    image: iconDinhKy,
    title: "Dọn dẹp ký túc xá, nhà trọ",
    description: "Vệ sinh nhà cửa, dọn dẹp khu vực sinh hoạt chung",
    count: "0 việc làm",
  },
];

function JobSection({ title }) {
  const [services, setServices] = useState(initialServices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobCounts = async () => {
      if (isLoading) return; // Prevent multiple fetches
      setIsLoading(true);
      try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem("token");
        const cleanerId = sessionStorage.getItem("cleanerId");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${BASE_URL}/cleaner/jobs/by-service/${cleanerId}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job counts");
        }

        const data = await response.json();

        // Update services with job counts from API
        setServices((prevServices) => {
          return prevServices.map((service) => {
            // Initialize job count to 0
            let jobCount = 0;

            // Handle combo service type separately
            if (service.title === "Dọn dẹp theo Combo" && data.combo) {
              jobCount = data.combo.jobCount || 0;
            }
            // Match based on serviceId instead of title
            else {
              // Find the service in the API response based on serviceId
              const serviceData = Object.values(data).find(
                (item) => item.serviceId === service.id
              );

              if (serviceData && serviceData.jobCount !== undefined) {
                jobCount = serviceData.jobCount;
              }
            }

            return {
              ...service,
              count: `${jobCount} việc làm`,
            };
          });
        });
      } catch (err) {
        console.error("Error fetching job counts:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCounts();
  }, []);

  // Render JobCard or a disabled card based on service id
  const renderServiceCard = (service) => {
    if (service.id === 7 || service.id === 8) {
      // Render a disabled card for services with id 7 and 8
      return (
        <Card
          style={{
            height: "100%",
            background: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            opacity: 0.7,
            cursor: "not-allowed", // Thay đổi con trỏ
            pointerEvents: "none", // Vô hiệu hóa các sự kiện chuột
          }}
          cover={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 16px 0 16px",
                height: "120px",
              }}
            >
              <img
                src={service.image}
                alt={service.title}
                style={{
                  width: "60px",
                  height: "60px",
                  maxHeight: "80px",
                  maxWidth: "80px",
                  objectFit: "contain",
                  filter: "grayscale(50%)", // Thêm hiệu ứng grayscale để hiển thị bị vô hiệu hóa
                }}
              />
            </div>
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              flex: 1, // Allow content to take remaining space
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: "18px", // Consistent font size
                lineHeight: "24px", // Fixed line height
                height: "24px", // Single line height
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              {service.title}
            </Title>
            <Paragraph
              style={{
                margin: "8px 0",
                fontSize: "14px", // Consistent font size
                lineHeight: "20px", // Fixed line height for exactly 2 lines
                height: "40px", // Height for exactly 2 lines (2 * 20px)
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                textAlign: "center",
                color: "#595959", // Subtle color for description
              }}
            >
              {service.description}
            </Paragraph>
            <div
              style={{
                marginTop: "auto", // Push to bottom
                textAlign: "center",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px", // Consistent font size
                  lineHeight: "24px",
                  color: "#039855",
                }}
              >
                {service.count}
              </Text>
              {/* <div
                style={{ marginTop: "4px", fontSize: "12px", color: "#ff4d4f" }}
              >
                Sắp ra mắt
              </div> */}
            </div>
          </div>
        </Card>
      );
    } else {
      // Use the normal JobCard component for other services
      return <JobCard {...service} />;
    }
  };

  return (
    <div className="jobsection">
      <Title level={2} style={{ marginBottom: 24 }}>
        {title}
      </Title>

      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
            {renderServiceCard(service)}
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default JobSection;
