import { Link } from "react-router-dom";
import {
  Card,
  Avatar,
  Rate,
  Tag,
  Button,
  Typography,
  Tooltip,
  Statistic,
  Space,
} from "antd";
import {
  UserOutlined,
  StarOutlined,
  CommentOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

function CleanerCard({
  cleanerId,
  cleanerImg,
  cleanerName,
  rating,
  reviews,
  isOnline,
}) {
  return (
    <Card
      hoverable
      style={{ height: "100%", position: "relative", cursor: "default" }}
      actions={
        [
          // <Tooltip title="Đánh giá">
          //   <Space direction="vertical" size={0} style={{ lineHeight: 1 }}>
          //     <StarOutlined style={{ color: "#faad14" }} />
          //     <Text style={{ fontSize: "12px" }}>{rating}</Text>
          //   </Space>
          // </Tooltip>,
          // <Tooltip title="Đánh giá">
          //   <Space direction="vertical" size={0} style={{ lineHeight: 1 }}>
          //     <CommentOutlined />
          //     <Text style={{ fontSize: "12px" }}>{reviews}</Text>
          //   </Space>
          // </Tooltip>,
          // <Link to={`/cleaner/${cleanerId}`} state={{ cleanerId }}>
          //   <Tooltip title="Thuê ngay">
          //     <ShoppingCartOutlined style={{ color: "#1890ff" }} />
          //   </Tooltip>
          // </Link>,
        ]
      }
    >
      <Tag
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1,
          border: "none",
          borderRadius: "12px",
          backgroundColor: isOnline
            ? "rgba(82, 196, 26, 0.1)"
            : "rgba(245, 34, 45, 0.1)",
          color: isOnline ? "#52c41a" : "#f5222d", // Đặt màu chữ ở đây
        }}
      >
        {isOnline ? "Online" : "Offline"}
      </Tag>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        {cleanerImg ? (
          <Avatar
            src={
              cleanerImg.startsWith("data:")
                ? cleanerImg
                : `data:image/jpeg;base64,${cleanerImg}`
            }
            size={80}
            style={{ border: `3px solid ${isOnline ? "#52c41a" : "#d9d9d9"}` }}
          />
        ) : (
          <Avatar
            icon={<UserOutlined />}
            size={80}
            style={{ border: `3px solid ${isOnline ? "#52c41a" : "#d9d9d9"}` }}
          />
        )}
      </div>

      <Meta
        title={
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              display: "block",
            }}
          >
            {cleanerName}
          </Text>
        }
        description={
          <div style={{ textAlign: "center" }}>
            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: "8px" }}>
              {`Dịch vụ của ${cleanerName}`}
            </Paragraph>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              {/* <Rate
                disabled
                defaultValue={rating}
                allowHalf
                style={{ fontSize: "14px" }}
              /> */}
            </div>
            {/* <div style={{ marginBottom: "16px" }}>
              <Avatar.Group maxCount={3} size="small">
                {[1, 2, 3].map((i) => (
                  <Tooltip key={i} title="Khách hàng">
                    <Avatar src={`https://i.pravatar.cc/30?img=${i}`} />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div> */}
            <Link to={`/cleaner/${cleanerId}`} state={{ cleanerId }}>
              <Button type="primary" ghost block>
                Thuê ngay
              </Button>
            </Link>
          </div>
        }
      />
    </Card>
  );
}

export default CleanerCard;
