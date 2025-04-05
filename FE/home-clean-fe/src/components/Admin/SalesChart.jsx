import React from "react";
import { Card, Button, Dropdown } from "antd";
import { AreaChartOutlined, CaretDownOutlined } from "@ant-design/icons";

const SalesChart = () => {
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

  const monthMenuItems = [{ key: "1", label: "October" }];

  return (
    <Card
      title="Sales Details"
      extra={
        <Dropdown menu={{ items: monthMenuItems }}>
          <Button>
            October <CaretDownOutlined />
          </Button>
        </Dropdown>
      }
      style={{ marginBottom: 24 }}
    >
      <div style={{ height: 200 }}>
        <AreaChartOutlined
          style={{
            fontSize: 100,
            color: "#e6f7ff",
            display: "block",
            margin: "0 auto",
          }}
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          Chart will be rendered using Ant Design Charts in a real
          implementation
        </div>
      </div>
    </Card>
  );
};

export default SalesChart;
