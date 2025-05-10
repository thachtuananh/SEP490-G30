import React, { useState, useEffect } from "react";
import { Pagination, Alert } from "antd";
import styles from "../components/activityJob/JobList.module.css";
import TabSelector from "../components/activityJob/TabSelector";
import SearchBar from "../components/activityJob/SearchBar";
import JobCard from "../components/activityJob/JobCard";
import Navbar from "../components/Home/Cleaner/Navbar";
import Footer from "../components/Home/Cleaner/Footer";
import { BASE_URL } from "../utils/config";

const ActivityJob = () => {
  const [activeTab, setActiveTab] = useState("doing");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Show 5 jobs per page
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    fetchJobs(activeTab);
  }, [activeTab]);

  const fetchJobs = (tabType) => {
    setLoading(true);
    setError(null);
    setSearchActive(false);
    setSearchText("");

    const cleanerId = sessionStorage.getItem("cleanerId");
    const token = sessionStorage.getItem("token");

    if (!cleanerId || !token) {
      setError("Missing cleanerId or token. Please log in again.");
      setLoading(false);
      return;
    }

    // Determine endpoint based on active tab
    let endpoint = "";
    switch (tabType) {
      case "doing":
        endpoint = `${BASE_URL}/cleaner/${cleanerId}/jobs/doing`;
        break;
      case "done":
        endpoint = `${BASE_URL}/cleaner/${cleanerId}/jobs/done`;
        break;
      case "applied":
        endpoint = `${BASE_URL}/cleaner/${cleanerId}/jobs/applied`;
        break;
      case "booked":
        endpoint = `${BASE_URL}/cleaner/${cleanerId}/jobs`;
        break;
      default:
        endpoint = `${BASE_URL}/cleaner/${cleanerId}/jobs/doing`;
    }

    fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setFilteredJobs(data);
        setTotalJobs(data.length);
        setCurrentPage(1); // Reset to first page when tab changes
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
        setLoading(false);
      });
  };

  const refreshJobs = (switchToTab) => {
    if (switchToTab) {
      // If a tab is specified, switch to it
      setActiveTab(switchToTab);
      // The useEffect will trigger fetchJobs for the new tab
    } else {
      // Otherwise just refresh the current tab
      fetchJobs(activeTab);
    }
  };

  // Handle search by order code
  const handleSearch = (searchText) => {
    if (!searchText) {
      setFilteredJobs(jobs);
      setSearchActive(false);
      setSearchText("");
      setTotalJobs(jobs.length);
    } else {
      const results = jobs.filter(
        (job) =>
          job.orderCode &&
          job.orderCode.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJobs(results);
      setSearchActive(true);
      setSearchText(searchText);
      setTotalJobs(results.length);
    }
    setCurrentPage(1);
  };

  // Clear search results
  const handleClearSearch = () => {
    setFilteredJobs(jobs);
    setSearchActive(false);
    setSearchText("");
    setTotalJobs(jobs.length);
    setCurrentPage(1);
  };

  // Get dynamic header content based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "doing":
        return "Danh sách công việc đang làm";
      case "done":
        return "Danh sách công việc đã làm";
      case "applied":
        return "Danh sách công việc đã ứng tuyển";
      case "booked":
        return "Danh sách công việc đã được đặt";
      default:
        return "Danh sách công việc";
    }
  };

  const getHeaderSubtitle = () => {
    switch (activeTab) {
      case "doing":
        return "Xem những công việc mà bạn đang thực hiện";
      case "done":
        return "Xem những công việc mà bạn đã hoàn thành";
      case "applied":
        return "Xem những công việc mà bạn đã ứng tuyển";
      case "booked":
        return "Xem những công việc mà bạn đã được đặt";
      default:
        return "Xem những công việc mà bạn đã và đang làm";
    }
  };

  // Get empty state message based on active tab
  const getEmptyStateMessage = () => {
    if (searchActive) {
      return `Không tìm thấy đơn hàng nào với mã đơn hàng "${searchText}"`;
    }

    switch (activeTab) {
      case "doing":
        return "Không có công việc nào đang làm";
      case "done":
        return "Không có công việc nào đã hoàn thành";
      case "applied":
        return "Không có công việc nào đã ứng tuyển";
      case "booked":
        return "Không có công việc nào đã được đặt";
      default:
        return "Không có công việc nào";
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Calculate current jobs to display based on pagination
  const getCurrentJobs = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobs.slice(startIndex, endIndex);
  };

  // Custom styles for Ant Design pagination to match design
  const paginationStyle = {
    marginTop: "24px",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  };

  // Thông báo kết quả tìm kiếm được cải thiện
  const renderSearchNotification = () => {
    if (!searchActive) return null;

    if (filteredJobs.length === 0) {
      return (
        <div
          className={styles.searchNotification}
          style={{
            background: "#fff7e6",
            border: "1px solid #ffe7ba",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "#d46b08",
            justifyContent: "center",
          }}
        >
          <i
            className="ti ti-alert-circle"
            style={{ marginRight: "8px", fontSize: "16px" }}
          ></i>
          <span>
            Không tìm thấy đơn hàng nào với mã đơn hàng "
            <strong>{searchText}</strong>"
          </span>
        </div>
      );
    }

    return (
      <div
        className={styles.searchNotification}
        style={{
          background: "#e6f7ff",
          border: "1px solid #bae7ff",
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          fontSize: "14px",
          color: "#1890ff",
        }}
      >
        <i
          className="ti ti-search"
          style={{ marginRight: "8px", fontSize: "16px" }}
        ></i>
        <span>
          Tìm thấy <strong>{filteredJobs.length}</strong> kết quả cho mã đơn
          hàng "<strong>{searchText}</strong>"
        </span>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.containerbody}>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          <div className={styles.titleSection}>
            <h1 className={styles.title}>{getHeaderTitle()}</h1>
            <p className={styles.subtitle}>{getHeaderSubtitle()}</p>
          </div>

          <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Search Bar Component */}
          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

          {/* Hiển thị thông báo tìm kiếm được cải thiện */}
          {renderSearchNotification()}

          {loading && (
            <div className={styles.emptyState}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.emptyMessage}>Đang tải dữ liệu...</p>
            </div>
          )}

          {/* {!loading && error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="ti ti-clipboard-list"></i>
              </div>
              <p className={styles.emptyMessage}>{error}</p>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="ti ti-clipboard-list"></i>
              </div>
              <p className={styles.emptyMessage}>{getEmptyStateMessage()}</p>
            </div>
          )} */}

          {!loading && error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="ti ti-clipboard-list"></i>
              </div>
              <p className={styles.emptyMessage}>{getEmptyStateMessage()}</p>
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <>
              <div>
                {getCurrentJobs().map((job) => (
                  <JobCard
                    key={job.jobId}
                    job={job}
                    refreshJobs={refreshJobs}
                    isAppliedTab={activeTab === "applied"}
                  />
                ))}
              </div>

              <div style={paginationStyle}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalJobs}
                  onChange={handlePageChange}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ActivityJob;
