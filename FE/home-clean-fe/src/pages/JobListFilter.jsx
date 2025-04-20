import React, { useState, useEffect, useContext } from "react";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { Card, Typography, Button, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../utils/config";
import { SearchOutlined } from "@ant-design/icons";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";

const { Title, Text } = Typography;

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
      return job.services.map((service) => service.serviceName).join(", ");
    }

    // Fallback nếu không có thông tin
    return "Dịch vụ";
  };

  // Lấy giá từ totalPrice nếu có, nếu không thì dùng price
  const getPrice = () => {
    return job.totalPrice || job.price || 0;
  };
  // Hàm format khoảng cách
  const formatDistance = (distance) => {
    return `Khoảng cách: ${Math.round(distance)} m`;
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      styles={{
        body: {
          padding: "16px",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Text strong style={{ fontSize: "16px", color: "#039855" }}>
          {job.serviceName}
        </Text>
        <Button
          type="primary"
          style={{
            backgroundColor: "#039855",
            borderColor: "#039855",
            borderRadius: "4px",
          }}
        >
          <Link to={`/workdetail/${job.jobId}`} style={{ color: "#fff" }}>
            Xem chi tiết
          </Link>
        </Button>
      </div>

      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaCalendarAlt style={{ marginRight: "8px", color: "#039855" }} />
          <Text>{formatDate(job.scheduledTime)}</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaClock style={{ marginRight: "8px", color: "#039855" }} />
          <Text>{formatTime(job.scheduledTime)}</Text>
        </div>
        {/* <div style={{ display: "flex", alignItems: "center" }}>
          <SearchOutlined style={{ marginRight: "8px", color: "#039855" }} />
          <Text>{formatDistance(job.distance)}</Text>
        </div> */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Text strong style={{ fontSize: "16px", color: "#039855" }}>
            {job.totalPrice} VND
          </Text>
        </div>
      </Space>
    </Card>
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
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách công việc.");
        }
        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
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
            {!token && (
              <p className="error-message">
                Bạn cần đăng nhập để xem danh sách công việc.
              </p>
            )}
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
