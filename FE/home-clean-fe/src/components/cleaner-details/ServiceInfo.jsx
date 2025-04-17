import { Card, Typography, Row, Col, Space, Button } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { StarRating } from "./StarRating";

const { Title, Text } = Typography;

export const ServiceInfo = ({
  cleanerName,
  averageRating,
  email,
  experience,
  age,
  isVerified,
  identityNumber,
}) => {
  return (
    <Card
      style={{
        marginBottom: "20px",
        border: "none",
      }}
      styles={{ body: { padding: "unset" } }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Space align="center" size="small" wrap>
            <Title
              level={3}
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {cleanerName || "Tên cleaner"}
            </Title>
            {isVerified ? (
              <CheckCircleFilled
                style={{ color: "#52c41a", fontSize: 20 }}
                title="Đã xác thực"
              />
            ) : (
              <CloseCircleFilled
                style={{ color: "#ff4d4f", fontSize: 20 }}
                title="Chưa xác thực"
              />
            )}
          </Space>

          {averageRating && <StarRating rating={averageRating} />}
        </div>

        <Row
          gutter={[16, 8]}
          style={{
            paddingTop: 16,
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  width: "120px",
                  flexShrink: 0,
                }}
              >
                Email:
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  wordBreak: "break-all",
                }}
              >
                {email || "nghiau2k3@gmail.com"}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  width: "120px",
                  flexShrink: 0,
                }}
              >
                Kinh nghiệm:
              </Text>
              <Text style={{ fontSize: 15, color: "#1a1a1a" }}>
                {experience || "5 năm làm dịch vụ dọn nhà tại nhasach.vn"}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  width: "120px",
                  flexShrink: 0,
                }}
              >
                Tuổi:
              </Text>
              <Text style={{ fontSize: 15, color: "#1a1a1a" }}>
                {age || "22"}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  width: "120px",
                  flexShrink: 0,
                }}
              >
                CCCD:
              </Text>
              <Text style={{ fontSize: 15, color: "#1a1a1a" }}>
                {identityNumber || "1203041192"}
              </Text>
            </div>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};
