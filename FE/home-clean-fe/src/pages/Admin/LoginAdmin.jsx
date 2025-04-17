import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import logo from "../../assets/HouseClean_logo.png";
import background from "../../assets/deep-cleaning-list-hero.jpg";

const { Title, Text } = Typography;

function LoginAdmin() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    const { phone, password } = values;
    setLoading(true);
    setErrorMessage("");
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const { token, adminId, name, role } = result;

        sessionStorage.setItem("name", name);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("adminId", adminId);
        sessionStorage.setItem("role", role);

        dispatch({
          type: "LOGIN_SUCCESS_ADMIN",
          payload: { name, token, adminId, phone },
        });

        message.success("Đăng nhập thành công!");
        navigate("/admin");
      } else {
        setErrorMessage(result.message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      setErrorMessage("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      message.error(errorMessage);
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Row justify="center" align="middle" style={{ width: "100%" }}>
        <Col xs={22} sm={16} md={12} lg={8}>
          <Card
            style={{
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <img
                src={logo}
                alt="HouseClean Logo"
                style={{
                  height: "60px",
                  marginBottom: "16px",
                }}
              />
              <Title level={3}>Đăng nhập quản trị viên</Title>
              <Text type="secondary">
                Nhập thông tin đăng nhập của bạn để tiếp tục
              </Text>
            </div>

            {/* {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )} */}

            <Form
              form={form}
              layout="vertical"
              name="login_form"
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Số điện thoại"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Mật khẩu"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "6px",
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LoginAdmin;
