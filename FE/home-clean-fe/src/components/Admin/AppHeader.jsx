import React from "react";
import { Layout, Badge, Avatar, Dropdown, Space, Menu } from "antd";
import { BellOutlined, CaretDownOutlined } from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const userMenuItems = [
    { key: "1", label: "Profile" },
    { key: "2", label: "Settings" },
    { key: "3", label: "Logout" },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Left side of header can be extended here */}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Badge count={2} style={{ marginRight: 24 }}>
          <BellOutlined style={{ fontSize: 20 }} />
        </Badge>
        <Dropdown overlay={<Menu items={userMenuItems} />}>
          <Space style={{ marginLeft: 16, cursor: "pointer" }}>
            <Avatar src="https://via.placeholder.com/40" />
            <div>
              <div>Mani Roy</div>
            </div>
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
