import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Typography,
  Divider,
  Space,
  Button,
  Tooltip,
  Row,
  Col,
  Tag,
  notification,
  Skeleton,
  message,
} from "antd";
import {
  WalletOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { BASE_URL } from "../../../utils/config";

const { Title, Text } = Typography;

export const WalletBalance = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const cleanerId = localStorage.getItem("cleanerId");

      const response = await fetch(`${BASE_URL}/cleaner/${cleanerId}/wallet`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setWalletData(data);
      } else {
        throw new Error(data.message || "Không thể lấy dữ liệu ví");
      }
    } catch (error) {
      // notification.error({
      //   message: "Lỗi khi tải dữ liệu ví",
      //   description: error.message,
      //   icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      // });
      message.error("Lỗi khi tải dữ liệu ví");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        width: "100%",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      hoverable
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <WalletOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Quản lý ví
              </Title>
            </Space>
          </Col>
          <Col>
            <Tooltip title="Số dư khả dụng trong ví của bạn">
              <InfoCircleOutlined
                style={{ fontSize: 16, color: "rgba(0,0,0,0.45)" }}
              />
            </Tooltip>
          </Col>
        </Row>

        <Divider style={{ margin: "12px 0" }} />

        {loading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text type="secondary">Tổng số tiền</Text>
            <Statistic
              value={walletData?.walletBalance}
              precision={0}
              prefix="₫"
              valueStyle={{
                color: "#3f8600",
                fontWeight: "bold",
                fontSize: 28,
              }}
              formatter={(value) => value.toLocaleString()}
            />
            {/* <div style={{ marginTop: 8 }}>
              <Text type="secondary" italic>
                {walletData?.message || "Số dư ví hiện tại"}
              </Text>
            </div> */}
          </Space>
        )}

        <Row gutter={8}>
          <Col span={12}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                width: "100%",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                height: 40,
              }}
            >
              Thêm tiền vào ví
            </Button>
          </Col>
          <Col span={12}>
            <Button
              icon={<HistoryOutlined />}
              style={{
                width: "100%",
                height: 40,
              }}
            >
              Lịch sử giao dịch
            </Button>
          </Col>
        </Row>

        <div style={{ textAlign: "center" }}>
          <Tag color="blue" style={{ padding: "4px 8px" }}>
            Tài khoản tiêu chuẩn
          </Tag>
        </div>
      </Space>
    </Card>
  );
};

export default WalletBalance;
