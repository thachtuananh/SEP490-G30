import { useState } from "react"; // Thêm useState
import { useNavigate } from "react-router-dom";
import { Card, Typography, message } from "antd";
import { BASE_URL } from "../../../utils/config";

const { Title, Paragraph, Text } = Typography;

function JobCard({ image, title, description, count, id }) {
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(false); // Trạng thái để vô hiệu hóa click

  const handleCardClick = async () => {
    if (isDisabled) return; // Ngăn click nếu đang bị vô hiệu hóa

    setIsDisabled(true); // Vô hiệu hóa click
    try {
      const token = sessionStorage.getItem("token");
      const cleanerId = sessionStorage.getItem("cleanerId");
      if (!token) {
        message.warning("Bạn cần đăng nhập để xem chi tiết công việc.");
        setIsDisabled(false); // Bật lại click nếu không có token
        return;
      }

      let url = `${BASE_URL}/cleaner/jobs/details/by-service/${id}/cleaner/${cleanerId}`;
      let isCombo = false;

      if (title === "Dọn dẹp theo Combo") {
        url = `${BASE_URL}/cleaner/jobs/combo/${id}`;
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

      const data = await response.json();

      if (!response.ok) {
        if (data && data.message) {
          throw new Error(data.message);
        } else {
          throw new Error("Không thể lấy thông tin công việc");
        }
      }

      if (data.message) {
        message.success(data.message);
      }

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
        error.message ||
          "Đã xảy ra lỗi khi lấy thông tin công việc. Vui lòng thử lại sau."
      );
    } finally {
      // Bật lại click sau 2 giây
      setTimeout(() => {
        setIsDisabled(false);
      }, 2000);
    }
  };

  return (
    <Card
      hoverable={!isDisabled} // Tắt hover khi vô hiệu hóa
      style={{
        height: "100%",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        opacity: isDisabled ? 0.6 : 1, // Làm mờ thẻ khi vô hiệu hóa
        cursor: isDisabled ? "not-allowed" : "pointer", // Đổi con trỏ chuột
      }}
      onClick={handleCardClick}
      cover={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 16px 0 16px",
            height: "120px",
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
          flex: 1,
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            fontSize: "18px",
            lineHeight: "24px",
            height: "24px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {title}
        </Title>
        <Paragraph
          style={{
            margin: "8px 0",
            fontSize: "14px",
            lineHeight: "20px",
            height: "40px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textAlign: "center",
            color: "#595959",
          }}
        >
          {description}
        </Paragraph>
        <div
          style={{
            marginTop: "auto",
            textAlign: "center",
          }}
        >
          <Text
            strong
            style={{
              fontSize: "16px",
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
