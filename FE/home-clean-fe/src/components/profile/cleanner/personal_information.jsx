import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message } from "antd";

export const PersonaInformation = () => {
    const { cleaner, dispatch } = useContext(AuthContext);


    const [cleanerName, setName] = useState(cleaner?.cleanerName || "");
    const [cleanerPhone, setPhone] = useState(cleaner?.cleanerPhone || "");
    const [cleanerEmail, setEmail] = useState(cleaner?.cleanerEmail || "");
    const [cleanerAge, setAge] = useState(cleaner?.cleanerAge || "");
    const [cleanerAddress, setAddress] = useState(cleaner?.cleanerAddress || "");
    const [cleanerIDnum, setIdentityNumber] = useState(cleaner?.cleanerIDnum || "");
    const [cleanerExp, setExperience] = useState(cleaner?.cleanerExp || "");
    const [cleanerImg, setImg] = useState(cleaner?.cleanerImg || "");

    // Hàm xử lý lưu thông tin từng trường
    const handleSave = (field, value) => {
        const updatedData = { ...cleaner, [field]: value };
        dispatch({ type: "UPDATE_USER", payload: updatedData });
        message.success(`${field} đã được cập nhật!`);

    };


    useEffect(() => {
        if (cleaner) {
            // Nếu có thông tin cleaner trong context, cập nhật các trường input
            setName(cleaner.cleanerName || "");
            setPhone(cleaner.cleanerPhone || "");
            setEmail(cleaner.cleanerEmail || "");
            setAge(cleaner.cleanerAge || "");
            setAddress(cleaner.cleanerAddress || "");
            setIdentityNumber(cleaner.cleanerIDnum || "");
            setExperience(cleaner.cleanerExp || "");
            if (cleaner.profile_image) {
                setImg(`data:image/png;base64,${cleaner.profile_image}`);
            } else {
                setImg(profileImg); // Ảnh mặc định nếu không có ảnh từ API
            }
        } else {
            // Nếu không có thông tin cleaner, reset các giá trị về mặc định
            setName("");
            setPhone("");
            setEmail("");
            setAge("");
            setAddress("");
            setIdentityNumber("");
            setExperience("");
            setImg(profileImg);
        }
    }, [cleaner]);

    return (
        <div className="persona-container">
            <div className="persona-header">
                <strong>Thông tin cá nhân</strong>
                <p className="persona-subtext">Quản lý thông tin cá nhân của tài khoản bạn</p>
            </div>

            <div className="avatar-section">
                <b>Ảnh đại diện</b>
                <img className="avatar-image" src={cleanerImg} alt="icon" />
                <b><u className="avatar-select">Chọn ảnh</u></b>
            </div>

            <div className="form-group">
                <b>Họ và tên</b>
                <input type="text" value={cleanerName} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
                <b>Số điện thoại</b>
                <input type="text" value={cleanerPhone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
                <b>Email</b>
                <input type="email" value={cleanerEmail} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
                <b>Tuổi</b>
                <input type="text" value={cleanerAge} onChange={(e) => setAge(e.target.value)} />
            </div>

            <div className="form-group">
                <b>Địa chỉ</b>
                <input type="text" value={cleanerAddress} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-group">
                <b>Số CCCD</b>
                <input type="text" value={cleanerIDnum} onChange={(e) => setIdentityNumber(e.target.value)} />
            </div>


            <div className="form-group">
                <b>Kinh nghiệm</b>
                <input type="text" value={cleanerExp} onChange={(e) => setExperience(e.target.value)} />
            </div>


            {/* Nút Lưu và Đăng xuất */}
            <div className="button-group">
                <button className="save-button" type="button" onClick={handleSave}>
                    Lưu
                </button>
            </div>
        </div>
    );
};
