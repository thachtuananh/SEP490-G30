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
  Input,
  Select,
} from "antd";
import {
  WalletOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { BASE_URL } from "../../../utils/config";

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [withdrawalHistoryLoading, setWithdrawalHistoryLoading] =
    useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [historyWithdrawlModalVisible, setHistoryWithdrawlModalVisible] =
    useState(false);
  const token = sessionStorage.getItem("token");
  const customerId = sessionStorage.getItem("customerId");

  // Withdrawal states
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [withdrawalForm] = Form.useForm();
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  const vietnamBanks = [
    {
      code: "VIETCOMBANK",
      name: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    },
    {
      code: "VIETINBANK",
      name: "Ngân hàng TMCP Công thương Việt Nam (VietinBank)",
    },
    {
      code: "BIDV",
      name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    },
    {
      code: "AGRIBANK",
      name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn (Agribank)",
    },
    {
      code: "TECHCOMBANK",
      name: "Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)",
    },
    { code: "MBBANK", name: "Ngân hàng TMCP Quân đội (MB Bank)" },
    { code: "ACB", name: "Ngân hàng TMCP Á Châu (ACB)" },
    { code: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)" },
    {
      code: "SACOMBANK",
      name: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
    },
    { code: "TPBank", name: "Ngân hàng TMCP Tiên Phong (TPBank)" },
    { code: "HDBANK", name: "Ngân hàng TMCP Phát triển TP.HCM (HDBank)" },
    { code: "OCB", name: "Ngân hàng TMCP Phương Đông (OCB)" },
  ];

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
        message.error(data.message || "Không thể lấy dữ liệu ví");
      }
    } catch (error) {
      // message.error("Lỗi khi tải dữ liệu ví");
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
        message.error(data.message || "Không có dữ liệu lịch sử giao dịch");
      }
    } catch (error) {
      // message.error("Lỗi khi tải lịch sử giao dịch");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      setWithdrawalHistoryLoading(true);
      const response = await fetch(
        `${BASE_URL}/withdraw/customers/${customerId}/history`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok && result.status === "OK") {
        setWithdrawalHistory(result.data || []);
      } else {
        // message.info(result.message || "Không có dữ liệu lịch sử rút tiền");
      }
    } catch (error) {
      // message.error("Lỗi khi tải lịch sử rút tiền");
    } finally {
      setWithdrawalHistoryLoading(false);
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
      if (
        !depositAmount ||
        isNaN(depositAmount) ||
        depositAmount.toString().trim() === ""
      ) {
        message.error("Số tiền không được để trống hoặc chứa khoảng trắng!");
        return;
      }

      await form.validateFields();
      if (depositAmount < 10000 || depositAmount > 50000000) {
        message.error("Số tiền nạp phải từ 10,000 VNĐ đến 50,000,000 VNĐ!");
        return;
      }

      if (depositLoading) {
        return;
      }

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
        let countDown = 3;
        const messageKey = "redirectCountdown";

        message.info({
          content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
          key: messageKey,
          duration: 3.5,
        });

        const interval = setInterval(() => {
          countDown -= 1;
          message.info({
            content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
            key: messageKey,
            duration: 1.5,
          });

          if (countDown === 0) {
            clearInterval(interval);
          }
        }, 1000);

        setTimeout(() => {
          window.open(data.paymentUrl, "_blank");
        }, 3000);

        setDepositModalVisible(false);
        form.resetFields();
      } else {
        message.error(data.message || "Không thể thực hiện nạp tiền");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại số tiền nạp!");
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawalClick = () => {
    setWithdrawalModalVisible(true);
  };

  const handleWithdrawalCancel = () => {
    setWithdrawalModalVisible(false);
    withdrawalForm.resetFields();
  };

  const handleHistoryWithdrawlCancel = () => {
    setHistoryWithdrawlModalVisible(false);
  };

  const handleHistoryWithdrawlClick = () => {
    setHistoryWithdrawlModalVisible(true);
    fetchWithdrawalHistory();
  };

  const handleWithdrawalSubmit = async () => {
    try {
      const values = await withdrawalForm.validateFields();
      setWithdrawalLoading(true);

      const response = await fetch(
        `${BASE_URL}/withdraw/${customerId}/requestWithdrawal`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cardNumber: values.accountNumber,
            accountHolderName: values.accountName,
            bankName: values.bankName,
            amount: values.amount,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setWithdrawalModalVisible(false);
        withdrawalForm.resetFields();
        message.success("Yêu cầu rút tiền đã được gửi đi thành công");
        fetchWalletBalance();
      } else {
        message.error(data.message || "Không thể thực hiện rút tiền");
      }
    } catch (error) {
      message.error(
        "Vui lòng kiểm tra lại thông tin tài khoản ngân hàng và số tiền rút."
      );
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const translateTransactionType = (type) => {
    const translations = {
      DEPOSIT: "Nạp tiền",
      Withdraw: "Rút tiền",
      PAYMENT: "Thanh toán",
      REFUND: "Hoàn tiền",
      Refund: "Hoàn tiền",
      BOOKING: "Thanh toán giao dịch",
      "WITHDRAWAL REJECTED": "Rút tiền bị từ chối",
    };
    return translations[type] || type;
  };

  const translateWithdrawalStatus = (status) => {
    const translations = {
      PENDING: "Đang xử lý",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      COMPLETED: "Hoàn thành",
    };
    return translations[status] || status;
  };

  const getWithdrawalStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "COMPLETED":
        return "processing";
      default:
        return "default";
    }
  };

  const historyColumns = [
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        const color =
          record.transactionType === "Withdraw" ||
          record.transactionType === "BOOKING"
            ? "#cf1322"
            : "#3f8600";
        return (
          <Text style={{ color, fontWeight: "bold" }}>
            {amount.toLocaleString()} VNĐ
          </Text>
        );
      },
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => {
        let color = "blue";
        if (type === "DEPOSIT") {
          color = "green";
        } else if (type === "Withdraw") {
          color = "orange";
        } else if (type === "PAYMENT") {
          color = "purple";
        } else if (type === "REFUND" || type === "Refund") {
          color = "cyan";
        }
        return <Tag color={color}>{translateTransactionType(type)}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) => {
        if (date) {
          const formattedDate = new Date(date).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          return formattedDate;
        }
        return " ";
      },
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        let text = method;
        if (method === "Bank Transfer") {
          text = "Chuyển khoản";
        } else if (method === "Wallet" || method === "WALLET") {
          text = "Ví điện tử";
        } else if (method === "VNPay") {
          text = "VNPay";
        }
        return text;
      },
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
  ];

  const withdrawalHistoryColumns = [
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text style={{ fontWeight: "bold" }}>
          {amount.toLocaleString()} VNĐ
        </Text>
      ),
    },
    {
      title: "Tài khoản",
      dataIndex: "cardNumber",
      key: "cardNumber",
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankName",
      key: "bankName",
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "accountHolderName",
      key: "accountHolderName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={getWithdrawalStatusColor(status)}
          text={translateWithdrawalStatus(status)}
        />
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        if (date) {
          const formattedDate = new Date(date).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          return formattedDate;
        }
        return " ";
      },
    },
    {
      title: "Lý do từ chối",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
      render: (reason) => reason || " ",
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transactionCode",
      key: "transactionCode",
      render: (code) => code || " ",
    },
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
              valueStyle={{
                color: "#3f8600",
                fontWeight: "bold",
                fontSize: 28,
              }}
              formatter={(value) => value.toLocaleString() + " VNĐ"}
            />
          </Space>
        )}

        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={12}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                width: "100%",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                height: 40,
                borderRadius: 4,
              }}
              onClick={handleDepositClick}
            >
              Nạp tiền vào ví
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Button
              type="primary"
              icon={<ArrowDownOutlined />}
              style={{
                width: "100%",
                backgroundColor: "#f5222d",
                borderColor: "#f5222d",
                height: 40,
                borderRadius: 4,
              }}
              onClick={handleWithdrawalClick}
              disabled={
                !walletData?.walletBalance || walletData?.walletBalance <= 50000
              }
            >
              Rút tiền
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Button
              icon={<HistoryOutlined />}
              style={{
                width: "100%",
                height: 40,
                borderRadius: 4,
              }}
              onClick={handleHistoryClick}
            >
              Lịch sử giao dịch
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Button
              icon={<HistoryOutlined />}
              style={{
                width: "100%",
                height: 40,
                borderRadius: 4,
              }}
              onClick={handleHistoryWithdrawlClick}
            >
              Lịch sử rút tiền
            </Button>
          </Col>
        </Row>
      </Space>

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
            disabled={depositLoading}
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
              { required: true, message: "Vui lòng nhập số tiền!" },
              {
                type: "number",
                min: 10000,
                message: "Số tiền nạp tối thiểu là 10,000 VNĐ!",
              },
              {
                type: "number",
                max: 50000000,
                message: "Số tiền nạp tối đa là 50,000,000 VNĐ!",
              },
              {
                validator: (_, value) => {
                  if (value && value.toString().trim() === "") {
                    return Promise.reject("Số tiền không được để trống!");
                  }
                  return Promise.resolve();
                },
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

      <Modal
        title="Rút tiền từ ví"
        open={withdrawalModalVisible}
        onCancel={handleWithdrawalCancel}
        footer={[
          <Button key="cancel" onClick={handleWithdrawalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={withdrawalLoading}
            onClick={handleWithdrawalSubmit}
            style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }}
          >
            Xác nhận rút tiền
          </Button>,
        ]}
      >
        <Form
          form={withdrawalForm}
          layout="vertical"
          initialValues={{ amount: 50000 }}
        >
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản" },
              {
                pattern: /^[a-zA-Z0-9]{16}$/,
                message:
                  "Số tài khoản phải gồm đúng 16 ký tự chữ và số, không chứa ký tự đặc biệt",
              },
            ]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" maxLength={16} />
          </Form.Item>

          <Form.Item
            label="Tên chủ tài khoản"
            name="accountName"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
              {
                pattern: /^(?=.*[A-Za-zÀ-ỹ])[A-Za-zÀ-ỹ\s]+$/u,
                message:
                  "Tên chỉ được chứa chữ cái và khoảng trắng, không được để trống hoặc toàn dấu cách",
              },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>

          <Form.Item
            label="Ngân hàng"
            name="bankName"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select placeholder="Chọn ngân hàng">
              {vietnamBanks.map((bank) => (
                <Option key={bank.code} value={bank.code}>
                  {bank.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tiền rút (VNĐ)"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                type: "number",
                min: 50000,
                message: "Số tiền rút tối thiểu là 50,000 VNĐ",
              },
              {
                type: "number",
                max: walletData?.walletBalance || 0,
                message: "Số tiền rút không được vượt quá số dư hiện tại",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonBefore="VNĐ"
            />
          </Form.Item>

          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Lưu ý: Yêu cầu rút tiền sẽ được xử lý trong vòng 24 giờ làm việc.
              Phí rút tiền: 0 VNĐ.
            </Text>
          </div>
        </Form>
      </Modal>

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
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
        />
      </Modal>

      <Modal
        title="Lịch sử rút tiền"
        open={historyWithdrawlModalVisible}
        onCancel={handleHistoryWithdrawlCancel}
        footer={[
          <Button key="close" onClick={handleHistoryWithdrawlCancel}>
            Đóng
          </Button>,
        ]}
        width="100%"
      >
        <Table
          columns={withdrawalHistoryColumns}
          dataSource={withdrawalHistory}
          rowKey="id"
          loading={withdrawalHistoryLoading}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
        />
      </Modal>
    </Card>
  );
};

export default WalletBalance;
