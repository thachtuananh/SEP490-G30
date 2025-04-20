import React from "react";
import { Card, Typography, Spin } from "antd";

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, iconBgColor, iconColor, loading }) => {
  return (
    <Card
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Text
            type="secondary"
            style={{ fontSize: 14, display: "block", marginBottom: 4 }}
          >
            {title}
          </Text>
          <Title level={3} style={{ margin: 0, marginBottom: 16 }}>
            {loading ? <Spin size="small" /> : value}
          </Title>
        </div>
        <div
          style={{
            background: iconBgColor,
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(icon, {
            style: { fontSize: 20, color: iconColor },
          })}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
