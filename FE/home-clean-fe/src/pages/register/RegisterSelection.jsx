import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../../assets/HouseClean_logo.png";
import ImgLeft from "../../assets/image-left.png";

function RegisterSelection() {
  const [selectedType, setSelectedType] = useState("normal");
  const navigate = useNavigate();

  const handleRegister = () => {
    if (selectedType === "normal") {
      navigate("/register/user");
    } else {
      navigate("/homeclean/register/cleaner");
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
            <h2>Đăng Ký Tài Khoản</h2>

            <div className="register-selection">
              <p className="selection-label">Chọn loại tài khoản:</p>
              <div className="selection-options">
                <label className="selection-option">
                  <input
                    type="radio"
                    name="accountType"
                    value="normal"
                    checked={selectedType === "normal"}
                    onChange={(e) => setSelectedType(e.target.value)}
                  />
                  <span className="option-text">Người sử dụng dịch vụ</span>
                </label>
                <label className="selection-option">
                  <input
                    type="radio"
                    name="accountType"
                    value="cleaner"
                    checked={selectedType === "cleaner"}
                    onChange={(e) => setSelectedType(e.target.value)}
                  />
                  <span className="option-text">Người dọn dẹp</span>
                </label>
              </div>
            </div>

            <button onClick={handleRegister} className="login-button">
              Tiếp tục
            </button>

            <p className="signup-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterSelection;
