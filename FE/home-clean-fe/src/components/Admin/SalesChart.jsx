import React from "react";
import { Card, Button, Dropdown, Spin } from "antd";
import { AreaChartOutlined, CaretDownOutlined } from "@ant-design/icons";

const SalesChart = ({ revenueData, loading }) => {
  const data = [
    { day: "0", value: 20 },
    { day: "5", value: 30 },
    { day: "10", value: 45 },
    { day: "15", value: 35 },
    { day: "20", value: 50 },
    { day: "25", value: 90 },
    { day: "30", value: 40 },
    { day: "35", value: 45 },
    { day: "40", value: 50 },
    { day: "45", value: 55 },
    { day: "50", value: 40 },
    { day: "55", value: 50 },
    { day: "60", value: 55 },
  ];

  const monthMenuItems = [{ key: "1", label: "Tháng 10" }];

  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : "0";
  };

  return (
    <Card
      title="Chi tiết doanh thu"
      extra={
        <Dropdown menu={{ items: monthMenuItems }}>
          <Button>
            Tháng 10 <CaretDownOutlined />
          </Button>
        </Dropdown>
      }
      style={{ marginBottom: 24 }}
    >
      <div style={{ height: 200 }}>
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "0 auto", paddingTop: 60 }}
          />
        ) : revenueData ? (
          <div>
            <div
              style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}
            >
              {formatNumber(revenueData.totalRevenue)}đ
            </div>
            <AreaChartOutlined
              style={{
                fontSize: 80,
                color: "#e6f7ff",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        ) : (
          <AreaChartOutlined
            style={{
              fontSize: 100,
              color: "#e6f7ff",
              display: "block",
              margin: "0 auto",
            }}
          />
        )}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          {revenueData
            ? "Báo cáo tổng doanh thu"
            : "Biểu đồ sẽ được hiển thị bằng Ant Design Charts trong triển khai thực tế"}
        </div>
      </div>
    </Card>
  );
};

export default SalesChart;
