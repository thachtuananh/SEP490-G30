import React, { useState, useEffect, useContext } from "react";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../utils/config";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";

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
    return `${startHour} : ${startMinute.toString().padStart(2, "0")}`;
};

// Component JobCard
const JobCard = ({ job }) => {
    // Xử lý hiển thị tên dịch vụ cho combo
    const getServiceName = () => {
        // Nếu đã có serviceName sẵn, sử dụng nó
        if (job.serviceName) {
            return job.serviceName;
        }

        // Nếu có services array, tạo tên dịch vụ từ đó
        if (job.services && job.services.length > 0) {
            return job.services.map(service => service.serviceName).join(", ");
        }

        // Fallback nếu không có thông tin
        return "Dịch vụ";
    };

    // Lấy giá từ totalPrice nếu có, nếu không thì dùng price
    const getPrice = () => {
        return job.totalPrice || job.price || 0;
    };

    return (
        <div className="job-card">
            <div className="job-header">
                <div className="job-title-status">
                    <span className="job-title">{getServiceName()}</span>
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
                    <span className="price">{getPrice()} VND</span>
                </div>
            </div>
        </div>
    );
};

function JobListFilter() {
    const { token, cleanerId } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // Nếu có dữ liệu từ JobCard, sử dụng nó
        if (location.state && location.state.jobs) {
            setJobs(location.state.jobs);
            setLoading(false);
            return;
        }

        // Nếu không có dữ liệu từ JobCard, gọi API để lấy tất cả các công việc
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${BASE_URL}/cleaner/jobs/${cleanerId}`, {
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
    }, [token, cleanerId, location.state]);

    const serviceTitle = location.state?.serviceTitle || "Tất cả công việc";

    return (
        <>
            <Navbar />
            <section className="job-list-section">
                <div className="container">
                    <div className="content">
                        <h2 className="section-title">{serviceTitle}</h2>
                        {/* <div className="filter-buttons">
                            <button className="filter-button">Lọc theo</button>
                            <button className="filter-button">Thời gian</button>
                            <button className="filter-button">Khoảng giá</button>
                            <button className="search-button">Tìm kiếm</button>
                        </div> */}
                        {!token && <p className="error-message">Bạn cần đăng nhập để xem danh sách công việc.</p>}
                        <div className="job-list">
                            {loading ? (
                                <p>Đang tải danh sách công việc...</p>
                            ) : error ? (
                                <p className="error-message">Lỗi: {error}</p>
                            ) : jobs.length > 0 ? (
                                jobs.map((job) => <JobCard key={job.jobId} job={job} />)
                            ) : (
                                <p>Không có công việc nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default JobListFilter;