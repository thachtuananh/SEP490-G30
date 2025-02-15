import React, { useState, useContext, useEffect } from 'react';
import { message } from 'antd';

import Footer from '../components/Footer';
import logo from '../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../assets/deep-cleaning-list-hero.jpg';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';
import { validatePhone, validatePassword } from "../utils/validate";

function Login() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN_START' });
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);

    if (phoneError || passwordError) {
      setErrorMessage(phoneError || passwordError);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: result });
        setErrorMessage(''); // Xóa lỗi khi đăng nhập thành công
        message.success(result.message || 'Đăng ký thành công!');
        navigate('/');
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.message || 'Đăng nhập thất bại' });
        setErrorMessage(result.message || 'Số điện thoại hoặc mật khẩu không đúng');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Lỗi máy chủ, vui lòng thử lại' });
      setErrorMessage('Lỗi máy chủ, vui lòng thử lại sau');
    }
  };

  // Tự động ẩn thông báo lỗi sau 3 giây
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="app">
      <main className="main-content">
        <div className="main-image">
          <img src={ImgLeft} alt="Interior" />
        </div>

        <div className="login-container login-container-right">
          <div className="logo login-logo">
            <Link to="/">
              <img src={logo} alt="House Clean Logo" className="logo-img login-logo-img" />
            </Link>
          </div>
          <div className="login-box">
            <h2>Đăng nhập</h2>

            {/* Container giữ không gian tránh bị co giãn */}
            <div className="error-message-container">
              <div className={`error-message ${errorMessage ? 'show' : ''}`}>
                {errorMessage}
              </div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}

                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                />
              </div>

              <div className="form-checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Lưu mật khẩu</label>
                <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="login-button">Đăng nhập</button>
            </form>

            <p className="signup-link">
              Chưa có tài khoản? <Link to="/register">Đăng kí ngay</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
