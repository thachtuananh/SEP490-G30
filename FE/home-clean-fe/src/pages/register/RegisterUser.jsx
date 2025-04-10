import React, { useState, useEffect } from "react";
import { message, Input, Form, Button } from "antd";
import logo from "../../assets/HouseClean_logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImgLeft from "../../assets/image-left.png";
import { BASE_URL } from "../../utils/config";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import {
  validatePhone,
  validateName,
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validate";

function RegisterUser() {
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateEmpty = (value, fieldName) => {
    if (!value || !value.trim()) {
      return `Vui lòng nhập ${fieldName}!`;
    }
    return "";
  };

  const handleSubmit = async () => {
    const { phone, name, password, confirmPassword } = formData;

    // Kiểm tra trường rỗng
    const emptyErrors = {
      phone: validateEmpty(phone, "số điện thoại"),
      name: validateEmpty(name, "họ và tên"),
      password: validateEmpty(password, "mật khẩu"),
      confirmPassword: validateEmpty(confirmPassword, "xác nhận mật khẩu"),
    };

    // Kiểm tra nếu có bất kỳ lỗi trống nào
    const hasEmptyErrors = Object.values(emptyErrors).some(
      (error) => error !== ""
    );

    if (hasEmptyErrors) {
      // Tìm lỗi đầu tiên để hiển thị
      for (const field in emptyErrors) {
        if (emptyErrors[field]) {
          message.error(emptyErrors[field]);
          return;
        }
      }
    }

    // Kiểm tra lỗi validate
    const phoneErr = validatePhone(phone);
    const nameErr = validateName(name);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (phoneErr) {
      message.error(phoneErr);
      return;
    }
    if (nameErr) {
      message.error(nameErr);
      return;
    }
    if (passwordErr) {
      message.error(passwordErr);
      return;
    }
    if (confirmPasswordErr) {
      message.error(confirmPasswordErr);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, name }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message || "Đăng ký thành công!");
        navigate("/login/user"); // Điều hướng đến trang đăng nhập
      } else {
        message.error(result.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    }
  };

  // CSS cho label và form
  const formItemLayout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  // CSS for required field label
  const requiredLabel = {
    color: "#333",
    fontSize: "14px",
    fontWeight: "normal",
    marginBottom: "8px",
    display: "block",
  };

  const requiredStar = {
    color: "red",
    marginLeft: "3px",
  };

  const inputStyle = {
    height: "40px",
    borderRadius: "8px",
    fontSize: "14px",
  };

  return (
    <div className="app">
      <main className="main-content">
        <div className="main-image">
          <img src={ImgLeft} alt="Interior" />
        </div>

        <div className="login-container login-container-right">
          <div className="logo login-logo">
            <Link to="/">
              <img
                src={logo}
                alt="House Clean Logo"
                className="logo-img login-logo-img"
              />
            </Link>
          </div>
          <div className="login-box">
            <h2>Đăng Ký</h2>

            <Form className="login-form" {...formItemLayout}>
              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Số điện thoại
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  name="phone"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Họ và tên
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  name="name"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Mật khẩu
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input.Password
                  style={inputStyle}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  name="password"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Nhập lại mật khẩu
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input.Password
                  style={inputStyle}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  name="confirmPassword"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  height: "40px",
                  marginTop: "16px",
                  marginBottom: "16px",
                }}
              >
                Đăng Ký
              </Button>
            </Form>

            <p className="signup-link">
              Đã có tài khoản? <Link to="/login/user">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterUser;
