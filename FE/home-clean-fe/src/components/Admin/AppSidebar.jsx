import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import logo from "../../assets/HouseClean_logo.png";

const { Sider } = Layout;

const AppSidebar = () => {
  return (
    <Sider
      width={200}
      theme="light"
      style={{ boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
    >
      <div
        style={{
          height: 64,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={logo} alt="House Clean Logo" className="logo-img" />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        style={{ height: "100%", borderRight: 0 }}
      >
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="owner" icon={<TeamOutlined />}>
          Danh sách Owner
        </Menu.Item>
        <Menu.Item key="cleaner" icon={<TeamOutlined />}>
          Danh sách Cleaner
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />}>
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSidebar;
