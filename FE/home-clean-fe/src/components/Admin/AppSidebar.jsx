import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/HouseClean_logo.png";

const { Sider } = Layout;

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define menu items using the recommended items prop structure
  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/owners",
      icon: <TeamOutlined />,
      label: <Link to="/admin/owners">Danh sách Owner</Link>,
    },
    {
      key: "/admin/cleaners",
      icon: <TeamOutlined />,
      label: <Link to="/admin/cleaners">Danh sách Cleaner</Link>,
    },
    {
      key: "/admin/cleaners-ban",
      icon: <TeamOutlined />,
      label: <Link to="/admin/cleaners-ban">Danh sách Cleaner Ban</Link>,
    },
    // {
    //   key: "logout",
    //   icon: <LogoutOutlined />,
    //   label: <Link to="/admin-login">Logout</Link>,
    // },
  ];

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
        <Link to="/admin">
          <img src={logo} alt="House Clean Logo" className="logo-img" />
        </Link>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;
