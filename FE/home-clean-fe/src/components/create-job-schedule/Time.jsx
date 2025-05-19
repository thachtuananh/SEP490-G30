import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Button,
  DatePicker,
  TimePicker,
  Typography,
  Row,
  Col,
  Space,
  Input,
  List,
  Modal,
  Select,
  message,
} from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Time.module.css";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const Time = ({ onTimeChange }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { selectedServices, serviceDetails } = location.state || {
    selectedServices: [],
    serviceDetails: [],
  };
  const [serviceSchedules, setServiceSchedules] = useState({}); // { serviceId: [{ jobTime, hour, minute, date, adjustment }], ... }
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [priceAdjustment, setPriceAdjustment] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Lưu trữ tên dịch vụ để tránh gọi lại nhiều lần
  const [serviceNames, setServiceNames] = useState({});

  useEffect(() => {
    // Khởi tạo serviceNames từ serviceDetails
    const nameMap = {};
    if (serviceDetails && serviceDetails.length > 0) {
      serviceDetails.forEach((service) => {
        nameMap[service.serviceId] =
          service.serviceName || `Dịch vụ ${service.serviceId}`;
      });
      setServiceNames(nameMap);
    }
  }, [serviceDetails]);

  useEffect(() => {
    // Initialize time
    const now = new Date();
    const currentDayjs = dayjs();
    setNewTime(currentDayjs);
    setCurrentTime(currentDayjs);

    // Initialize serviceSchedules for each service
    const initialSchedules = {};
    selectedServices.forEach((serviceId) => {
      initialSchedules[serviceId] = [];
    });
    setServiceSchedules(initialSchedules);

    // Update price adjustment
    updatePriceAdjustment(initialSchedules);

    // Send initial data to parent
    onTimeChange(initialSchedules, priceAdjustment);

    // Update real-time clock
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update price adjustment when schedules change
    updatePriceAdjustment(serviceSchedules);
  }, [serviceSchedules]);

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleCloseErrorModal = () => {
    setErrorModalVisible(false);
  };

  const updatePriceAdjustment = (schedules) => {
    let highestAdjustment = null;

    Object.keys(schedules).forEach((serviceId) => {
      schedules[serviceId].forEach((schedule) => {
        const scheduleDate = new Date(schedule.date);
        const adjustment = calculatePriceAdjustment(
          scheduleDate,
          schedule.hour
        );

        if (
          adjustment &&
          (!highestAdjustment ||
            adjustment.percentage > highestAdjustment.percentage)
        ) {
          highestAdjustment = adjustment;
        }
      });
    });

    setPriceAdjustment(highestAdjustment);
    onTimeChange(schedules, highestAdjustment);
  };

  const calculatePriceAdjustment = (date, hour) => {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const isEveningHour = hour >= 18 && hour < 22;

    if (isWeekend && isEveningHour) {
      return { percentage: 20, reason: "cuối tuần và giờ tối (18h - 22h)" };
    } else if (isWeekend) {
      return { percentage: 10, reason: "cuối tuần" };
    } else if (isEveningHour) {
      return { percentage: 10, reason: "giờ tối (18h - 22h)" };
    }
    return null;
  };

  const handleDateChange = (date) => {
    if (!date) return;
    const selectedDateObj = date.toDate();
    const now = new Date();

    if (selectedDateObj < now.setHours(0, 0, 0, 0)) {
      showErrorModal("Không thể chọn ngày trong quá khứ!");
      return;
    }

    setNewDate(selectedDateObj);
  };

  const handleTimeChange = (time) => {
    if (!time) return;

    if (
      newDate.toDateString() === new Date().toDateString() &&
      time.isBefore(currentTime)
    ) {
      const defaultTime = currentTime.add(15, "minute");
      setNewTime(defaultTime);
      showErrorModal(
        "Thời gian đã chọn là trong quá khứ. Đã tự động điều chỉnh thành thời gian hiện tại + 15 phút."
      );
    } else {
      setNewTime(time);
    }
  };

  const addSchedule = () => {
    if (!selectedServiceId) {
      showErrorModal("Vui lòng chọn dịch vụ trước khi thêm lịch!");
      return;
    }

    const selectedDateTime = dayjs(
      new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        newTime.hour(),
        newTime.minute()
      )
    );

    if (selectedDateTime.isBefore(currentTime)) {
      showErrorModal("Không thể đặt lịch cho thời gian đã qua!");
      return;
    }

    // Check for duplicate schedule
    const isDuplicate = serviceSchedules[selectedServiceId].some((schedule) => {
      const scheduleTime = dayjs(schedule.jobTime);
      return (
        scheduleTime.format("YYYY-MM-DD HH:mm") ===
        selectedDateTime.format("YYYY-MM-DD HH:mm")
      );
    });

    if (isDuplicate) {
      showErrorModal(
        "Bạn đã đặt lịch trình này cho dịch vụ! Vui lòng chọn thời gian khác."
      );
      return;
    }

    const adjustmentForThisSchedule = calculatePriceAdjustment(
      newDate,
      newTime.hour()
    );

    const newSchedule = {
      jobTime: selectedDateTime.format("YYYY-MM-DDTHH:mm:ss"),
      hour: newTime.hour(),
      minute: newTime.minute(),
      date: newDate,
      adjustment: adjustmentForThisSchedule,
    };

    const newServiceSchedules = {
      ...serviceSchedules,
      [selectedServiceId]: [
        ...serviceSchedules[selectedServiceId],
        newSchedule,
      ],
    };

    setServiceSchedules(newServiceSchedules);

    // Reset form
    setNewDate(new Date());
    setNewTime(dayjs());
  };

  const removeSchedule = (serviceId, index) => {
    const newSchedules = {
      ...serviceSchedules,
      [serviceId]: serviceSchedules[serviceId].filter((_, i) => i !== index),
    };
    setServiceSchedules(newSchedules);
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = () => {
    if (newDate.toDateString() === new Date().toDateString()) {
      return {
        disabledHours: () =>
          Array.from({ length: currentTime.hour() }, (_, i) => i),
        disabledMinutes: (selectedHour) =>
          selectedHour === currentTime.hour()
            ? Array.from({ length: currentTime.minute() }, (_, i) => i)
            : [],
      };
    }
    return {};
  };

  const getServiceName = (serviceId) => {
    // Sử dụng tên đã lưu trong state nếu có
    return serviceNames[serviceId] || `Dịch vụ ${serviceId}`;
  };

  return (
    <div className={styles.container}>
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined
              style={{ color: "#ff4d4f", marginRight: "8px" }}
            />
            Thông báo
          </span>
        }
        open={errorModalVisible}
        onOk={handleCloseErrorModal}
        onCancel={handleCloseErrorModal}
        footer={[
          <Button key="ok" type="primary" onClick={handleCloseErrorModal}>
            Đã hiểu
          </Button>,
        ]}
      >
        <p>{errorMessage}</p>
      </Modal>

      <Row gutter={[16, 16]} style={{ paddingBottom: "20px" }}>
        <Col xs={24} md={12}>
          <Title level={5}>Đặt dịch vụ theo lịch trình</Title>
          <Paragraph>Chọn dịch vụ và thời gian</Paragraph>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Select
              placeholder="Chọn dịch vụ"
              style={{ width: "100%", maxWidth: "200px" }}
              onChange={setSelectedServiceId}
              value={selectedServiceId}
            >
              {selectedServices.map((serviceId) => (
                <Select.Option key={serviceId} value={serviceId}>
                  {getServiceName(serviceId)}
                </Select.Option>
              ))}
            </Select>
            <DatePicker
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              disabledDate={disabledDate}
              placeholder="Chọn ngày"
              className={styles.datePicker}
              size="large"
              value={dayjs(newDate)}
              showNow={false}
              style={{ width: "100%", maxWidth: "200px" }}
            />
            <TimePicker
              format="HH:mm"
              value={newTime}
              onChange={handleTimeChange}
              disabledTime={disabledTime}
              size="large"
              className={styles.timePicker}
              hideDisabledOptions
              use12Hours={false}
              allowClear={false}
              showNow={false}
              style={{ width: "100%", maxWidth: "200px" }}
            />
            <Button
              type="primary"
              onClick={addSchedule}
              disabled={!newDate || !newTime || !selectedServiceId}
              style={{ width: "100%", maxWidth: "200px" }}
            >
              Thêm lịch trình
            </Button>
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <Title level={5}>Danh sách lịch trình</Title>
          {Object.keys(serviceSchedules).every(
            (serviceId) => serviceSchedules[serviceId].length === 0
          ) ? (
            <Paragraph>Chưa có lịch trình nào được thêm.</Paragraph>
          ) : (
            Object.keys(serviceSchedules).map((serviceId) => (
              <div key={serviceId}>
                <Title level={5}>{getServiceName(serviceId)}</Title>
                <List
                  dataSource={serviceSchedules[serviceId]}
                  renderItem={(schedule, index) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeSchedule(serviceId, index)}
                          danger
                        />,
                      ]}
                    >
                      <Text>
                        {dayjs(schedule.date).format("DD/MM/YYYY")} -{" "}
                        {schedule.hour.toString().padStart(2, "0")}:
                        {schedule.minute.toString().padStart(2, "0")}
                      </Text>
                    </List.Item>
                  )}
                />
              </div>
            ))
          )}
        </Col>
      </Row>

      <div className={styles.phoneSection}>
        <div className={styles.phoneInfo}>
          <Title level={5}>Số điện thoại</Title>
          <Paragraph>Người dọn dẹp sẽ liên hệ với bạn khi đến nơi</Paragraph>
        </div>
        <div className={styles.phoneContainer}>
          <Col flex="auto">
            <Input
              style={{ width: "200px", color: "black" }}
              value={user?.customerPhone}
              disabled
            />
          </Col>
        </div>
      </div>
    </div>
  );
};

export default Time;
