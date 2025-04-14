import React, { useState } from "react";
import { Card, Radio, Checkbox, Typography, Space, Row, Col } from "antd";
import {
  DollarOutlined,
  BankOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Pay.module.css";

const { Title, Text } = Typography;

const Pay = ({ onPaymentMethodChange }) => {
  const [selectedMethod, setSelectedMethod] = useState("vnpay");

  const handleMethodChange = (e) => {
    const method = e.target.value;
    setSelectedMethod(method);
    // Pass the selected method to parent component
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  return (
    <Card
      className={styles.paymentContainer}
      style={{
        borderRadius: "5px",
        border: "1px solid rgb(225, 225, 225)",
        marginTop: "15px",
      }}
    >
      <Title level={5} style={{ marginBottom: "16px" }}>
        Phương thức thanh toán
      </Title>

      <Radio.Group
        onChange={handleMethodChange}
        value={selectedMethod}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Thanh toán tiền mặt */}
          {/* <div className={styles.paymentOption}>
            <Row
              align="middle"
              justify="space-between"
              style={{ width: "100%" }}
            >
              <Col>
                <Space>
                  <DollarOutlined
                    style={{
                      color: "#00A67E",
                      fontSize: "18px",
                      marginRight: "8px",
                    }}
                  />
                  <Text>Thanh toán tiền mặt</Text>
                </Space>
              </Col>
              <Col>
                <Radio value="cash" />
              </Col>
            </Row>
          </div> */}

          {/* Thanh toán chuyển khoản */}
          <div className={styles.paymentOption}>
            <Row
              align="middle"
              justify="space-between"
              style={{ width: "100%" }}
            >
              <Col>
                <Space>
                  <WalletOutlined
                    style={{
                      color: "#00A67E",
                      fontSize: "18px",
                      marginRight: "8px",
                    }}
                  />
                  <Text>Thanh toán bằng VNPay</Text>
                </Space>
              </Col>
              <Col>
                <Radio value="vnpay" />
              </Col>
            </Row>
          </div>

          {/* Thanh toán Ví điện tử */}
          <div className={styles.paymentOption}>
            <Row
              align="middle"
              justify="space-between"
              style={{ width: "100%" }}
            >
              <Col>
                <Space>
                  <CreditCardOutlined
                    style={{
                      color: "#00A67E",
                      fontSize: "18px",
                      marginRight: "8px",
                    }}
                  />
                  <Text>Thanh toán qua ví điện tử</Text>
                </Space>
              </Col>
              <Col>
                <Radio value="wallet" />
              </Col>
            </Row>
          </div>
        </Space>
      </Radio.Group>
    </Card>
  );
};

export default Pay;
