import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Badge,
  Avatar,
  Dropdown,
  Space,
  message,
  Tooltip,
  Button,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = ({ collapsed, setCollapsed }) => {
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
        // {
        //   key: "profile",
        //   label: "Thông tin cá nhân",
        //   icon: <UserOutlined />,
        // },
        // {
        //   type: "divider",
        // },
        {
          key: "logout",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
          danger: true,
        },
      ]
    : [
        {
          key: "login",
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
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1,
        boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", marginRight: 12 }}
          />
        </Tooltip> */}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {isLoggedIn && (
          <Tooltip title="Thông báo">
            <Badge count={2} style={{ marginRight: 24 }}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20 }} />}
              />
            </Badge>
          </Tooltip>
        )}
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ marginLeft: 16, cursor: "pointer" }}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: isLoggedIn ? "#1890ff" : "#d9d9d9" }}
            />
            <div style={{ fontWeight: 500 }}>{getAdminName() || "Khách"}</div>
            <span className="dropdown-icon" style={{ fontSize: 12 }}>
              ▼
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
