import React from "react";
import { Layout, Typography, Row, Col, Card, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import AppSidebar from "../../components/Admin/AppSidebar";
import AppHeader from "../../components/Admin/AppHeader";
import StatCards from "../../components/Admin/StatCards";
import SalesChart from "../../components/Admin/SalesChart";

const { Content } = Layout;
const { Title } = Typography;

const MainDashboard = () => {
  // Updated breadcrumb items using the new API
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
    },
    {
      title: "Dashboard",
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
            <Title level={3}>Dashboard</Title>
            <div style={{ marginBottom: 24 }}>
              <StatCards />
            </div>

            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Thống kê doanh thu">
                  <SalesChart />
                </Card>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainDashboard;
