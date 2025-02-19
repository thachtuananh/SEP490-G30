import React from "react";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";

export const PersonaInformation = () => {
    return (
        <div className="persona-container">
            <div className="persona-header">
                <strong>Thông tin cá nhân</strong>
                <p className="persona-subtext">Quản lý thông tin cá nhân của tài khoản bạn</p>
            </div>

            <div className="avatar-section">
                <b>Ảnh đại diện</b>
                <img className="avatar-image" src={profileImg} alt="icon" />
                <b>
                    <u className="avatar-select">Chọn ảnh</u>
                </b>
            </div>

            <div className="form-group">
                <b className="input-label">Họ và tên</b>
                <input className="input-field" type="text" />
            </div>

            <div className="info-section">
                <b>Số điện thoại</b>
                <div className="info-text">
                    <p>0377648322</p>
                    <b>
                        <u className="info-change">Thay đổi</u>
                    </b>
                </div>
            </div>

            <div className="info-section">
                <b>Email</b>
                <div className="info-text">
                    <p>abcxyz@gmail.com</p>
                    <b>
                        <u className="info-change">Thay đổi</u>
                    </b>
                </div>
            </div>

            <div className="gender-section">
                <b>Giới tính</b>
                <div className="gender-options">
                    <label className="gender-option">
                        <input name="gender" type="radio" />
                        <p>Nam</p>
                    </label>
                    <label className="gender-option">
                        <input name="gender" type="radio" />
                        <p>Nữ</p>
                    </label>
                    <label className="gender-option">
                        <input name="gender" type="radio" />
                        <p>Khác</p>
                    </label>
                </div>
            </div>

            <div className="form-group">
                <b>Ngày sinh</b>
                <div className="dob-inputs">
                    <input type="number" id="day" className="dob-field" />
                    <input type="text" id="month" className="dob-field" />
                    <input type="number" id="year" className="dob-field" />
                </div>
            </div>

            <button className="save-button" type="submit">Lưu</button>
        </div>
    );
};
