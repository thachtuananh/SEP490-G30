import React, { useState, useEffect } from 'react';
import { message } from "antd";
import Footer from '../../components/Home/Owner/Footer';
import logo from '../../assets/HouseClean_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import ImgLeft from '../../assets/image-left.png';
import { BASE_URL } from '../../utils/config';
import { validatePhone, validateName, validatePassword, validateConfirmPassword, validateEmail, validateAge, validateIdentityNumber } from "../../utils/validate";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

function RegisterCleaner() {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        confirmPassword: '',
        email: '',
        age: '',
        address: '',
        identity_number: '',
        experience: ''
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        const { phone, name, password, confirmPassword, email, age, address, identity_number, experience } = formData;

        console.log("👉 Dữ liệu form trước khi validate:", formData);

        // Validate all fields
        const newErrors = {
            phone: validatePhone(phone),
            name: validateName(name),
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(password, confirmPassword),
            email: validateEmail(email),
            age: validateAge(age),
            identity_number: validateIdentityNumber(identity_number)
        };

        if (!address.trim()) {
            newErrors.address = "Vui lòng nhập địa chỉ!";
        }

        if (!experience.trim()) {
            newErrors.experience = "Vui lòng nhập kinh nghiệm!";
        }

        console.log("🔍 Lỗi sau khi validate:", newErrors);

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== "")) {
            setErrorMessage("Vui lòng kiểm tra lại thông tin!");
            console.warn("⚠️ Có lỗi validate, dừng đăng ký.");
            return;
        }

        console.log("🚀 Dữ liệu gửi đi API:", {
            phone,
            password,
            name,
            email,
            age: parseInt(age),
            address,
            identity_number: parseInt(identity_number),
            experience
        });

        try {
            const response = await fetch(`${BASE_URL}/employee/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    password,
                    name,
                    email,
                    age: parseInt(age),
                    address,
                    identity_number: parseInt(identity_number),
                    experience
                })
            });

            console.log("📤 Phản hồi thô từ server:", response);

            const result = await response.json();
            console.log("📥 Phản hồi JSON từ server:", result);

            if (response.ok) {
                message.success(result.message || 'Đăng ký thành công!');
                console.log("✅ Đăng ký thành công.");
                navigate('/login');
            } else {
                message.error(result.message || 'Đăng ký thất bại!');
                // setErrorMessage(result.message || 'Đăng ký thất bại!');

            }
        } catch (error) {
            // console.error("🚫 Lỗi kết nối hoặc xử lý:", error);
            // setErrorMessage('Lỗi kết nối đến server!');
            message.error('Lỗi kết nối đến server!');
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
                        <h2>Đăng Ký Người Giúp Việc</h2>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={`form-group ${errors.password ? 'error' : ''}`}>
                                <label>Mật khẩu</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                    </span>
                                </div>
                            </div>

                            <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
                                <label>Nhập lại mật khẩu</label>
                                <div className="password-input-container">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                    </span>
                                </div>
                            </div>

                            <div className={`form-group ${errors.name ? 'error' : ''}`}>
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nhập họ và tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

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

                            <div className={`form-group ${errors.age ? 'error' : ''}`}>
                                <label>Tuổi</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Nhập tuổi"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* <div className={`form-group ${errors.address ? 'error' : ''}`}>
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Nhập địa chỉ"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div> */}

                            <div className={`form-group ${errors.identity_number ? 'error' : ''}`}>
                                <label>Số CMND/CCCD</label>
                                <input
                                    type="text"
                                    name="identity_number"
                                    placeholder="Nhập số CMND/CCCD"
                                    value={formData.identity_number}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={`form-group ${errors.experience ? 'error' : ''}`}>
                                <label>Kinh nghiệm</label>
                                <textarea
                                    name="experience"
                                    placeholder="Mô tả kinh nghiệm làm việc của bạn"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-textarea"
                                />
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

export default RegisterCleaner;