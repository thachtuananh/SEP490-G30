import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layout, Badge, Avatar, Dropdown, Space, message } from "antd";
import {
  BellOutlined,
  CaretDownOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const { admin, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Convert to boolean
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
    // Fallback to localStorage for compatibility
    const storedName = localStorage.getItem("name");
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Left side of header can be extended here */}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {isLoggedIn && (
          <Badge count={2} style={{ marginRight: 24 }}>
            <BellOutlined style={{ fontSize: 20 }} />
          </Badge>
        )}
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
