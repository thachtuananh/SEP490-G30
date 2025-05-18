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
  Divider,
  InputNumber,
  Alert,
  List,
} from "antd";
import {
  EditOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Time.module.css";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";
const { Title, Text, Paragraph } = Typography;

const Time = ({ onTimeChange }) => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]); // Danh sách lịch trình
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [priceAdjustment, setPriceAdjustment] = useState(null);

  useEffect(() => {
    // Khởi tạo thời gian hiện tại
    const now = new Date();
    const currentDayjs = dayjs();
    setNewTime(currentDayjs);
    setCurrentTime(currentDayjs);

    // Tính toán phụ phí ban đầu
    const initialAdjustment = calculatePriceAdjustment(
      now,
      currentDayjs.hour()
    );
    setPriceAdjustment(initialAdjustment);

    // Gửi dữ liệu ban đầu lên parent
    onTimeChange(schedules, initialAdjustment);

    // Cập nhật thời gian thực mỗi 30 giây
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);

    return () => clearInterval(timer);
  }, [schedules]);

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

    if (selectedDateObj < now.setHours(0, 0, 0, 0)) return;

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
    } else {
      setNewTime(time);
    }
  };

  const addSchedule = () => {
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
      return;
    }

    const newSchedule = {
      jobTime: selectedDateTime.format("YYYY-MM-DDTHH:mm:ss"),
      hour: newTime.hour(),
      minute: newTime.minute(),
      date: newDate,
    };

    const newSchedules = [...schedules, newSchedule];
    setSchedules(newSchedules);

    // Tính toán phụ phí mới
    const newAdjustment = calculatePriceAdjustment(newDate, newTime.hour());
    setPriceAdjustment(newAdjustment);

    // Gửi dữ liệu lên parent
    onTimeChange(newSchedules, newAdjustment);

    // Reset form
    setNewDate(new Date());
    setNewTime(dayjs());
  };

  const removeSchedule = (index) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
    onTimeChange(newSchedules, priceAdjustment);
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

  return (
    <div className={styles.container}>
      <Row gutter={[16, 16]} style={{ paddingBottom: "20px" }}>
        <Col xs={24} md={12}>
          <Title level={5}>Đặt dịch vụ theo lịch trình</Title>
          <Paragraph>Chọn thời gian</Paragraph>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
              disabled={!newDate || !newTime}
              style={{ width: "100%", maxWidth: "200px" }}
            >
              Thêm lịch trình
            </Button>
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <Title level={5}>Danh sách lịch trình</Title>
          {schedules.length === 0 ? (
            <Paragraph>Chưa có lịch trình nào được thêm.</Paragraph>
          ) : (
            <List
              dataSource={schedules}
              renderItem={(schedule, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => removeSchedule(index)}
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
          )}
          {/* {priceAdjustment && (
            <Paragraph style={{ color: "#1890ff", marginTop: 16 }}>
              <Text>Phụ phí: </Text>
              <Text style={{ color: "red" }}>
                +{priceAdjustment.percentage}% do {priceAdjustment.reason}
              </Text>
            </Paragraph>
          )} */}
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
