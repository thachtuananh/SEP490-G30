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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  UserOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";
import axios from "axios";
import { BASE_URL } from "../../../../utils/config";

const { Content } = Layout;
const { Title } = Typography;

const CleanerListBan = () => {
  const [searchText, setSearchText] = useState("");
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCleaners();
  }, []);

  const fetchCleaners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/admin/cleaners/unverified`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      setCleaners(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => new Date(dateStr);

  const filteredCleaners = searchText
    ? cleaners.filter(
        (record) =>
          record.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          record.phone?.includes(searchText) ||
          record.email?.toLowerCase().includes(searchText.toLowerCase())
      )
    : cleaners;

  const columns = [
    {
      title: "ID",
      dataIndex: "cleanerId",
      key: "cleanerId",
      sorter: (a, b) => a.cleanerId - b.cleanerId,
      responsive: ["md"],
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
      responsive: ["md"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => parseDate(text).toLocaleDateString("vi-VN"),
      sorter: (a, b) => parseDate(a.created_at) - parseDate(b.created_at),
      responsive: ["lg"],
    },
    {
      title: "Trạng thái xác minh",
      dataIndex: "identity_verified",
      key: "identity_verified",
      render: (identity_verified) => {
        const color = identity_verified ? "green" : "red";
        const text = identity_verified ? "Đã xác minh" : "Chưa xác minh";

        return (
          <Tag color={color} style={{ borderRadius: "4px" }}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Đã xác minh", value: true },
        { text: "Chưa xác minh", value: false },
      ],
      onFilter: (value, record) => record.identity_verified === value,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => viewCleanerDetails(record.cleanerId)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const viewCleanerDetails = (id) => {
    navigate(`/admin/cleaners/${id}`);
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
      title: (
        <>
          <StopOutlined />
          <span>Chưa xác minh</span>
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={{ marginLeft: 220 }}>
        <AppHeader />
        <Content
          style={{
            margin: "24px 16px",
            minHeight: 280,
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />

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
              <Title level={3}>Danh sách Người dọn dẹp chưa xác minh</Title>
              <Space
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchCleaners}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Input
                  placeholder="Tìm kiếm theo tên, số điện thoại hoặc email"
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
              dataSource={filteredCleaners}
              rowKey="cleanerId"
              loading={loading}
              // pagination={{
              //   pageSize: 10,
              //   showSizeChanger: true,
              //   showTotal: (total, range) =>
              //     `${range[0]}-${range[1]} của ${total} mục`,
              // }}
              bordered
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CleanerListBan;
