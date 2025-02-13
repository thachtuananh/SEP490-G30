import { Link } from "react-router-dom"

function Navbar() {
  return (
    <div className="Container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HouseClean_logo-hrG7QBW49ADjlEI47AgaKbmxcfpQcv.png"
              alt="House Clean Logo"
              className="logo-img"
            />
          </Link>
        </div>

        <ul className="menu">
          <li>
            <Link to="/" className="nav-link">
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link to="/" className="nav-link">
              Tất cả dịch vụ
            </Link>
          </li>
          <li>
            <Link to="/" className="nav-link">
              Theo dõi dịch vụ
            </Link>
          </li>
          <li>
            <Link to="/" className="nav-link">
              Tin tức
            </Link>
          </li>
          <li>
            <Link to="/" className="nav-link">
              Liên hệ
            </Link>
          </li>
        </ul>

        <Link to="/login" className="login-btn">
          Đăng nhập
        </Link>
      </nav>
    </div>
  )
}

export default Navbar