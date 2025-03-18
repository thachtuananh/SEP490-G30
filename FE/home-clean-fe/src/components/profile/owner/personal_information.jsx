import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message } from "antd";

export const PersonaInformation = () => {
    const { user, dispatch } = useContext(AuthContext);

    // State cho từng trường thông tin
    const [customerName, setName] = useState(user?.customerName || "");
    const [customerPhone, setPhone] = useState(user?.customerPhone || "");
    // const [email, setEmail] = useState(user?.email || "");
    // const [gender, setGender] = useState(user?.gender || "");
    // const [dob, setDob] = useState(user?.dob || "");

    // Hàm xử lý lưu thông tin từng trường
    const handleSave = (field, value) => {
        const updatedData = { ...user, [field]: value };
        dispatch({ type: "UPDATE_USER", payload: updatedData });
        message.success(`${field} đã được cập nhật!`);
    };



    // Đảm bảo dữ liệu được cập nhật sau khi context thay đổi
    useEffect(() => {
        if (user) {
            setName(user.customerName || "");
            setPhone(user.customerPhone || "");
            // setEmail(user.email || "");
            // setGender(user.gender || "");
            // setDob(user.dob || "");
        }
    }, [user]); // Cập nhật khi user thay đổi

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
                    value={customerName}
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
                    value={customerPhone}
                    onChange={(e) => setPhone(e.target.value)}
                // onBlur={() => handleSave("phone", phone)}
                />
            </div>



            {/* Nút Lưu và Đăng xuất */}
            <div className="button-group">
                <button className="save-button" type="button" onClick={() => handleSave("name", customerName)}>
                    Lưu
                </button>

            </div>
        </div>
    );
};
