import React, { useState, useContext, useEffect, useCallback } from "react";
import { message } from "antd";

import logo from "../../assets/HouseClean_logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImgLeft from "../../assets/image-left.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import { validatePhone, validatePassword } from "../../utils/validate";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import icon con mắt

function Login() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateForm = useCallback(() => {
    let isValid = true;
    if (!phone.trim()) {
      setPhoneError(true);
      isValid = false;
    } else {
      setPhoneError(false);
    }

    if (!password.trim()) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    return isValid;
  }, [phone, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      message.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      const response = await fetch(`${BASE_URL}/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();
      console.log("Result Login", result);
      if (response.ok) {
        const { token, customerId, name, role, phone } = result;

        sessionStorage.setItem("name", name);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("customerId", customerId);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("phone", phone);

        dispatch({
          type: "LOGIN_SUCCESS_CUSTOMER",
          payload: { name, token, customerId, phone },
        });

        message.success("Đăng nhập thành công!");
        navigate("/"); // Điều hướng đến trang Home của Customer
      } else {
        message.error(result.message || "Đăng nhập thất bại.");
        // message.error("Đăng nhập thất bại.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
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
            <h2>Đăng nhập</h2>

            <form className="login-form" onSubmit={handleLogin}>
              <div className={`form-group ${phoneError ? "error" : ""}`}>
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError(false);
                  }}
                  className={phoneError ? "error" : ""}
                />
              </div>

              <div className={`form-group ${passwordError ? "error" : ""}`}>
                <label>Mật khẩu</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    className={passwordError ? "error" : ""}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                  </span>
                </div>
              </div>

              <div className="form-checkbox">
                <Link to="/forgot-password/user" className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="login-button">
                Đăng nhập
              </button>
            </form>

            <p className="signup-link">
              Chưa có tài khoản? <Link to="/register/user">Đăng kí ngay</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
