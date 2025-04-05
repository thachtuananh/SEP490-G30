import React, { useState, useEffect } from "react";
import { Layout, Typography, Table, Button, Input, Tag, message } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
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
      const token = localStorage.getItem("token"); // Assuming you store token in localStorage

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

  // Hàm chuyển đổi chuỗi datetime thành Date object
  const parseDate = (dateStr) => new Date(dateStr);

  // Filter data based on search text before passing to Table
  const filteredCleaners = searchText
    ? cleaners.filter(
        (record) =>
          record.name.toLowerCase().includes(searchText.toLowerCase()) ||
          record.phone.includes(searchText) ||
          record.email.toLowerCase().includes(searchText.toLowerCase())
      )
    : cleaners;

  const columns = [
    {
      title: "ID",
      dataIndex: "cleanerId",
      key: "cleanerId",
      sorter: (a, b) => a.cleanerId - b.cleanerId,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      // Removed filteredValue and onFilter from here
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => parseDate(text).toLocaleDateString("vi-VN"),
      sorter: (a, b) => parseDate(a.created_at) - parseDate(b.created_at),
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "identity_verified",
      key: "identity_verified",
      render: (identity_verified) => {
        const color = identity_verified ? "green" : "red";
        const text = identity_verified ? "Đã xác minh" : "Chưa xác minh";

        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Đã xác minh", value: true },
        { text: "Chưa xác minh", value: false },
      ],
      onFilter: (value, record) => record.account_status === value,
    },
    // {
    //   title: "Trạng thái xác minh",
    //   dataIndex: "identity_verified",
    //   key: "identity_verified",
    //   render: (identity_verified) => {
    //     const color = identity_verified ? "green" : "red";
    //     const text = identity_verified ? "Đã xác minh" : "Chưa xác minh";

    //     return <Tag color={color}>{text}</Tag>;
    //   },
    //   filters: [
    //     { text: "Đã xác minh", value: true },
    //     { text: "Chưa xác minh", value: false },
    //   ],
    //   onFilter: (value, record) => record.identity_verified === value,
    // },
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

  return (
    <Layout style={{ minHeight: "1000px" }}>
      <AppSidebar />
      <Layout>
        <AppHeader />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Title level={3}>Danh sách Cleaner chưa xác minh</Title>
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại hoặc email"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredCleaners} // Using filtered data here
            rowKey="cleanerId"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CleanerListBan;
