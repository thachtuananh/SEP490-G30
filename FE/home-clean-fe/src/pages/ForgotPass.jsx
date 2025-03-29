import React, { useState, useEffect } from 'react';
import '../index.css';
import Footer from '../components/Home/Owner/Footer';
import logo from '../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../assets/image-left.png';

function ForgotPassword() {
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
    });

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

                        <form className="login-form">
                            <div className={`form-group ${errors.email ? 'error' : ''}`}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Nhập email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* <div className="form-group form-group-otp">
                                <label>Mã xác nhận</label>
                                <div className="otp-input">
                                    <button type="submit" className="otp-button">Lấy mã</button>
                                </div>
                            </div> */}

                            <div className="error-message-container">
                                <div className={`error-message ${errorMessage ? 'show' : ''}`}>
                                    {errorMessage}
                                </div>
                            </div>
                            <button type="submit" className="login-button">Quên mật khẩu</button>
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

export default ForgotPassword;