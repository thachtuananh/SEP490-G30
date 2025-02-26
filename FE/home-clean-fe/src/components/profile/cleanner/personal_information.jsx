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
    const [age, setAge] = useState(user?.age || "");
    const [address, setAddress] = useState(user?.address || "");
    const [identitynum, setIdentityNum] = useState(user?.identitynumbe || "");
    const [experience, setExperience] = useState(user?.experience || "");


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
                <b>Họ và tên</b>
                <input
                    className="input-field"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                // onBlur={() => handleSave("name", name)}
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
                // onBlur={() => handleSave("phone", phone)}
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

            <div className="form-group">
                <b>Tuổi</b>
                <input
                    className="input-field"
                    type="text"
                    name="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
            </div>

            <div className="form-group">
                <b>Địa chỉ</b>
                <input
                    className="input-field"
                    type="text"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <div className="form-group">
                <b>Số CCCD</b>
                <input
                    className="input-field"
                    type="text"
                    name="identityNum"
                    value={identitynum}
                    onChange={(e) => setIdentityNum(e.target.value)}
                />
            </div>

            <div className="form-group">
                <b>Kinh nghiệm</b>
                <input
                    className="input-field"
                    type="text"
                    name="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
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
