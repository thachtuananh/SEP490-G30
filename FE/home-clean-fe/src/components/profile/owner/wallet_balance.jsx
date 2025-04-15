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
  Modal,
  InputNumber,
  Form,
  Table,
  Badge,
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
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [depositLoading, setDepositLoading] = useState(false);
  const [form] = Form.useForm();

  // Transaction history states
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const customerId = sessionStorage.getItem("customerId");
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/cleaner/${customerId}/walletcustomer`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setWalletData(data);
      } else {
        throw new Error(data.message || "Không thể lấy dữ liệu ví");
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu ví");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${BASE_URL}/cleaner/${customerId}/transaction-historycustomer`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTransactionHistory(data);
      } else {
        throw new Error(data.message || "Không thể lấy lịch sử giao dịch");
      }
    } catch (error) {
      message.error("Lỗi khi tải lịch sử giao dịch");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDepositClick = () => {
    setDepositModalVisible(true);
  };

  const handleDepositCancel = () => {
    setDepositModalVisible(false);
    form.resetFields();
  };

  const handleHistoryClick = () => {
    setHistoryModalVisible(true);
    fetchTransactionHistory();
  };

  const handleHistoryCancel = () => {
    setHistoryModalVisible(false);
  };

  const handleDepositSubmit = async () => {
    try {
      await form.validateFields();
      setDepositLoading(true);
      const response = await fetch(
        `${BASE_URL}/cleaner/${customerId}/depositforcustomer`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: `${depositAmount}`,
            payment_method: "vnpay",
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        // Open the payment URL in a new window
        window.open(data.paymentUrl, "_blank");
        setDepositModalVisible(false);
        form.resetFields();
        message.success("Đang chuyển hướng đến trang thanh toán");
      } else {
        throw new Error(data.message || "Không thể thực hiện nạp tiền");
      }
    } catch (error) {
      message.error(`Lỗi khi nạp tiền: ${error.message}`);
    } finally {
      setDepositLoading(false);
    }
  };

  // Transaction history columns for the table
  const historyColumns = [
    {
      title: "Mã giao dịch",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text
          style={{
            color: amount > 0 ? "#3f8600" : "#cf1322",
            fontWeight: "bold",
          }}
        >
          {amount.toLocaleString()} VNĐ
        </Text>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;

        if (status === "SUCCESS") {
          color = "success";
          text = "Thành công";
        } else if (status === "PENDING") {
          color = "warning";
          text = "Đang xử lý";
        } else if (status === "FAILED") {
          color = "error";
          text = "Thất bại";
        }

        return <Badge status={color} text={text} />;
      },
    },
    // {
    //   title: "Thời gian",
    //   dataIndex: "createdAt",
    //   key: "createdAt",
    //   render: (createdAt) => {
    //     // If createdAt exists and is a valid date string
    //     if (createdAt) {
    //       const date = new Date(createdAt);
    //       return date.toLocaleString("vi-VN");
    //     }
    //     return "N/A";
    //   },
    // },
  ];

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
              // prefix="VNĐ"
              valueStyle={{
                color: "#3f8600",
                fontWeight: "bold",
                fontSize: 28,
              }}
              formatter={(value) => value.toLocaleString() + " VNĐ"}
            />
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
              onClick={handleDepositClick}
            >
              Nạp tiền vào ví
            </Button>
          </Col>
          <Col span={12}>
            <Button
              icon={<HistoryOutlined />}
              style={{
                width: "100%",
                height: 40,
              }}
              onClick={handleHistoryClick}
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

      {/* Deposit Modal */}
      <Modal
        title="Nạp tiền vào ví"
        open={depositModalVisible}
        onCancel={handleDepositCancel}
        footer={[
          <Button key="cancel" onClick={handleDepositCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={depositLoading}
            onClick={handleDepositSubmit}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Tiếp tục thanh toán
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" initialValues={{ amount: 100000 }}>
          <Form.Item
            label="Số tiền muốn nạp (VNĐ)"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                type: "number",
                min: 10000,
                message: "Số tiền nạp tối thiểu là 10,000 VNĐ",
              },
              {
                type: "number",
                max: 50000000,
                message: "Số tiền nạp tối đa là 50,000,000 VNĐ",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              onChange={(value) => setDepositAmount(value)}
              addonBefore="VNĐ"
            />
          </Form.Item>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Bạn sẽ được chuyển đến trang thanh toán VNPAY để hoàn tất việc nạp
              tiền.
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Transaction History Modal */}
      <Modal
        title="Lịch sử giao dịch"
        open={historyModalVisible}
        onCancel={handleHistoryCancel}
        footer={[
          <Button key="close" onClick={handleHistoryCancel}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={historyColumns}
          dataSource={transactionHistory}
          rowKey="transactionId"
          loading={historyLoading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Modal>
    </Card>
  );
};

export default WalletBalance;
