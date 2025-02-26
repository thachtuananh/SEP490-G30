import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from '../../../assets/HouseClean_logo.png';
import { Notification } from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css"


function Navbar() {
    const { user } = useContext(AuthContext); // Lấy user từ AuthContext
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [isPopupNotification, setIsPopupNotification] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                document.body.style.overflow = isPopupNotification ? "hidden" : "auto";
            } else {
                document.body.style.overflow = "auto";
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") setIsPopupNotification(false);
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("keydown", handleEscape);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [isPopupNotification]);
    return (
        <div className="Container">
            <nav className="navbar">
                <div className="logo">
                    <Link to="/homecleaner">
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
                        <li><Link to="/" className="nav-link">Việc Làm</Link></li>
                        <li><Link to="/" className="nav-link">Hồ sơ của bản</Link></li>
                        <li><Link to="/" className="nav-link">Tin tức</Link></li>
                        <li><Link to="/" className="nav-link">Thu nhập</Link></li>
                        <li className={styles.nav_link_notification}
                            onClick={() => setIsPopupNotification(true)}
                        >
                            Thông báo
                        </li>

                        <li className="mobile-login">
                            {user ? (
                                <Link to="/infomationcleaner" className="user-name">
                                    {user.name}
                                </Link>
                            ) : (
                                <Link to="/login" className="login-btn">Đăng nhập</Link>
                            )}
                        </li>
                    </ul>
                </div>

                <div className="desktop-login">
                    {user ? (
                        <Link to="/infomationcleaner" className="user-name">
                            {user.name}
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
