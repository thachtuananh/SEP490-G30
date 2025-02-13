import React from 'react';
import '../index.css';
import Footer from '../components/Footer';
import logo from '../assets/HouseClean_logo.png';
import { Link } from 'react-router-dom';
import ImgLeft from '../assets/deep-cleaning-list-hero.jpg';

function Login() {
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

            <form className="login-form">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" placeholder="Nhập số điện thoại" />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" placeholder="Nhập mật khẩu" />
              </div>

              <div className="form-checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Lưu mật khẩu</label>
                <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="login-button">Đăng nhập</button>
            </form>

            {/* <div className="social-login">
              <p>Hoặc đăng nhập bằng</p>
              <div className="social-buttons">
                <button className="google-btn">
                  <img src="/google-icon.png" alt="Google" />
                  Google
                </button>
                <button className="facebook-btn">
                  <img src="/facebook-icon.png" alt="Facebook" />
                  Facebook
                </button>
              </div>
            </div> */}

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