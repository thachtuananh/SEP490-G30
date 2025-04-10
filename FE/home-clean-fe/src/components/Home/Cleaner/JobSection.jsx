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

const { Title } = Typography;

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
  // {
  //   id: 7,
  //   image: iconVanPhong,
  //   title: "Dọn dẹp văn phòng, cửa hàng",
  //   description: "Lau bàn ghế, quét và lau sàn, vệ sinh cửa kính, sắp xếp lại không gian",
  //   count: "0 việc làm",
  // },
  // {
  //   id: 8,
  //   image: iconDinhKy,
  //   title: "Dọn dẹp nhà theo định kỳ",
  //   description: "Vệ sinh nhà cửa định kỳ theo tuần/tháng, duy trì không gian sạch sẽ",
  //   count: "0 việc làm",
  // },
];

function JobSection({ title }) {
  const [services, setServices] = useState(initialServices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobCounts = async () => {
      setIsLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/cleaner/jobs/by-service`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

  return (
    <div className="jobsection">
      {/* Search bar section - commented out as in original
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input 
              placeholder="Tìm tên công việc mong muốn" 
              size="large"
            />
          </Col>
          <Col>
            <Button 
              icon={<EnvironmentOutlined />} 
              size="large"
            >
              Địa điểm
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              size="large"
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </div>
      */}

      <Title level={2} style={{ marginBottom: 24 }}>
        {title}
      </Title>

      {/* {isLoading && (
        <Spin
          tip="Đang tải..."
          size="large"
          style={{ display: "block", margin: "20px auto" }}
        />
      )} */}

      {/* {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )} */}

      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
            <JobCard {...service} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default JobSection;
