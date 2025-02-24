import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message } from "antd";

export const PersonaInformation = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    // State cho từng trường thông tin
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [email, setEmail] = useState(user?.email || "");
    const [gender, setGender] = useState(user?.gender || "");
    const [dob, setDob] = useState(user?.dob || "");

    // Hàm xử lý lưu thông tin từng trường
    const handleSave = (field, value) => {
        const updatedData = { ...user, [field]: value };
        dispatch({ type: "UPDATE_USER", payload: updatedData });
        message.success(`${field} đã được cập nhật!`);
    };

    // Đăng xuất
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleSave("name", name)}
                />
            </div>

            <div className="form-group">
                <b>Số điện thoại</b>
                <input
                    className="input-field"
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => handleSave("phone", phone)}
                />
            </div>

            <div className="form-group">
                <b>Email</b>
                <input
                    className="input-field"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleSave("email", email)}
                />
            </div>

            {/* <div className="gender-section">
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
            </div> */}
            <div className="gender-section">
                <b>Giới tính</b>
                <div className="gender-options">
                    {["Nam", "Nữ", "Khác"].map((option) => (
                        <label key={option} className={`gender-option ${gender === option ? 'checked' : ''}`}>
                            <input
                                type="radio"
                                name="gender"
                                value={option}
                                checked={gender === option}
                                onChange={(e) => setGender(e.target.value)}
                                onBlur={() => handleSave("gender", option)}
                            />
                            {option}
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
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onBlur={() => handleSave("dob", dob)}
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
