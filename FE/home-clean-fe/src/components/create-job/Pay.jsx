import React, { useState } from "react";
import { Card, Radio, Checkbox, Typography, Space, Row, Col } from "antd";
import {
    DollarOutlined,
    BankOutlined,
    CreditCardOutlined,
    WalletOutlined
} from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Pay.module.css";

const { Title, Text } = Typography;

const Pay = () => {
    const [selectedMethod, setSelectedMethod] = useState("cash");
    // const [termsAccepted, setTermsAccepted] = useState(false);

    const handleMethodChange = (e) => {
        setSelectedMethod(e.target.value);
    };

    return (
        <Card
            className={styles.paymentContainer}
            style={{
                borderRadius: '5px',
                border: '1px solid rgb(225, 225, 225)',
                marginTop: '15px'
            }}
        >
            <Title level={5} style={{ marginBottom: '16px' }}>Phương thức thanh toán</Title>

            <Radio.Group
                onChange={handleMethodChange}
                value={selectedMethod}
                style={{ width: '100%' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Thanh toán tiền mặt */}
                    <div className={styles.paymentOption}>
                        <Row align="middle" justify="space-between" style={{ width: '100%' }}>
                            <Col>
                                <Space>
                                    <DollarOutlined
                                        style={{
                                            color: '#00A67E',
                                            fontSize: '18px',
                                            marginRight: '8px'
                                        }}
                                    />
                                    <Text>Thanh toán tiền mặt</Text>
                                </Space>
                            </Col>
                            <Col>
                                <Radio value="cash" />
                            </Col>
                        </Row>
                    </div>

                    {/* Thanh toán chuyển khoản */}
                    <div className={styles.paymentOption}>
                        <Row align="middle" justify="space-between" style={{ width: '100%' }}>
                            <Col>
                                <Space>
                                    <BankOutlined
                                        style={{
                                            color: '#00A67E',
                                            fontSize: '18px',
                                            marginRight: '8px'
                                        }}
                                    />
                                    <Text>Thanh toán chuyển khoản</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                        BIDV 4271****
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                <Radio value="bank" />
                            </Col>
                        </Row>
                    </div>

                    {/* Thanh toán qua ví điện tử */}
                    <div className={styles.paymentOption}>
                        <Row align="middle" justify="space-between" style={{ width: '100%' }}>
                            <Col>
                                <Space>
                                    <WalletOutlined
                                        style={{
                                            color: '#00A67E',
                                            fontSize: '18px',
                                            marginRight: '8px'
                                        }}
                                    />
                                    <Text>Thanh toán qua ví điện tử</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                        *********687
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                <Radio value="momo" />
                            </Col>
                        </Row>
                    </div>

                    {/* Thanh toán ZaloPay */}
                    <div className={styles.paymentOption}>
                        <Row align="middle" justify="space-between" style={{ width: '100%' }}>
                            <Col>
                                <Space>
                                    <CreditCardOutlined
                                        style={{
                                            color: '#00A67E',
                                            fontSize: '18px',
                                            marginRight: '8px'
                                        }}
                                    />
                                    <Text>Thanh toán qua ví điện tử</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                        *********687
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                <Radio value="zalo" />
                            </Col>
                        </Row>
                    </div>
                </Space>
            </Radio.Group>

            {/* <div style={{ marginTop: '16px' }}>
                <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                >
                    <Text style={{ fontSize: '14px' }}>
                        Tôi đồng ý với <Text strong>Điều khoản và dịch vụ</Text> của HouseClean
                    </Text>
                </Checkbox>
            </div> */}
        </Card>
    );
};

export default Pay;