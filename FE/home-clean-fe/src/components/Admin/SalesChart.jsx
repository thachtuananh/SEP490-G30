import React, { useState, useEffect } from "react";
import { Card, Button, Dropdown, Spin, Typography, Empty } from "antd";
import { AreaChartOutlined, CaretDownOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BASE_URL } from "../../utils/config";

const { Text } = Typography;

const SalesChart = ({ revenueData, loading: parentLoading }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [selectedView, setSelectedView] = useState("monthly");

  // Format number with commas and VNĐ suffix
  const formatNumber = (num) => {
    return num ? `${num.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ";
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
        const transformedData = transformRevenueData(result);
        setChartData(transformedData);
      } else {
        console.error("Không thể tải dữ liệu lợi nhuận theo tháng");
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
    if (!data) return [];

    const years = Object.keys(data).sort();
    const allMonths = new Set();
    years.forEach((year) => {
      Object.keys(data[year]).forEach((month) => {
        allMonths.add(month);
      });
    });

    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const monthA = parseInt(a.replace("Tháng ", ""));
      const monthB = parseInt(b.replace("Tháng ", ""));
      return monthA - monthB;
    });

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

  // Chart colors (vibrant, semi-transparent for stacking)
  const chartColors = [
    "rgba(24, 144, 255, 0.6)", // Blue
    "rgba(19, 194, 194, 0.6)", // Cyan
    "rgba(82, 196, 26, 0.6)", // Green
    "rgba(250, 140, 22, 0.6)", // Orange
  ];
  const strokeColors = ["#1890ff", "#13c2c2", "#52c41a", "#fa8c16"]; // Solid colors for lines

  // Custom Tooltip for better readability
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Text strong style={{ fontSize: 14 }}>
            {label}
          </Text>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{
                color: strokeColors[index % strokeColors.length],
                marginTop: 6,
              }}
            >
              <Text>
                {entry.name}: {formatNumber(entry.value)}
              </Text>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid #e8e8e8",
              paddingTop: 6,
            }}
          >
            <Text strong>
              Tổng:{" "}
              {formatNumber(
                payload.reduce((sum, entry) => sum + entry.value, 0)
              )}
            </Text>
          </div>
        </div>
      );
    }
    return null;
  };

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
        <div
          style={{
            height: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "12px",
            // background: "linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)",
            // borderRadius: 8,
            // boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Text strong style={{ fontSize: 36 }}>
            {revenueData ? formatNumber(revenueData.totalRevenue) : "0 VNĐ"}
          </Text>
          <AreaChartOutlined
            style={{
              fontSize: 80,
              color: "#1890ff",
              opacity: 0.3,
            }}
          />
          <Text style={{ fontSize: 16 }}>
            {revenueData ? "Tổng lợi nhuận" : "Báo cáo tổng lợi nhuận"}
          </Text>
        </div>
      );
    }

    if (selectedView === "monthly" && chartData && chartData.length > 0) {
      return (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#595959" }}
                axisLine={{ stroke: "#d9d9d9" }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 12, fill: "#595959" }}
                axisLine={{ stroke: "#d9d9d9" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: 12,
                  fontSize: 12,
                  color: "#595959",
                }}
              />
              {Object.keys(chartData[0] || {})
                .filter((key) => key !== "name")
                .map((year, index) => (
                  <Area
                    key={year}
                    type="monotone"
                    dataKey={year}
                    name={`Năm ${year}`}
                    stackId="1" // Enable stacking
                    fill={chartColors[index % chartColors.length]}
                    stroke={strokeColors[index % strokeColors.length]}
                    strokeWidth={2}
                    fillOpacity={0.6}
                    animationDuration={1200}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </AreaChart>
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
        <Empty description="Không có dữ liệu lợi nhuận theo tháng" />
      </div>
    );
  };

  return (
    <Card
      title={
        <Text strong style={{ fontSize: 18 }}>
          Chi tiết lợi nhuận
        </Text>
      }
      extra={
        <Dropdown menu={{ items: viewOptions }}>
          <Button
            style={{
              borderRadius: 6,
              // background: "#f5f5f5",
              // borderColor: "#d9d9d9",
              fontWeight: 500,
            }}
          >
            {selectedView === "overview" ? "Tổng quan" : "Theo tháng"}
            <CaretDownOutlined />
          </Button>
        </Dropdown>
      }
      style={{
        marginBottom: 24,
        borderRadius: 10,
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
        background: "#fff",
      }}
      bodyStyle={{ padding: 24 }}
    >
      {renderContent()}
    </Card>
  );
};

export default SalesChart;
