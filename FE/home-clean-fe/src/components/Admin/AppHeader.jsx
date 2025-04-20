import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layout, Badge, Avatar, Dropdown, Space, message, Button } from "antd";
import {
  BellOutlined,
  CaretDownOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = ({ collapsed, onToggle }) => {
  const { admin, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;

  // Check for token in sessionStorage on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token); // Convert to boolean
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    message.success("Đăng xuất thành công!");
    setIsLoggedIn(false);
    navigate("/admin-login");
  };

  const handleLogin = () => {
    navigate("/admin-login");
  };

  // Menu items for the dropdown - changes based on login status
  const menuItems = isLoggedIn
    ? [
        {
          key: "1",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "2",
          label: "Đăng nhập",
          icon: <LoginOutlined />,
          onClick: handleLogin,
        },
      ];

  const getAdminName = () => {
    if (admin && admin.adminName) {
      return admin.adminName;
    }
    // Fallback to sessionStorage for compatibility
    const storedName = sessionStorage.getItem("name");
    return storedName && isLoggedIn ? storedName : "";
  };

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexFlow: "row-reverse",
      }}
    >
      {/* <div style={{ display: "flex", alignItems: "center" }}>
        {onToggle && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{ marginRight: 16, display: isMobile ? "none" : "block" }}
          />
        )}
      </div> */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* {isLoggedIn && (
          <Badge count={2} style={{ marginRight: 24 }}>
            <BellOutlined style={{ fontSize: 20 }} />
          </Badge>
        )} */}
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ marginLeft: 16, cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
            <div>{getAdminName()}</div>
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
