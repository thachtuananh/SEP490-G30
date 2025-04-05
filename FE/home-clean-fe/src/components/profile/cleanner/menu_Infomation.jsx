import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import infoImg from "../../../assets/imgProfile/info.svg";
import addressImg from "../../../assets/imgProfile/address.svg";
import discountImg from "../../../assets/imgProfile/discount.svg";
import paymentImg from "../../../assets/imgProfile/payment.svg";
import helpImg from "../../../assets/imgProfile/help.svg";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import "../owner/profile.css";

const MenuInfomation = ({ selectedMenu, setSelectedMenu }) => {
  const { cleaner } = useContext(AuthContext); // Lấy thông tin người dùng
  const [cleanerImg, setImg] = useState(cleaner?.cleanerImg || "");

  const handleClick = (menuName) => {
    setSelectedMenu(menuName);
  };
  useEffect(() => {
    if (cleaner) {
      if (cleaner.profile_image) {
        setImg(`data:image/png;base64,${cleaner.profile_image}`);
      } else {
        setImg(profileImg); // Ảnh mặc định nếu không có ảnh từ API
      }
    } else {
      setImg(profileImg);
    }
  }, [cleaner]);
  return (
    <div className="menu-wrapper">
      <div className="menu-profile">
        <img className="profile-avatar" src={cleanerImg} alt="icon" />
        <div className="profile-details">
          <p className="profile-name">
            <strong>{cleaner?.cleanerName || "Người dùng"}</strong>
          </p>
          <p className="profile-email">
            {cleaner?.cleanerEmail || "Chưa có email"}
          </p>
        </div>
      </div>
      <hr className="menu-separator" />

      <div className="menu-options">
        {[
          { id: "1", label: "Thông tin cá nhân", icon: infoImg },
          { id: "2", label: "Địa chỉ", icon: addressImg },
          { id: "3", label: "Quản lý ví", icon: paymentImg },
          { id: "4", label: "Ưu đãi của tôi", icon: discountImg },
          { id: "5", label: "Trợ giúp", icon: helpImg },
        ].map((item) => (
          <div key={item.id} className="menu-item">
            <Link
              to="/homeclean/infomationcleaner"
              className={`menu-link ${
                selectedMenu === item.id ? "menu-active" : ""
              }`}
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
