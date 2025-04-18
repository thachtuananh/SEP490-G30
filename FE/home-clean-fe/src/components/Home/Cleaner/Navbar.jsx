import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from '../../../assets/HouseClean_logo.png';
import Notification from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css";
import { message, Button, Dropdown, Avatar, Badge, Popover } from "antd";
import { UserOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";
import { getUnreadNotificationCount } from "../../../services/NotificationService";

function Navbar() {
    const { cleaner, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPopupNotification, setIsPopupNotification] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isLoading, setIsLoading] = useState(false);

    // Track screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch notification count when component mounts and when user changes
    useEffect(() => {
        const fetchNotificationCount = async () => {
            if (cleaner) {
                try {
                    setIsLoading(true);
                    const count = await getUnreadNotificationCount();
                    setNotificationCount(count);
                } catch (error) {
                    console.error("Failed to fetch notification count:", error);
                    message.error("Không thể tải số lượng thông báo. Vui lòng thử lại sau!");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setNotificationCount(0);
            }
        };

        fetchNotificationCount();

        // Set up polling to refresh notification count every minute
        const intervalId = setInterval(fetchNotificationCount, 60000);

        return () => clearInterval(intervalId);
    }, [cleaner]);

    // Close the menu when notification popup is opened on mobile
    useEffect(() => {
        if (isPopupNotification && isMobile && isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [isPopupNotification, isMobile, isMenuOpen]);

    const toggleMenu = () => {
        // Close notification popup when opening menu on mobile
        if (isMobile && isPopupNotification) {
            setIsPopupNotification(false);
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        message.success("Đăng xuất thành công!");
        navigate("/homeclean");
    };

    const toggleNotification = () => {
        setIsPopupNotification(!isPopupNotification);
        // Close menu when toggling notification on mobile
        if (isMobile && isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    // Refresh notifications manually
    const refreshNotifications = async () => {
        if (cleaner) {
            try {
                setIsLoading(true);
                const count = await getUnreadNotificationCount();
                setNotificationCount(count);
            } catch (error) {
                console.error("Failed to refresh notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Lấy tên user từ localStorage nếu chưa có trong context
    const getCleanerName = () => {
        if (cleaner && cleaner.name) {
            return cleaner.name;
        }
        const storedName = localStorage.getItem("name");
        return storedName ? storedName : '';
    };

    // Dropdown menu cho cleaner
    const cleanerMenu = {
        items: [
            {
                key: '1',
                label: <Link to="/infomationcleaner">Thông tin tài khoản</Link>,
                icon: <UserOutlined />
            },
            {
                key: '2',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                onClick: handleLogout
            }
        ]
    };

    // Notification icon với animation khi có thông báo mới
    const notificationIcon = (
        <Badge
            count={notificationCount}
            size="small"
            offset={[-2, 6]}
            className={styles.notification_badge}
        >
            <div
                className={styles.notification_icon_wrapper}
                onClick={isMobile ? toggleNotification : undefined}
            >
                <BellOutlined
                    className={`${styles.notification_icon} ${notificationCount > 0 ? styles.notification_active : ''}`}
                    style={{ fontSize: '20px' }}
                    spin={isLoading}
                />
            </div>
        </Badge>
    );

    // Mobile notification content
    const mobileNotificationContent = isPopupNotification && isMobile && cleaner ? (
        <div className={styles.mobile_notification_overlay} onClick={() => setIsPopupNotification(false)}>
            <div
                className={styles.mobile_notification_container}
                onClick={(e) => e.stopPropagation()}
            >
                <Notification
                    onClose={() => setIsPopupNotification(false)}
                    onViewAll={() => {
                        setIsPopupNotification(false);
                        // Navigate to full notification page if you have one
                        // navigate("/notifications");
                    }}
                />
            </div>
        </div>
    ) : null;

    // Notification popover component (for desktop)
    const notificationPopover = isMobile ? (
        cleaner ? notificationIcon : null
    ) : (
        cleaner ? (
            <Popover
                content={
                    <Notification
                        onClose={() => setIsPopupNotification(false)}
                        onViewAll={() => {
                            setIsPopupNotification(false);
                            // Navigate to full notification page if you have one
                            // navigate("/notifications");
                        }}
                    />
                }
                trigger="click"
                open={isPopupNotification}
                onOpenChange={(visible) => {
                    setIsPopupNotification(visible);
                    if (visible) {
                        // Refresh notification count when opening the popover
                        refreshNotifications();
                    }
                }}
                placement="bottomRight"
                overlayClassName={styles.notification_popover}
            >
                {notificationIcon}
            </Popover>
        ) : null
    );

    // User profile component
    const cleanerProfile = (
        <Dropdown menu={cleanerMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span>{getCleanerName()}</span>
            </div>
        </Dropdown>
    );
    // Login and Register buttons
    const authButtons = (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="login-btn" style={{ width: '110px' }}>Đăng nhập</Link>
            <Link to="/register" className="login-btn" style={{
                width: '110px',
                textAlign: 'center',
                background: 'white',
                border: '2px solid #00a651',
                color: 'black'
            }}>Đăng ký</Link>
        </div >
    );

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

                        {/* Only show these elements on mobile */}
                        <li className="mobile-login">
                            {isMobile && (
                                <>
                                    {cleaner && (
                                        <li className="mobile-notification">
                                            {notificationIcon}
                                        </li>
                                    )}
                                    {cleaner ? cleanerProfile : authButtons}
                                </>
                            )}
                        </li>
                    </ul>
                </div>

                {/* Only show these elements on desktop */}
                <div className="desktop-login">
                    {!isMobile && (
                        <>
                            {cleaner && (
                                <div className="desktop-notification" style={{ marginRight: '20px' }}>
                                    {notificationPopover}
                                </div>
                            )}
                            {cleaner ? cleanerProfile : authButtons}
                        </>
                    )}
                </div>
            </nav>

            {/* Render mobile notification panel outside navbar structure */}
            {mobileNotificationContent}
        </div>
    );
}

export default Navbar;
