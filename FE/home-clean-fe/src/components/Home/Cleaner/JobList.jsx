import React from 'react';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';


function JobCard({ type, status, date, time, location, price }) {
    return (
        <div className="job-card">
            <div className="job-header">
                <div className="job-title-status">
                    <span className="job-title">{type}</span>
                    <span className="job-status">{status}</span>
                </div>
                <button className="detail-button">
                    <Link className="link-view-details" to="/workdetails">
                        Xem chi tiết
                    </Link>
                </button>
            </div>

            <div className="job-info">
                <div className="info-row">
                    <FaCalendarAlt className="icon" />
                    <span>{date}</span>
                </div>
                <div className="info-row">
                    <FaClock className="icon" />
                    <span>{time}</span>
                </div>
                <div className="location-price">
                    <div className="location-tag">
                        <FaMapMarkerAlt className="icon" />
                        <span>{location}</span>
                        <span className="user-tag">Khánh Trần</span>
                    </div>
                    <span className="price">{price} VND</span>
                </div>
            </div>
        </div>
    );
}

function JobList() {
    const jobs = [
        {
            type: "Dọn phòng ngủ",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn phòng khách",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn bếp",
            status: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "350.000"
        },
        {
            type: "Dọn phòng ngủ",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn phòng khách",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn bếp",
            status: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "350.000"
        },
        {
            type: "Dọn phòng ngủ",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn phòng khách",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn bếp",
            status: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "350.000"
        },
        {
            type: "Dọn phòng ngủ",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn phòng khách",
            status: "Vừa xong",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "900.000"
        },
        {
            type: "Dọn bếp",
            status: "2 tuần trước",
            date: "Ngày 16 - Tháng 2 - Năm 2025",
            time: "3 giờ - Từ 13:00 đến 16:00",
            location: "Hà Nội",
            price: "350.000"
        }
    ];

    return (
        <section className="job-list-section">
            <div className="container">
                <div className="content">
                    <div className="filter-buttons">
                        <button className="filter-button">Lọc theo</button>
                        <button className="filter-button">Thời gian</button>
                        <button className="filter-button">Khoảng cách</button>
                        <button className="filter-button">Khoảng giá</button>
                        <button className="search-button">Tìm kiếm</button>
                    </div>

                    <div className="job-list">
                        {jobs.map((job, index) => (
                            <JobCard key={index} {...job} />
                        ))}
                    </div>

                    <div className="pagination">
                        <button className="page-button active">1</button>
                        <button className="page-button">2</button>
                        <span className="page-dots">...</span>
                        <button className="page-button">9</button>
                        <button className="page-button">10</button>
                        <button className="page-button">→</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default JobList;