import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import infoImg from "../../../assets/imgProfile/info.svg";
import addressImg from "../../../assets/imgProfile/address.svg";
import discountImg from "../../../assets/imgProfile/discount.svg";
import paymentImg from "../../../assets/imgProfile/payment.svg";
import favoriteImg from "../../../assets/imgProfile/favorite.svg";
import helpImg from "../../../assets/imgProfile/help.svg";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import "../owner/profile.css";

const MenuInfomation = ({ selectedMenu, setSelectedMenu }) => {
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng

  const handleClick = (menuName) => {
    setSelectedMenu(menuName);
  };

  return (
    <div className="menu-wrapper">
      <div className="menu-profile">
        <img className="profile-avatar" src={profileImg} alt="icon" />
        <div className="profile-details">
          <p className="profile-name"><strong>{user?.customerName || "Người dùng"}</strong></p>
          {/* <p className="profile-email">{user?.email || "Chưa có email"}</p> */}
        </div>
      </div>
      <hr className="menu-separator" />

      <div className="menu-options">
        {[
          { id: "1", label: "Thông tin cá nhân", icon: infoImg },
          { id: "2", label: "Địa chỉ", icon: addressImg },
          { id: "3", label: "Ưu đãi của tôi", icon: discountImg },
          { id: "4", label: "Quản lý thanh toán", icon: paymentImg },
          { id: "5", label: "Nhân viên yêu thích", icon: favoriteImg },
          { id: "6", label: "Trợ giúp", icon: helpImg },
        ].map((item) => (
          <div key={item.id} className="menu-item">
            <Link
              to="/infomation"
              className={`menu-link ${selectedMenu === item.id ? "menu-active" : ""}`}
              onClick={() => handleClick(item.id)}
            >
              <img className="menu-icon" src={item.icon} alt="icon" />
              <p className="menu-text">{item.label}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuInfomation;
