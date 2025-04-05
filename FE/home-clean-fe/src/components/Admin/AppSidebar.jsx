import React from "react";
import { Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  StopOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/HouseClean_logo.png";

const { Sider } = Layout;
const { Title } = Typography;

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
      key: "users",
      label: "Người dùng",
      icon: <TeamOutlined />,
      children: [
        {
          key: "/admin/owners",
          icon: <UserOutlined />,
          label: <Link to="/admin/owners">Chủ nhà</Link>,
        },
        {
          key: "/admin/cleaners",
          icon: <UserOutlined />,
          label: <Link to="/admin/cleaners">Người dọn dẹp</Link>,
        },
        {
          key: "/admin/cleaners-ban",
          icon: <StopOutlined />,
          label: <Link to="/admin/cleaners-ban">Chưa xác minh</Link>,
        },
      ],
    },
    // {
    //   key: "logout",
    //   icon: <LogoutOutlined />,
    //   label: "Đăng xuất",
    //   className: "logout-menu-item",
    // },
  ];

  return (
    <Sider
      width={220}
      theme="light"
      style={{
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        height: "100vh",
        position: "fixed",
        left: 0,
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: 80,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Link
          to="/admin"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="House Clean Logo"
            style={{ height: "32px", marginBottom: "4px" }}
          />
          <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
            House Clean
          </Title>
        </Link>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        defaultOpenKeys={["users"]}
        style={{ borderRight: 0, paddingTop: "12px" }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;
