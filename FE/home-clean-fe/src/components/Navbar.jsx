import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import houseCleanLogo from '../assets/HouseClean_logo.png';

function Navbar() {
  const { user } = useContext(AuthContext); // Lấy user từ AuthContext
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            <li><Link to="/" className="nav-link">Theo dõi dịch vụ</Link></li>
            <li><Link to="/" className="nav-link">Tin tức</Link></li>
            <li><Link to="/" className="nav-link">Liên hệ</Link></li>
            <li><Link to="/" className="nav-link">Thông báo</Link></li>

            <li className="mobile-login">
              {user ? (
                <Link to="/infomation" className="user-name">
                  Xin chào, {user.name || user.phone}!
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
              {user.name}
            </Link>
          ) : (
            <Link to="/login" className="login-btn">Đăng nhập</Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
