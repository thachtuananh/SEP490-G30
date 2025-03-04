import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from '../../../assets/HouseClean_logo.png';
import Notification from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css";

function Navbar() {
  const { user } = useContext(AuthContext); // Đảm bảo lấy đúng thông tin từ context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupNotification, setIsPopupNotification] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Lấy tên user từ localStorage nếu chưa có trong context
  const getUserName = () => {
    if (user && user.customerName) {
      return user.customerName;
    }
    const storedName = localStorage.getItem("name");
    return storedName ? storedName : '';
  };

  return (
    <div className="Container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img src={houseCleanLogo} alt="House Clean Logo" className="logo-img" />
          </Link>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
          <ul className="menu">
            <li><Link to="/about" className="nav-link">Giới thiệu</Link></li>
            <li><Link to="/activitylist" className="nav-link">Theo dõi dịch vụ</Link></li>
            <li><Link to="/" className="nav-link">Tin tức</Link></li>
            <li><Link to="/contact" className="nav-link">Liên hệ</Link></li>
            <li className={styles.nav_link_notification} onClick={() => setIsPopupNotification(true)}>
              Thông báo
            </li>

            <li className="mobile-login">
              {user ? (
                <Link to="/infomation" className="user-name">
                  {getUserName()} {/* Hiển thị tên customer */}
                </Link>
              ) : (
                <Link to="/login" className="login-btn">Đăng nhập</Link>
              )}
            </li>
          </ul>
        </div>

        <div className="desktop-login">
          {user ? (
            <Link to="/infomation" className="user-name">
              {getUserName()} {/* Hiển thị tên customer */}
            </Link>
          ) : (
            <Link to="/login" className="login-btn">Đăng nhập</Link>
          )}
        </div>
      </nav>

      {isPopupNotification && (
        <div className={styles.box_Notification}>
          <div className={styles.overlayContainer} onClick={() => setIsPopupNotification(false)}></div>
          <Notification />
        </div>
      )}
    </div>
  );
}

export default Navbar;
