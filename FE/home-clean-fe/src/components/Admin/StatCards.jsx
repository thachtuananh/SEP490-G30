import React from "react";
import { Row, Col } from "antd";
import StatCard from "./StatCard";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const StatCards = () => {
  const cardData = [
    {
      title: "Total Users",
      value: "40,689",
      icon: <UserOutlined />,
      iconBgColor: "#f0f5ff",
      iconColor: "#1890ff",
    },
    {
      title: "Total Orders",
      value: "10,293",
      icon: <ShoppingCartOutlined />,
      iconBgColor: "#fffbe6",
      iconColor: "#faad14",
    },
    {
      title: "Total Sales",
      value: "89,000đ",
      icon: <DollarOutlined />,
      iconBgColor: "#f6ffed",
      iconColor: "#52c41a",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cardData.map((card, index) => (
        <Col xs={24} sm={12} md={12} lg={8} key={index}>
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        </Col>
      ))}
    </Row>
  );
};

export default StatCards;
