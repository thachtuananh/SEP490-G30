import React, { useState, useEffect, useContext } from "react";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext"; // Import AuthContext

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
                    </div>
                    <span className="price">{price} VND</span>
                </div>
            </div>
        </div>
    );
}

function JobList() {
    const { token } = useContext(AuthContext); // Lấy token từ AuthContext
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
                    <div className="job-list">
                        {jobs.length > 0 ? (
                            jobs.map((job, index) => <JobCard key={index} {...job} />)
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
