import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Descriptions,
  Button,
  Space,
  Avatar,
  Divider,
} from "antd";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";

const { Content } = Layout;
const { Title } = Typography;

const OwnerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, fetch owner data based on customerId from an API
    // Simulating API call with setTimeout
    setTimeout(() => {
      setOwnerData({
        created_at: "2025-04-01T15:16:26.249594",
        phone: "0384244398",
        is_deleted: false,
        customerId: 1,
        name: "Nguyễn Sơn",
      });
      setLoading(false);
    }, 500);
  }, [customerId]);

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("vi-VN");
    const formattedTime = date.toLocaleTimeString("vi-VN");
    return `${formattedDate} ${formattedTime}`;
  };

  const goBack = () => {
    navigate("/admin/owners");
  };

  if (loading) {
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
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <p>Đang tải dữ liệu...</p>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

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
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              Quay lại
            </Button>
            <Title level={3}>Chi tiết Owner</Title>
          </Space>

          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ marginRight: 24 }}
              />
              <div>
                <Title level={4}>{ownerData.name}</Title>
                <Typography.Text
                  type={ownerData.is_deleted ? "danger" : "success"}
                >
                  {ownerData.is_deleted ? "Đã xoá" : "Đang hoạt động"}
                </Typography.Text>
              </div>
            </div>

            <Divider />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Mã khách hàng">
                {ownerData.customerId}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {ownerData.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {ownerData.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(ownerData.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {ownerData.is_deleted ? "Đã xoá" : "Đang hoạt động"}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Space>
                {!ownerData.is_deleted && (
                  <Button danger>Xoá người dùng</Button>
                )}
                <Button type="primary">Chỉnh sửa</Button>
              </Space>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OwnerDetails;
