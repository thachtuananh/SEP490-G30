import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import houseCleanLogo from '../assets/HouseClean_logo.png';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <div className="Container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img
              src={houseCleanLogo}
              alt="House Clean Logo"
              className="logo-img"
            />
          </Link>
        </div>

        <ul className="menu">
          <li><Link to="/" className="nav-link">Giới thiệu</Link></li>
          <li><Link to="/" className="nav-link">Tất cả dịch vụ</Link></li>
          <li><Link to="/" className="nav-link">Theo dõi dịch vụ</Link></li>
          <li><Link to="/" className="nav-link">Tin tức</Link></li>
          <li><Link to="/" className="nav-link">Liên hệ</Link></li>
        </ul>

        <div className="user-section">
          {/* {user && <span className="username">Xin chào, {user.name}!</span>} */}
          <Link to="/login" className="login-btn">Đăng nhập</Link>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
