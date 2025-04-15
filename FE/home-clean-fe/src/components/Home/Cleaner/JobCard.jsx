import { useNavigate } from "react-router-dom";
import { Card, Typography, message } from "antd";
import { BASE_URL } from "../../../utils/config";

const { Title, Paragraph, Text } = Typography;

function JobCard({ image, title, description, count, id }) {
  const navigate = useNavigate();

  const handleCardClick = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.warning("Bạn cần đăng nhập để xem chi tiết công việc.");
        return;
      }

      let url = `${BASE_URL}/cleaner/jobs/details/by-service/${id}`;
      let isCombo = false;

      if (title === "Dọn dẹp theo Combo") {
        url = `${BASE_URL}/cleaner/jobs/combo`;
        isCombo = true;
      }

      message.loading({
        content: "Đang tải thông tin công việc...",
        key: "jobLoading",
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin công việc");
      }

      const data = await response.json();
      message.destroy("jobLoading");

      if (isCombo) {
        const processedData = data.map((job) => {
          if (job.services && job.services.length > 0) {
            const serviceNames = job.services
              .map((service) => service.serviceName)
              .join(", ");
            return {
              ...job,
              serviceName: serviceNames || "Combo dịch vụ",
            };
          }
          return {
            ...job,
            serviceName: job.serviceName || "Combo dịch vụ",
          };
        });

        navigate("/homeclean/job-list", {
          state: { jobs: processedData, serviceTitle: title },
        });
      } else {
        navigate("/homeclean/job-list", {
          state: { jobs: data, serviceTitle: title },
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin công việc:", error);
      message.error(
        "Đã xảy ra lỗi khi lấy thông tin công việc. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <Card
      hoverable
      style={{
        height: "100%", // Ensure card takes full height of parent
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={handleCardClick}
      cover={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 16px 0 16px",
            height: "120px", // Fixed height for image section
            overflow: "hidden",
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              width: "60px",
              height: "60px",
              maxHeight: "80px",
              maxWidth: "80px",
              objectFit: "contain",
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
        {/* Title Section */}
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
          {title}
        </Title>

        {/* Description Section */}
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
          {description}
        </Paragraph>

        {/* Count Section */}
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
            {count}
          </Text>
        </div>
      </div>
    </Card>
  );
}

export default JobCard;
