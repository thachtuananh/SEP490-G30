import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from '../../../assets/HouseClean_logo.png';
import Notification from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css";

function Navbar() {
    const { cleaner } = useContext(AuthContext); // Lấy thông tin từ context (user)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPopupNotification, setIsPopupNotification] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Lấy tên của cleaner từ user trong AuthContext hoặc localStorage nếu không có trong context
    const getCleanerName = () => {
        if (cleaner && cleaner.name) {
            return cleaner.name;
        }
        const storedName = localStorage.getItem("name");
        return storedName ? storedName : '';

    };

    return (
        <div className="Container">
            <nav className="navbar">
                <div className="logo">
                    <Link to="/homeclean">
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
                        {/* <li><Link to="/homeclean" className="nav-link"></Link></li> */}
                        <li><Link to="/activityjob" className="nav-link">Công việc </Link></li>
                        <li><Link to="/homeclean" className="nav-link">Tin tức</Link></li>
                        <li><Link to="/homeclean" className="nav-link">Bảng giá dịch vụ</Link></li>
                        <li className={styles.nav_link_notification}
                            onClick={() => setIsPopupNotification(true)}
                        >
                            Thông báo
                        </li>

                        <li className="mobile-login">
                            {cleaner ? (
                                <Link to="/infomationcleaner" className="user-name">
                                    {getCleanerName()} {/* Hiển thị tên của cleaner */}
                                </Link>
                            ) : (
                                <Link to="/login" className="login-btn">Đăng nhập</Link>
                            )}
                        </li>
                    </ul>
                </div>

                <div className="desktop-login">
                    {cleaner ? (
                        <Link to="/infomationcleaner" className="user-name">
                            {getCleanerName()} {/* Hiển thị tên của cleaner */}
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
