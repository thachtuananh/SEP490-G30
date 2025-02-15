import React, { useState, useEffect } from 'react';
import { message } from "antd";
import Footer from '../components/Footer';
import logo from '../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../assets/deep-cleaning-list-hero.jpg';
import { BASE_URL } from '../utils/config';
import { validatePhone, validateName, validatePassword, validateConfirmPassword } from "../utils/validate";

function Register() {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, name, password, confirmPassword } = formData;

        const phoneError = validatePhone(phone);
        const nameError = validateName(name);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

        if (phoneError || nameError || passwordError || confirmPasswordError) {
            setError(phoneError || nameError || passwordError || confirmPasswordError);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/customer/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, password, name })
            });

            const result = await response.json();

            if (response.ok) {
                message.success(result.message || 'Đăng ký thành công!');
                navigate('/login');
            } else {
                setError(result.message || 'Đăng ký thất bại!');
            }
        } catch (error) {
            setError('Lỗi kết nối đến server!');
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
                            <img src={logo} alt="House Clean Logo" className="logo-img login-logo-img" />
                        </Link>
                    </div>
                    <div className="login-box">
                        <h2>Đăng Ký</h2>

                        <div className="error-message-container">
                            <div className={`error-message ${error ? 'show' : ''}`}>
                                {error}
                            </div>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="tel" name="phone" placeholder="Nhập số điện thoại"
                                    value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" name="name" placeholder="Nhập họ và tên"
                                    value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input type="password" name="password" placeholder="Nhập mật khẩu"
                                    value={formData.password} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu</label>
                                <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword} onChange={handleChange} required />
                            </div>

                            <button type="submit" className="login-button">Đăng Ký</button>
                        </form>

                        <p className="signup-link">
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Register;
