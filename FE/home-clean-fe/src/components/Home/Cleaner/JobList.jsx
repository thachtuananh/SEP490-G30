import React, { useState, useEffect, useContext } from "react";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../Cleaner/home.css";
import { AuthContext } from "../../../context/AuthContext"; // Import AuthContext
import { BASE_URL } from "../../../utils/config";
import {
  Card,
  List,
  Typography,
  Button,
  Space,
  Empty,
  Spin,
  Row,
  Col,
  DatePicker,
  TimePicker,
  InputNumber,
  Form,
  Divider,
  Result,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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

  // return `${endHour - startHour} giờ - Từ ${startHour}:${startMinute.toString().padStart(2, "0")} đến ${endHour}:${startMinute.toString().padStart(2, "0")}`;
  return `${startHour} : ${startMinute.toString().padStart(2, "0")}`;
};

// Hàm format khoảng cách
const formatDistance = (distance) => {
  return `Khoảng cách: ${Math.round(distance)} m`;
};

// Component JobCard
const JobCard = ({ job }) => {
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <SearchOutlined style={{ marginRight: "8px", color: "#039855" }} />
          <Text>{formatDistance(job.distance)}</Text>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Text strong style={{ fontSize: "16px", color: "#039855" }}>
            {job.price} VND
          </Text>
        </div>
      </Space>
    </Card>
  );
};
function JobList() {
  const navigate = useNavigate();
  const { token, cleanerId } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [form] = Form.useForm();
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
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
        setFilteredJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách công việc:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [token, cleanerId]);

  const navigateToJobDetail = (jobId) => {
    navigate(`/workdetail/${jobId}`);
  };

  const handleFilter = (values) => {
    let result = [...jobs];

    // Filter by date range
    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      const startDate = values.dateRange[0].startOf("day").valueOf();
      const endDate = values.dateRange[1].endOf("day").valueOf();

      result = result.filter((job) => {
        const jobDate = new Date(job.scheduledTime).valueOf();
        return jobDate >= startDate && jobDate <= endDate;
      });
    }

    // Filter by time range
    if (values.timeRange && values.timeRange[0] && values.timeRange[1]) {
      const startTime =
        values.timeRange[0].hour() * 60 + values.timeRange[0].minute();
      const endTime =
        values.timeRange[1].hour() * 60 + values.timeRange[1].minute();

      result = result.filter((job) => {
        const jobDate = new Date(job.scheduledTime);
        const jobTime = jobDate.getHours() * 60 + jobDate.getMinutes();
        return jobTime >= startTime && jobTime <= endTime;
      });
    }

    // Filter by price range
    if (values.minPrice !== undefined && values.minPrice !== null) {
      result = result.filter((job) => job.price >= values.minPrice);
    }

    if (values.maxPrice !== undefined && values.maxPrice !== null) {
      result = result.filter((job) => job.price <= values.maxPrice);
    }

    setFilteredJobs(result);
  };

  const resetFilters = () => {
    form.resetFields();
    setFilteredJobs(jobs);
  };

  // Render content based on state
  const renderContent = () => {
    if (!token) {
      return (
        <Result
          status="warning"
          title="Bạn cần đăng nhập"
          subTitle="Bạn cần đăng nhập để xem danh sách công việc."
          extra={
            <Button
              type="primary"
              onClick={() => navigate("/homeclean/login/cleaner")}
            >
              Đăng nhập ngay
            </Button>
          }
        />
      );
    }

    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải danh sách công việc...</div>
        </div>
      );
    }

    if (error) {
      return (
        <Result
          status="error"
          title="Không thể tải danh sách công việc"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          }
        />
      );
    }

    if (filteredJobs.length === 0) {
      return (
        <Empty
          description="Không có công việc nào phù hợp với tiêu chí tìm kiếm"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
        dataSource={filteredJobs}
        renderItem={(job) => (
          <List.Item>
            <JobCard job={job} onClick={navigateToJobDetail} />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="joblist" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Danh sách công việc gần bạn</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            Bộ lọc
          </Button>
        </Col>
      </Row>

      {filterVisible && (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleFilter}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="dateRange" label="Khoảng thời gian">
                    <RangePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder={["Từ ngày", "Đến ngày"]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="timeRange" label="Giờ làm việc">
                    <TimePicker.RangePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      placeholder={["Từ giờ", "Đến giờ"]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Khoảng giá (VND)">
                    <Space>
                      <Form.Item name="minPrice" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="Tối thiểu"
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                      <span>-</span>
                      <Form.Item name="maxPrice" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="Tối đa"
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end" gutter={16}>
                <Col>
                  <Button onClick={resetFilters}>Đặt lại</Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    Tìm kiếm
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
          <Divider />
        </>
      )}

      {renderContent()}
    </div>
  );
}

export default JobList;
