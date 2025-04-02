import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layout, Badge, Avatar, Dropdown, Space, message } from "antd";
import {
  BellOutlined,
  CaretDownOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const { admin, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    message.success("Đăng xuất thành công!");
    navigate("/admin-login");
  };

  // Menu items for the dropdown
  const menuItems = [
    {
      key: "1",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const getAdminName = () => {
    if (admin && admin.adminName) {
      return admin.adminName;
    }
    // Fallback to localStorage for compatibility
    const storedName = localStorage.getItem("name");
    return storedName ? storedName : "";
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
        <Badge count={2} style={{ marginRight: 24 }}>
          <BellOutlined style={{ fontSize: 20 }} />
        </Badge>
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
