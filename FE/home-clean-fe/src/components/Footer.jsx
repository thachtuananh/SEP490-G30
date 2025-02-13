import React from 'react';
import '../index.css';
import logo from '../assets/HouseClean_logo.png';
import { Link } from 'react-router-dom';
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    
                    <div className="logo">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="House Clean Logo"
                            className="logo-img"
                        />
                    </Link>
                    </div>
                    
                    <h2 className="footer-title">House Clean</h2>
                    <p className="footer-description">
                        HouseCleaners Network Platform là một nền tảng trung gian kết nối giữa người thuê
                        dịch vụ dọn dẹp nhà (HouseOwner) và người cung cấp dịch vụ dọn dẹp nhà
                        (HouseCleaner). Nền tảng được thiết kế để giải quyết bài toán tìm kiếm và quản lý
                        công việc một cách hiệu quả, minh bạch và tiện lợi.
                    </p>
                    <p>Sản phẩm của nhóm</p>
                </div>

                <div className="footer-links">
                    <div className="footer-column">
                        <h3>Công ty</h3>
                        <ul>
                            <li><a href="#">Trang chủ</a></li>
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Tin tức</a></li>
                            <li><a href="#">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Dịch vụ</h3>
                        <ul>
                            <li><a href="#">Tất cả dịch vụ</a></li>
                            <li><a href="#">Theo dõi dịch vụ</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;