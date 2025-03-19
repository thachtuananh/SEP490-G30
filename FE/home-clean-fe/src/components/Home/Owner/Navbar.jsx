import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from '../../../assets/HouseClean_logo.png';
import Notification from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css";
import { message, Button, Dropdown, Avatar, Badge, Popover } from "antd";
import { UserOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

function Navbar() {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupNotification, setIsPopupNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    navigate("/");
  };

  const toggleNotification = () => {
    setIsPopupNotification(!isPopupNotification);
    // Close menu when toggling notification on mobile
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Lấy tên user từ localStorage nếu chưa có trong context
  const getUserName = () => {
    if (user && user.customerName) {
      return user.customerName;
    }
    const storedName = localStorage.getItem("name");
    return storedName ? storedName : '';
  };

  // Dropdown menu cho user
  const userMenu = {
    items: [
      {
        key: '1',
        label: <Link to="/infomation">Thông tin tài khoản</Link>,
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
        />
      </div>
    </Badge>
  );

  // Mobile notification content
  const mobileNotificationContent = isPopupNotification && isMobile && user ? (
    <div className={styles.mobile_notification_overlay} onClick={() => setIsPopupNotification(false)}>
      <div
        className={styles.mobile_notification_container}
        onClick={(e) => e.stopPropagation()}
      >
        <Notification onClose={() => setIsPopupNotification(false)} />
      </div>
    </div>
  ) : null;

  // Notification popover component (for desktop)
  const notificationPopover = isMobile ? (
    user ? notificationIcon : null
  ) : (
    user ? (
      <Popover
        content={<Notification onClose={() => setIsPopupNotification(false)} />}
        trigger="click"
        open={isPopupNotification}
        onOpenChange={setIsPopupNotification}
        placement="bottomRight"
        overlayClassName={styles.notification_popover}
      >
        {notificationIcon}
      </Popover>
    ) : null
  );

  // User profile component
  const userProfile = (
    <Dropdown menu={userMenu} placement="bottomRight">
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
        <span>{getUserName()}</span>
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

            {/* Only show these elements on mobile */}
            <li className="mobile-login">
              {isMobile && (
                <>
                  {user && (
                    <li className="mobile-notification">
                      {notificationIcon}
                    </li>
                  )}
                  {user ? userProfile : authButtons}
                </>
              )}
            </li>
          </ul>
        </div>

        {/* Only show these elements on desktop */}
        <div className="desktop-login">
          {!isMobile && (
            <>
              {user && (
                <div className="desktop-notification" style={{ marginRight: '20px' }}>
                  {notificationPopover}
                </div>
              )}
              {user ? userProfile : authButtons}
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