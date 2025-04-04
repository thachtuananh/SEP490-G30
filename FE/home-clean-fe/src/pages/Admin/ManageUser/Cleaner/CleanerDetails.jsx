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
  Tabs,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import AppSidebar from "../../../../components/Admin/AppSidebar";
import AppHeader from "../../../../components/Admin/AppHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CleanerDetails = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const [cleanerData, setCleanerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, fetch cleaner data based on cleanerId from an API
    // Simulating API call with setTimeout
    setTimeout(() => {
      setCleanerData({
        profile_image_base64:
          "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACs0lEQVR4Xu3Ssa0cQQwE0ctGKSrsy0ByqbLURn9gyDKeMes0uKjP9/v90/brdx83G7jZwM22Dz808MgGbjZws4GbbQYQ4GYDN9sMIMDNBm62GUCAmw3cbDOAADcbuNlmAAFuNnCzzQAC3GzgZpsBBLjZwM02Awhws4GbbQYQ4GYDN9sMIMDNBm62GUCAmw3cbDOAADcbuNlmAAFuNnCzzQAC3GzgZpsBBLjZwM02Awhws4GbbQYQ4GYDN9sMIMDNBm62GUCAmw3cbDOAADcbuNlmAAFuNnCzzQAC3GzgZpsBBLjZwM22HwngJ/BHNnBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzAwMIcHMDAwhwcwMDCHBzgw+P1H4GcJwBHGcAxxnAcQZwnAEcZwDHGcBxBnCcARxnAMcZwHEGcJwBHGcAxxnAcQZwnAEcZwDHGcBxBnCcARxnAMcZwHErA5hHtXDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfMmAwhw81XzJgMIcPNV8yYDCHDzVfOmNQHo/xnAcQZwnAEcZwDHGcBxBnCcARxnAMcZwHEGcJwBHGcAxxnAcQZwnAEcZwDHGcBxBnCcARxnAMcZwHEGcJwBHGcAx/0TwHzoHgM4zgCO+wuD+8BxNeZu7QAAAABJRU5ErkJggg==",
        address: "",
        created_at: "2025-04-01T15:12:09.094569",
        account_status: null,
        identity_number: "123456789123",
        experience: "4y",
        updated_at: "2025-04-01T15:12:09.094585",
        phone: "0123456789",
        identity_verified: false,
        password_hash:
          "$2a$10$WSNCjM.VRnWUv7aoODigVesp4gO2VZYlU0FRIkQVi/.uodgim0.3y",
        name: "MạnhTT",
        cleanerId: 1,
        email: "manh@gmail.com",
        age: 23,
        status: true,
      });
      setLoading(false);
    }, 500);
  }, [cleanerId]);

  const goBack = () => {
    navigate("/admin/cleaners");
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("vi-VN");
    const formattedTime = date.toLocaleTimeString("vi-VN");
    return `${formattedDate} ${formattedTime}`;
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
            <Title level={3}>Chi tiết Cleaner</Title>
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
                size={84}
                src={
                  cleanerData.profile_image_base64
                    ? `data:image/png;base64,${cleanerData.profile_image_base64}`
                    : null
                }
                icon={!cleanerData.profile_image_base64 && <UserOutlined />}
                style={{ marginRight: 24 }}
              />
              <div>
                <Title level={4}>{cleanerData.name}</Title>
                <Space size="large">
                  <Badge
                    status={cleanerData.status ? "success" : "error"}
                    text={
                      cleanerData.status ? "Đang hoạt động" : "Không hoạt động"
                    }
                  />
                  <Space>
                    <Text>Xác minh CMND/CCCD:</Text>
                    {cleanerData.identity_verified ? (
                      <CheckCircleOutlined style={{ color: "green" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "red" }} />
                    )}
                  </Space>
                </Space>
              </div>
            </div>

            <Divider />

            <Tabs defaultActiveKey="basic">
              <TabPane tab="Thông tin cơ bản" key="basic">
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Mã người dọn dẹp">
                    {cleanerData.cleanerId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">
                    {cleanerData.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {cleanerData.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {cleanerData.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tuổi">
                    {cleanerData.age}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kinh nghiệm">
                    {cleanerData.experience}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {cleanerData.address || "Chưa cập nhật"}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Thông tin xác thực" key="verification">
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="CMND/CCCD">
                    {cleanerData.identity_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái xác minh">
                    {cleanerData.identity_verified ? (
                      <Badge status="success" text="Đã xác minh" />
                    ) : (
                      <Badge status="error" text="Chưa xác minh" />
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Thông tin tài khoản" key="account">
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Ngày tạo">
                    {formatDateTime(cleanerData.created_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {formatDateTime(cleanerData.updated_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái tài khoản">
                    {cleanerData.account_status
                      ? cleanerData.account_status
                      : "Chưa xác định"}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Space>
                {!cleanerData.identity_verified && (
                  <Button type="primary" ghost>
                    Xác minh CMND/CCCD
                  </Button>
                )}
                {cleanerData.status && <Button danger>Vô hiệu hoá</Button>}
                <Button type="primary">Chỉnh sửa</Button>
              </Space>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CleanerDetails;
