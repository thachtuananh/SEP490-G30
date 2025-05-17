import React, { useState, useEffect } from "react";
import { message, Input, Form, Button, Modal } from "antd";
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
  validateEmail,
} from "../../utils/validate";

function RegisterUser() {
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registrationData, setRegistrationData] = useState(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  // Step 1: Submit registration info and send OTP
  const handleSubmit = async () => {
    const { phone, name, email, password, confirmPassword } = formData;

    // Kiểm tra trường rỗng
    const emptyErrors = {
      phone: validateEmpty(phone, "số điện thoại"),
      name: validateEmpty(name, "họ và tên"),
      email: validateEmpty(email, "email"),
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
    const emailErr = validateEmail(email);
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
    if (emailErr) {
      message.error(emailErr);
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

    // Store the registration data for later submission
    setRegistrationData({
      phone,
      name,
      email,
      password,
    });

    // Send OTP to the phone number
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/customer/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Mã OTP đã được gửi đến số điện thoại của bạn!");
        setOtpModalVisible(true);
      } else {
        message.error(
          result.message || "Không thể gửi mã OTP. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi gửi OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim() === "") {
      message.error("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/customer/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: registrationData.phone,
          otpCode: otpCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // message.success("Xác thực OTP thành công!");
        await registerUser();
      } else {
        message.error(
          result.message || "Mã OTP không chính xác. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi xác thực OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Submit registration after OTP verification
  const registerUser = async () => {
    try {
      setIsLoading(true);
      const { phone, name, email, password } = registrationData;

      const response = await fetch(`${BASE_URL}/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, name, email }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message || "Đăng ký thành công!");
        setOtpModalVisible(false);
        navigate("/login/user"); // Điều hướng đến trang đăng nhập
      } else {
        message.error(result.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi đăng ký!");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP if needed
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/customer/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: registrationData.phone }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Mã OTP mới đã được gửi đến số điện thoại của bạn!");
      } else {
        message.error(
          result.message || "Không thể gửi lại mã OTP. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi gửi lại OTP!");
    } finally {
      setIsLoading(false);
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
                    Email
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  name="email"
                  type="email"
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
                onClick={() => {
                  setOtpCode("");
                  handleSubmit();
                }}
                loading={isLoading}
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

      {/* OTP Verification Modal */}
      <Modal
        title="Xác thực OTP"
        visible={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setOtpModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="resend"
            onClick={() => {
              // Reset input OTP ngay trong Modal khi click nút gửi lại
              setOtpCode("");
              // Sau đó gọi hàm xử lý gửi lại OTP
              handleResendOtp();
            }}
            disabled={isLoading}
          >
            Gửi lại OTP
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={isLoading}
            onClick={handleVerifyOtp}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <p>Mã OTP đã được gửi đến số điện thoại {registrationData?.phone}.</p>
        <p>Vui lòng nhập mã OTP:</p>
        <Input
          placeholder="Nhập mã OTP"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          style={{ marginTop: "10px" }}
        />
      </Modal>
    </div>
  );
}

export default RegisterUser;
