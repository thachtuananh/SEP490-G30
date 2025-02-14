import React, { useState } from 'react';
import Footer from '../components/Footer';
import logo from '../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../assets/deep-cleaning-list-hero.jpg';

const API_URL = process.env.REACT_APP_API_URL;

function Register() {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, name, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/customer/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, password, name })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Đăng ký thành công!');
                navigate('/login');
            } else {
                const result = await response.json();
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
                            <img
                                src={logo}
                                alt="House Clean Logo"
                                className="logo-img login-logo-img"
                            />
                        </Link>
                    </div>
                    <div className="login-box">

                        <h2>Đăng Ký</h2>

                        {error && <p className="error-message">{error}</p>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nhập họ và tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
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
