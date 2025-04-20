import React from "react";
import { ReactComponent as Phone } from "../assets/phone.svg";
import { ReactComponent as Location } from "../assets/location.svg";
import { ReactComponent as Mail } from "../assets/mail.svg";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";
import "../styles/contact.css";
function Contact() {
  return (
    <>
      <Navbar />
      <div className="contact-container">
        <div className="contact-form-section">
          <div className="section-header">
            <h2 className="section-title">Liên hệ với chúng tôi</h2>
            <p className="section-description">
              Hãy điền thông tin vào form dưới đây, Houseclean sẽ liên hệ với
              bạn trong thời gian sớm nhất!
            </p>
          </div>

          <form className="contact-form">
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung</label>
              <textarea className="form-textarea" placeholder="Nhập nội dung" />
            </div>

            <button type="submit" className="submit-button">
              Liên hệ
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="section-header">
            <h2 className="section-title">Thông tin liên hệ</h2>
            <p className="section-description">
              Đội ngũ hỗ trợ của Houseclean luôn túc trực.
            </p>
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <Location />
              </div>
              <p className="info-text-contact">
                Khu Giáo dục và Đào tạo Khu Công nghệ cao Hòa Lạc Km29, Đại lộ
                Thăng Long, Thạch Hoà, Thạch Thất, Hà Nội.
              </p>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail />
              </div>
              <p className="info-text-contact">Houseclean.support@gmail.com</p>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone />
              </div>
              <p className="info-text-contact">+84 12345678</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
