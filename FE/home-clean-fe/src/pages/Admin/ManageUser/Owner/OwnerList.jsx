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
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => parseDate(text).toLocaleDateString("vi-VN"),
      sorter: (a, b) => parseDate(a.created_at) - parseDate(b.created_at),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_deleted",
      key: "is_deleted",
      render: (is_deleted) => (
        <Tag
          color={is_deleted ? "red" : "green"}
          style={{ borderRadius: "4px" }}
        >
          {is_deleted ? "Đã xoá" : "Hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: false },
        { text: "Đã xoá", value: true },
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
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Title level={3}>Danh sách Chủ nhà</Title>
              <Space>
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
                  style={{ width: 300 }}
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
              // pagination={{
              //   pageSize: 10,
              //   showSizeChanger: true,
              //   showTotal: (total, range) =>
              //     `${range[0]}-${range[1]} của ${total} mục`,
              // }}
              bordered
              loading={loading}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OwnerList;
