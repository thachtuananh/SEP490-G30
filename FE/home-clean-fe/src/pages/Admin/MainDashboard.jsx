import React from "react";
import { Layout, Typography } from "antd";
import AppSidebar from "../../components/Admin/AppSidebar";
import AppHeader from "../../components/Admin/AppHeader";
import StatCards from "../../components/Admin/StatCards";
import SalesChart from "../../components/Admin/SalesChart";
import DealsTable from "../../components/Admin/DealsTable";

const { Content } = Layout;
const { Title } = Typography;

const MainDashboard = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
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
          <Title level={3}>Dashboard</Title>
          <div style={{ marginBottom: 24 }}>
            <StatCards />
          </div>
          <SalesChart />
          <DealsTable />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainDashboard;
