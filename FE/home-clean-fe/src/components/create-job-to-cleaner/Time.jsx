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
} from "antd";
import { EditOutlined, ClockCircleOutlined } from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Time.module.css";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";
const { Title, Text, Paragraph } = Typography;

const Time = ({ onTimeChange }) => {
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng từ context
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [priceAdjustment, setPriceAdjustment] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Khởi tạo thời gian ban đầu
    const now = new Date();
    const currentDayjs = dayjs();

    // Use current time directly without adding 30 minutes
    setSelectedTime(currentDayjs);
    setCurrentTime(currentDayjs);

    // Check for price adjustment rules
    const initialAdjustment = calculatePriceAdjustment(
      now,
      currentDayjs.hour()
    );
    setPriceAdjustment(initialAdjustment);

    // Pass current time to parent component with price adjustment
    onTimeChange(
      selectedDate,
      currentDayjs.hour(),
      currentDayjs.minute(),
      initialAdjustment
    );

    // Thiết lập interval để cập nhật thời gian thực mỗi 30 giây
    const timer = setInterval(() => {
      const updatedTime = dayjs();
      setCurrentTime(updatedTime);
    }, 30000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(timer);
  }, []);

  const calculatePriceAdjustment = (date, hour) => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6; // Sunday or Saturday
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

    setSelectedDate(selectedDateObj);

    // Calculate price adjustment based on new date and time
    const newAdjustment = calculatePriceAdjustment(
      selectedDateObj,
      selectedTime.hour()
    );
    setPriceAdjustment(newAdjustment);

    // Nếu chọn ngày hôm nay, kiểm tra thời gian
    if (selectedDateObj.toDateString() === new Date().toDateString()) {
      if (selectedTime.isBefore(currentTime)) {
        // Thêm 30 phút vào thời gian hiện tại làm mặc định
        const defaultTime = currentTime.add(30, "minute");
        setSelectedTime(defaultTime);
        onTimeChange(
          selectedDateObj,
          defaultTime.hour(),
          defaultTime.minute(),
          newAdjustment
        );
      } else {
        onTimeChange(
          selectedDateObj,
          selectedTime.hour(),
          selectedTime.minute(),
          newAdjustment
        );
      }
    } else {
      onTimeChange(
        selectedDateObj,
        selectedTime.hour(),
        selectedTime.minute(),
        newAdjustment
      );
    }
  };

  const handleTimeChange = (time) => {
    if (!time) return;

    // Kiểm tra nếu ngày đã chọn là hôm nay và thời gian đã chọn < thời gian hiện tại
    if (
      selectedDate.toDateString() === new Date().toDateString() &&
      time.isBefore(currentTime)
    ) {
      // Thêm 15 phút vào thời gian hiện tại làm mặc định
      const defaultTime = currentTime.add(15, "minute");
      setSelectedTime(defaultTime);

      // Calculate price adjustment with new time
      const newAdjustment = calculatePriceAdjustment(
        selectedDate,
        defaultTime.hour()
      );
      setPriceAdjustment(newAdjustment);

      onTimeChange(
        selectedDate,
        defaultTime.hour(),
        defaultTime.minute(),
        newAdjustment
      );
    } else {
      setSelectedTime(time);

      // Calculate price adjustment with new time
      const newAdjustment = calculatePriceAdjustment(selectedDate, time.hour());
      setPriceAdjustment(newAdjustment);

      onTimeChange(selectedDate, time.hour(), time.minute(), newAdjustment);
    }

    // Đóng popup sau khi đã chọn giá trị
    setOpen(false);
  };

  // Tùy chỉnh rendering ngày để vô hiệu hóa các ngày trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Vô hiệu hóa các tùy chọn thời gian trong quá khứ nếu ngày đã chọn là hôm nay
  const disabledTime = () => {
    if (selectedDate.toDateString() === new Date().toDateString()) {
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
      <Title level={5}>Thời gian làm việc</Title>
      <div className={styles.selectedDate}>
        <Paragraph>Chọn thời gian</Paragraph>
        <DatePicker
          format="DD/MM/YYYY"
          onChange={handleDateChange}
          disabledDate={disabledDate}
          placeholder="Chọn ngày"
          className={styles.datePicker}
          size="large"
          value={dayjs(selectedDate)}
          showNow={false}
          style={{ width: "200px" }}
        />
      </div>

      <div className={styles.timeSelection}>
        <div className={styles.timeHeader}>
          <Title level={5}>Chọn giờ làm việc</Title>
          <Paragraph>Giờ mà người giúp việc sẽ đến</Paragraph>
          {priceAdjustment && (
            <Paragraph className={styles.infoRow} style={{ color: "#1890ff" }}>
              <Text>Phụ phí: </Text>
              <Text style={{ color: "red" }}>
                +{priceAdjustment.percentage}% do {priceAdjustment.reason}
              </Text>
            </Paragraph>
          )}
        </div>
        <div className={styles.timeInputGroup}>
          <TimePicker
            format="HH:mm"
            value={selectedTime}
            onChange={handleTimeChange}
            onSelect={handleTimeChange} // Thêm onSelect để chọn giá trị ngay khi click
            disabledTime={disabledTime}
            size="large"
            className={styles.timePicker}
            hideDisabledOptions={true}
            use12Hours={false}
            allowClear={false}
            showNow={false}
            popupStyle={{ paddingRight: 8 }}
            renderExtraFooter={() => null} // Ẩn phần footer
            showTime={{ hideDisabledOptions: true }}
            open={open} // Thêm state để kiểm soát việc hiển thị popup
            onOpenChange={(open) => setOpen(open)} // Xử lý đóng popup sau khi chọn
            style={{ width: "200px" }}
          />
        </div>

        {/* {priceAdjustment && (
          <Alert
            message={`Phụ phí: +${priceAdjustment.percentage}% do ${priceAdjustment.reason}`}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )} */}
      </div>

      <div className={styles.phoneSection}>
        <div className={styles.phoneInfo}>
          <Title level={5}>Số điện thoại</Title>
          <Paragraph>Nhân công sẽ liên hệ với bạn khi đến nơi</Paragraph>
        </div>
        <div className={styles.phoneContainer}>
          <Col flex="auto">
            <Input
              style={{ width: "200px" }}
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
