import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Button } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  StopOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/HouseClean_logo.png";

const { Sider } = Layout;
const { Title } = Typography;

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 992);
  const isMobile = windowWidth < 768;

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < 768) {
        setCollapsed(true);
      } else if (width >= 768 && width < 992) {
        setCollapsed(false);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
  ];

  // Determine sidebar width based on screen size
  const getSiderWidth = () => {
    if (collapsed) {
      if (windowWidth < 992) return 60; // mobile + tablet đều collapse còn 60
      return 100; // desktop collapsed
    } else {
      if (windowWidth < 1200) return 180; // tablet & small desktop
      return 220; // large desktop
    }
  };

  return (
    // In AppSidebar.jsx, modify the Sider component props:
    <Sider
      width={getSiderWidth()}
      theme="light"
      collapsed={collapsed}
      collapsedWidth={getSiderWidth()} // Luôn hiển thị, nhưng nhỏ hơn trên mobile
      style={{
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        height: "100vh",
        position: "fixed",
        left: 0,
        overflow: "auto",
        zIndex: 999,
      }}
      trigger={null}
    >
      <div
        style={{
          height: 80,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "center",
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
            style={{
              height: collapsed ? "40px" : "60px",
              width: "auto",
              marginBottom: "4px",
            }}
          />
        </Link>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        defaultOpenKeys={collapsed ? [] : ["users"]}
        style={{ borderRight: 0, paddingTop: "12px" }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;
