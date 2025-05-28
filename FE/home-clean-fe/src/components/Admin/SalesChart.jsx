import React, { useState, useEffect } from "react";
import { Card, Button, Dropdown, Spin, Typography, Empty, Flex } from "antd";
import { AreaChartOutlined, CaretDownOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BASE_URL } from "../../utils/config";

const SalesChart = ({ revenueData, loading: parentLoading }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [selectedView, setSelectedView] = useState("monthly"); // "overview" or "monthly"

  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : "0";
  };

  useEffect(() => {
    if (selectedView === "monthly") {
      fetchRevenueByYearAndMonth();
    }
  }, [selectedView]);

  const fetchRevenueByYearAndMonth = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `${BASE_URL}/statistics/revenue-by-year-and-month`,
        { headers }
      );
      const result = await response.json();

      if (result) {
        // Transform data for chart visualization
        const transformedData = transformRevenueData(result);
        setChartData(transformedData);
      } else {
        console.error("Không thể tải dữ liệu doanh thu theo tháng");
      }
    } catch (error) {
      console.error("Error fetching revenue by year and month:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform the API response data into chart-friendly format
  const transformRevenueData = (data) => {
    const transformedData = [];
    // Sample data: { "2025": { "Tháng 3": 33000.0, "Tháng 4": 16500.0 }, "2024": { "Tháng 4": 16500.0 } }

    if (!data) return [];

    // Sort years in ascending order
    const years = Object.keys(data).sort();

    const allMonths = new Set();
    years.forEach((year) => {
      Object.keys(data[year]).forEach((month) => {
        allMonths.add(month);
      });
    });

    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const monthA = parseInt(a.replace("Tháng ", ""));
      const monthB = parseInt(b.replace("Tháng ", ""));
      return monthA - monthB;
    });

    // Create data points for chart
    sortedMonths.forEach((month) => {
      const dataPoint = { name: month };

      years.forEach((year) => {
        const value = data[year]?.[month] || 0;
        dataPoint[`${year}`] = value;
      });

      transformedData.push(dataPoint);
    });

    return transformedData;
  };

  const viewOptions = [
    {
      key: "overview",
      label: "Tổng quan",
      onClick: () => setSelectedView("overview"),
    },
    {
      key: "monthly",
      label: "Theo tháng",
      onClick: () => setSelectedView("monthly"),
    },
  ];

  // Chart colors
  const chartColors = ["#1890ff", "#13c2c2", "#52c41a", "#faad14"];

  const renderContent = () => {
    if (parentLoading || loading) {
      return (
        <div
          style={{
            height: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      );
    }

    if (selectedView === "overview") {
      return (
        <div style={{ height: 300, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 36,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {revenueData ? formatNumber(revenueData.totalRevenue) : "0"}đ
            <AreaChartOutlined
              style={{
                fontSize: 80,
                color: "#e6f7ff",
                display: "block",
                margin: "0 auto",
              }}
            />
            <div style={{ textAlign: "center", fontSize: 16 }}>
              {revenueData
                ? "Báo cáo tổng doanh thu"
                : "Biểu đồ báo cáo tổng doanh thu"}
            </div>
          </div>
        </div>
      );
    }

    if (selectedView === "monthly" && chartData && chartData.length > 0) {
      return (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value.toLocaleString()}đ`} />
              <Tooltip
                formatter={(value) => [`${value.toLocaleString()} VNĐ`, ``]}
              />
              <Legend />
              {Object.keys(chartData[0] || {})
                .filter((key) => key !== "name")
                .map((year, index) => (
                  <Bar
                    key={year}
                    dataKey={year}
                    name={`Năm ${year}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div
        style={{
          height: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Empty description="Không có dữ liệu doanh thu theo tháng" />
      </div>
    );
  };

  return (
    <Card
      title="Chi tiết doanh thu"
      extra={
        <Dropdown menu={{ items: viewOptions }}>
          <Button>
            {selectedView === "overview" ? "Tổng quan" : "Theo tháng"}
            <CaretDownOutlined />
          </Button>
        </Dropdown>
      }
      style={{ marginBottom: 24 }}
    >
      {renderContent()}
    </Card>
  );
};

export default SalesChart;
