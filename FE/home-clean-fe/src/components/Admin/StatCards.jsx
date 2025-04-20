import React from "react";
import { Row, Col } from "antd";
import StatCard from "./StatCard";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const StatCards = ({ loading, revenueData, jobData }) => {
  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : "0";
  };

  // Calculate total jobs
  const getTotalJobs = () => {
    if (!jobData) return 0;
    return (
      jobData.IN_PROGRESS + jobData.CANCELLED + jobData.DONE + jobData.OPEN
    );
  };

  const cardData = [
    {
      title: "Tổng số công việc",
      value: jobData ? formatNumber(getTotalJobs()) : "0",
      icon: <UserOutlined />,
      iconBgColor: "#f0f5ff",
      iconColor: "#1890ff",
    },
    {
      title: "Công việc hoàn thành",
      value: jobData ? formatNumber(jobData.DONE) : "0",
      icon: <ShoppingCartOutlined />,
      iconBgColor: "#fffbe6",
      iconColor: "#faad14",
    },
    {
      title: "Tổng doanh thu",
      value: revenueData ? `${formatNumber(revenueData.totalRevenue)}đ` : "0đ",
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
            loading={loading}
          />
        </Col>
      ))}
    </Row>
  );
};

export default StatCards;
