import React, { useState, useEffect, useContext } from "react";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext"; // Import AuthContext

// Hàm format ngày theo yêu cầu
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `Ngày ${day} - Tháng ${month} - Năm ${year}`;
};

// Hàm format giờ theo yêu cầu
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const startHour = date.getHours();
    const startMinute = date.getMinutes();
    const endHour = startHour + 3; // Giả sử công việc kéo dài 3 giờ

    return `${endHour - startHour} giờ - Từ ${startHour}:${startMinute.toString().padStart(2, "0")} đến ${endHour}:${startMinute.toString().padStart(2, "0")}`;
};

// Component JobCard
const JobCard = ({ job }) => {
    return (
        <div className="job-card">
            <div className="job-header">
                <div className="job-title-status">
                    <span className="job-title">{job.serviceName}</span>
                </div>
                <button className="detail-button">
                    <Link className="link-view-details" to={`/workdetail/${job.jobId}`}>
                        Xem chi tiết
                    </Link>
                </button>
            </div>

            <div className="job-info">
                <div className="info-row">
                    <FaCalendarAlt className="icon" />
                    <span>{formatDate(job.scheduledTime)}</span>
                </div>
                <div className="info-row">
                    <FaClock className="icon" />
                    <span>{formatTime(job.scheduledTime)}</span>
                </div>
                <div className="location-price">
                    <span className="price">{job.price} VND</span>
                </div>
            </div>
        </div>
    );
};

function JobList() {
    const { token } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch("http://localhost:8080/api/cleaner/jobs", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể lấy danh sách công việc.");
                }
                return response.json();
            })
            .then(data => {
                setJobs(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi lấy danh sách công việc:", error);
                setError(error.message);
                setLoading(false);
            });
    }, [token]);

    if (!token) {
        return <p className="error-message">Bạn cần đăng nhập để xem danh sách công việc.</p>;
    }

    if (loading) {
        return <p>Đang tải danh sách công việc...</p>;
    }

    if (error) {
        return <p className="error-message">Lỗi: {error}</p>;
    }

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
                        {jobs.length > 0 ? (
                            jobs.map((job) => <JobCard key={job.jobId} job={job} />)
                        ) : (
                            <p>Không có công việc nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default JobList;
