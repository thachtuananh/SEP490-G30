import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Table,
  Button,
  Input,
  Tag,
  message,
  Card,
  Breadcrumb,
  Space,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../../utils/config";

const { Content } = Layout;
const { Title } = Typography;

const OwnerList = () => {
  const [searchText, setSearchText] = useState("");
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  // Determine responsive settings based on window width
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;
  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 992) {
        setCollapsed(false);
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/admin/customers/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });

      setOwners(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => new Date(dateStr);

  const filteredOwners = searchText
    ? owners.filter(
        (record) =>
          record.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          record.phone?.includes(searchText)
      )
    : owners;

  const columns = [
    {
      title: "ID",
      dataIndex: "customerId",
      key: "customerId",
      sorter: (a, b) => a.customerId - b.customerId,
      // responsive: ["md"],
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      // responsive: ["md"],
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => parseDate(text).toLocaleDateString("vi-VN"),
      sorter: (a, b) => parseDate(a.created_at) - parseDate(b.created_at),
      // responsive: ["lg"],
    },
    {
      title: "Trạng thái",
      dataIndex: "is_deleted",
      key: "is_deleted",
      render: (is_deleted) => {
        const color = is_deleted ? "red" : "green";
        const text = is_deleted ? "Không hoạt động" : "Đang hoạt động";

        return (
          <Tag color={color} style={{ borderRadius: "4px" }}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Đang hoạt động", value: false },
        { text: "Không hoạt động", value: true },
      ],
      onFilter: (value, record) => record.is_deleted === value,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => viewOwnerDetails(record.customerId)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const viewOwnerDetails = (id) => {
    navigate(`/admin/owners/${id}`);
  };
  // Updated breadcrumb items using the new API
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
    },
    {
      title: (
        <>
          <UserOutlined />
          <span>Người dùng</span>
        </>
      ),
    },
    {
      title: "Chủ nhà",
    },
  ];

  // Cập nhật lại margin cho layout
  const sidebarWidth = collapsed ? 80 : windowWidth < 1200 ? 180 : 220;

  const contentStyle = {
    margin: isMobile ? "8px 8px 8px 4px" : isTablet ? "16px 8px" : "24px 16px",
    padding: isMobile ? 8 : isTablet ? 16 : 24,
    background: "#fff",
    minHeight: 280,
    transition: "all 0.2s",
  };

  const layoutStyle = {
    marginLeft: isMobile ? "60px" : `${sidebarWidth}px`,
    transition: "all 0.2s",
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AppSidebar />
        <Layout style={layoutStyle}>
          <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
          <Content style={contentStyle}>
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <p>Đang tải dữ liệu...</p>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={layoutStyle}>
        <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
        <Content style={contentStyle}>
          <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
            <Col xs={24} scroll={{ x: "max-content" }}>
              <Breadcrumb
                items={breadcrumbItems}
                style={{ marginBottom: 16 }}
              />

              <Card>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <Title level={3} style={{ margin: 0 }}>
                    Danh sách Chủ nhà
                  </Title>
                  <Space
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchOwners}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc số điện thoại"
                      prefix={<SearchOutlined />}
                      style={{
                        width: "100%",
                        minWidth: "200px",
                        maxWidth: "300px",
                      }}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </Space>
                </div>

                <Table
                  columns={columns}
                  dataSource={filteredOwners}
                  rowKey="customerId"
                  bordered
                  loading={loading}
                  scroll={{ x: "max-content" }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OwnerList;
