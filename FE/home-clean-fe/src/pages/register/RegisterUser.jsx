import React, { useState, useEffect } from 'react';
import { message } from "antd";
import Footer from '../../components/Footer';
import logo from '../../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../../assets/image-left.png';
import { BASE_URL } from '../../utils/config';
import { validatePhone, validateName, validatePassword, validateConfirmPassword } from "../../utils/validate";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icon con mắt

function RegisterUser() {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Trạng thái hiển thị mật khẩu nhập lại

    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, name, password, confirmPassword } = formData;

        // Kiểm tra lỗi
        const phoneErr = validatePhone(phone);
        const nameErr = validateName(name);
        const passwordErr = validatePassword(password);
        const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);

        setPhoneError(phoneErr);
        setNameError(nameErr);
        setPasswordError(passwordErr);
        setConfirmPasswordError(confirmPasswordErr);

        if (phoneErr || nameErr || passwordErr || confirmPasswordErr) {
            setErrorMessage(phoneError || nameError || passwordError || confirmPasswordError);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/customer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, name })
            });

            const result = await response.json();

            if (response.ok) {
                message.success(result.message || 'Đăng ký thành công!');
                navigate('/login');
            } else {
                setErrorMessage(result.message || 'Đăng ký thất bại!');
            }
        } catch (error) {
            setErrorMessage('Lỗi kết nối đến server!');
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

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className={`form-group ${phoneError ? 'error' : ''}`}>
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={phoneError ? 'error' : ''}
                                />
                            </div>

                            <div className={`form-group ${nameError ? 'error' : ''}`}>
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nhập họ và tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={nameError ? 'error' : ''}
                                />
                            </div>

                            <div className={`form-group ${passwordError ? 'error' : ''}`}>
                                <label>Mật khẩu</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={passwordError ? 'error' : ''}
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                    </span>
                                </div>
                            </div>

                            <div className={`form-group ${confirmPasswordError ? 'error' : ''}`}>
                                <label>Nhập lại mật khẩu</label>
                                <div className="password-input-container">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={confirmPasswordError ? 'error' : ''}
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                    </span>
                                </div>
                            </div>

                            <div className="error-message-container">
                                <div className={`error-message ${errorMessage ? 'show' : ''}`}>
                                    {errorMessage}
                                </div>
                            </div>
                            <button type="submit" className="login-button">Đăng Ký</button>
                        </form>

                        <p className="signup-link">
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RegisterUser;
