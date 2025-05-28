import React, { useContext, useEffect, useState } from "react";
import { ActivityCard } from "../components/activity/ActivityCard";
import styles from "../components/activity/ActivityList.module.css";
import { AuthContext } from "../context/AuthContext";
import { Button, Input, Select, Space, Row, Col, Card, Form } from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { BASE_URL } from "../utils/config";

export const ActivityList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchOrderCode, setSearchOrderCode] = useState("");
  const { token, customerId } = useContext(AuthContext);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [loading, setLoading] = useState(false);

  // API GET
  useEffect(() => {
    fetchData();
  }, [customerId, token, reloadTrigger]);

  const fetchData = () => {
    setLoading(true);
    fetch(`${BASE_URL}/customer/${customerId}/listjobsbook`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách công việc.");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách công việc:", error);
        setLoading(false);
      });
  };

  // Apply filters when status changes or search is submitted
  const applyFilters = (status, orderCode) => {
    let result = [...data];

    // Filter by status
    if (status !== "ALL") {
      result = result.filter((item) => item.status === status);
    }

    // Filter by orderCode
    if (orderCode && orderCode.trim() !== "") {
      result = result.filter(
        (item) =>
          item.orderCode &&
          item.orderCode.toLowerCase().includes(orderCode.toLowerCase())
      );
    }

    setFilteredData(result);
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    applyFilters(value, searchOrderCode);
  };

  const handleSearchInputChange = (e) => {
    setSearchOrderCode(e.target.value);
  };

  // Handle search input change
  const handleSearch = () => {
    applyFilters(statusFilter, searchOrderCode);
  };

  // Handle reset filters
  const handleReset = () => {
    setStatusFilter("ALL");
    setSearchOrderCode("");
    setFilteredData(data);
  };

  // Handle refresh data
  const handleRefresh = () => {
    setReloadTrigger(!reloadTrigger);
  };

  const statusOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "OPEN", label: "Đang chờ người nhận" },
    { value: "IN_PROGRESS", label: "Người nhận việc đang tới" },
    { value: "ARRIVED", label: "Người nhận việc đã tới" },
    { value: "COMPLETED", label: "Người nhận việc đã hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "DONE", label: "Hoàn tất công việc" },
    { value: "AUTO_CANCELLED", label: "Đã tự động huỷ" },
    { value: "PAID", label: "Đang chờ thanh toán qua VNPay" },
    { value: "BOOKED", label: "Đã đặt lịch" },
  ];

  return (
    <div className={styles.actlist}>
      <div className={styles.container}>
        <h2 className={styles.title}>Hoạt động gần đây</h2>
        <p className={styles.subtitle}>Quản lý các hoạt động đăng bài</p>

        {/* Filter and Search Bar */}
        <Card className={styles.filterCard}>
          <Form layout="vertical">
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12} md={12} lg={12}>
                <Form.Item label="Trạng thái">
                  <Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    style={{ width: "100%" }}
                    placeholder="Chọn trạng thái"
                    options={statusOptions}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12}>
                <Form.Item label="Mã đơn hàng">
                  <Input.Group compact>
                    <Input
                      placeholder="Tìm kiếm theo mã đơn hàng"
                      value={searchOrderCode}
                      onChange={handleSearchInputChange}
                      onPressEnter={handleSearch}
                      prefix={<SearchOutlined className={styles.inputIcon} />}
                      allowClear
                      style={{ width: "calc(100% - 100px)" }}
                    />
                    <Button
                      type="primary"
                      onClick={handleSearch}
                      style={{ width: "100px" }}
                    >
                      Tìm kiếm
                    </Button>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {filteredData.length === 0 ? (
          <div className={styles.noResults}>
            <p>Không tìm thấy hoạt động phù hợp với bộ lọc</p>
          </div>
        ) : (
          <ActivityCard data={filteredData} loading={loading} />
        )}
      </div>
    </div>
  );
};
