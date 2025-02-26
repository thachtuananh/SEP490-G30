import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message } from "antd";

export const PersonaInformation = () => {
    const { user, dispatch } = useContext(AuthContext);  // Lấy user từ AuthContext
    const navigate = useNavigate(); // Hook điều hướng
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        gender: user?.gender || "",
        dob: user?.dob || "",
    });

    // Xử lý thay đổi dữ liệu khi người dùng nhập
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Xử lý khi nhấn nút Lưu
    const handleSave = () => {
        dispatch({ type: "UPDATE_USER", payload: formData });  // Cập nhật thông tin
        message.success("Cập nhật thông tin thành công!");
    };

    // Xử lý khi nhấn nút Đăng xuất
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });  // Đăng xuất
        message.success("Đăng xuất thành công!");
        navigate("/");
    };

    return (
        <div className="persona-container">
            <div className="persona-header">
                <strong>Thông tin cá nhân</strong>
                <p className="persona-subtext">Quản lý thông tin cá nhân của tài khoản bạn</p>
            </div>

            <div className="avatar-section">
                <b>Ảnh đại diện</b>
                <img className="avatar-image" src={profileImg} alt="icon" />
                <b><u className="avatar-select">Chọn ảnh</u></b>
            </div>

            <div className="form-group">
                <b className="input-label">Họ và tên</b>
                <input
                    className="input-field"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <b>Số điện thoại</b>
                <input
                    className="input-field"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <b>Email</b>
                <input
                    className="input-field"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="gender-section">
                <b>Giới tính</b>
                <div className="gender-options">
                    {["Nam", "Nữ", "Khác"].map((option) => (
                        <label key={option} className="gender-option">
                            <input
                                type="radio"
                                name="gender"
                                value={option}
                                checked={formData.gender === option}
                                onChange={handleChange}
                            />
                            <p>{option}</p>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <b>Ngày sinh</b>
                <input
                    className="input-field"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                />
            </div>

            {/* Nút Lưu và Đăng xuất */}
            <div className="button-group">
                <button className="save-button" type="button" onClick={handleSave}>
                    Lưu
                </button>
                <button className="save-button logout-button" type="button" onClick={handleLogout}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};
