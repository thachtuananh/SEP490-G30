import React, { useState } from "react";
import axios from "axios";
import logo from "../../../assets/HouseClean_logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImgLeft from "../../../assets/image-left.png";
import "../../../index.css";
import { validateEmail } from "../../../utils/validate";
import { BASE_URL } from "../../../utils/config";
import { message } from "antd";

function ForgotPassword() {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Use the validateEmail function from utilities
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/customer/forgot-password`,
        { email: formData.email },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      message.success(
        "Email khôi phục mật khẩu đã được gửi. Bạn sẽ được chuyển hướng đến trang đăng nhập."
      );

      // Chuyển hướng sau khi thông báo thành công
      setTimeout(() => {
        navigate("/login/user");
      }, 2000);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể gửi yêu cầu khôi phục mật khẩu"
      );
    } finally {
      setIsLoading(false);
    }
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
            <h2>Quên Mật Khẩu</h2>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className={`form-group ${errors.email ? "error" : ""}`}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>
            </form>

            {/* <p className="signup-link">
              Chưa có tài khoản? <Link to="/register/user">Đăng kí ngay</Link>
            </p>
            <p className="signup-link">
              Đã có tài khoản? <Link to="/login/user">Đăng nhập ngay</Link>
            </p> */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
