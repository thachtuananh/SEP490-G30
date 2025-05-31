import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Button,
  DatePicker,
  Typography,
  Row,
  Col,
  Space,
  Input,
  Divider,
  Form,
  message,
} from "antd";
import {
  EditOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import styles from "../../assets/CSS/createjob/Time.module.css";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import AddressSelectionModal from "../../components/combo-service/AddressSelectionModal";
import {
  fetchCustomerAddresses,
  setDefaultAddress,
} from "../../services/owner/OwnerAddressAPI";

const { Title, Text, Paragraph } = Typography;

const Time = ({ onTimeChange }) => {
  const location = useLocation();
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    return dayjs().add(30, "minute");
  });
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [priceAdjustment, setPriceAdjustment] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const customerId = sessionStorage.getItem("customerId") || user?.customerId;

  // Reusable function to fetch addresses
  const refetchAddresses = async () => {
    if (!customerId) {
      message.error("Không có ID khách hàng để tải địa chỉ!");
      return;
    }
    try {
      setAddressLoading(true);
      const addressesData = await fetchCustomerAddresses(customerId);
      setAddresses(addressesData);

      const defaultAddress =
        addressesData.find((addr) => addr.current) || addressesData[0];

      if (defaultAddress) {
        const updatedAddress = {
          ...defaultAddress,
          fullAddress: defaultAddress.address,
        };
        setSelectedAddress(updatedAddress);
        form.setFieldsValue({ location: defaultAddress.address });
        if (onTimeChange) {
          onTimeChange(
            selectedDateTime.toDate(),
            selectedDateTime.hour(),
            selectedDateTime.minute(),
            priceAdjustment,
            updatedAddress // Gọi onTimeChange với địa chỉ mới
          );
        }
        if (!defaultAddress.current && addressesData.length > 0) {
          try {
            await setDefaultAddress(customerId, defaultAddress.id);
            setAddresses(
              addressesData.map((addr) => ({
                ...addr,
                current: addr.id === defaultAddress.id,
              }))
            );
          } catch (error) {
            console.error("Error setting initial default address:", error);
            message.warning(
              "Không thể đặt địa chỉ mặc định, vui lòng chọn thủ công!"
            );
          }
        }
      } else {
        message.warning("Vui lòng thêm địa chỉ trước khi đặt dịch vụ!");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // message.error("Không thể tải danh sách địa chỉ!");
    } finally {
      setAddressLoading(false);
    }
  };

  // Fetch addresses on component mount
  useEffect(() => {
    refetchAddresses();
  }, [customerId]);

  // Initialize time and update current time
  useEffect(() => {
    const now = dayjs();
    const initialDateTime = now.add(30, "minute");

    setCurrentTime(now);
    setSelectedDateTime(initialDateTime);

    const initialAdjustment = calculatePriceAdjustment(
      initialDateTime.toDate(),
      initialDateTime.hour()
    );
    setPriceAdjustment(initialAdjustment);

    // Gọi onTimeChange với thời gian khởi tạo
    if (onTimeChange) {
      onTimeChange(
        initialDateTime.toDate(),
        initialDateTime.hour(),
        initialDateTime.minute(),
        initialAdjustment,
        selectedAddress
      );
    }

    // Cập nhật thời gian hiện tại mỗi 30 giây
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Cập nhật priceAdjustment khi selectedDateTime thay đổi
  useEffect(() => {
    if (selectedDateTime) {
      const adjustment = calculatePriceAdjustment(
        selectedDateTime.toDate(),
        selectedDateTime.hour()
      );
      setPriceAdjustment(adjustment);
    }
  }, [selectedDateTime]);

  const handleSetDefaultAddress = async (addressId) => {
    try {
      if (!addressId) {
        console.error("Invalid address ID:", addressId);
        message.error("Địa chỉ không hợp lệ");
        return;
      }

      setAddressLoading(true);
      await setDefaultAddress(customerId, addressId);
      await refetchAddresses();
      message.success("Đã đặt địa chỉ mặc định mới");
    } catch (error) {
      console.error("Error setting default address:", error);
      message.error("Không thể cập nhật địa chỉ mặc định!");
    } finally {
      setAddressLoading(false);
    }
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

  const handleDateTimeChange = (dateTime) => {
    if (!dateTime) return;

    const now = dayjs();
    let finalDateTime = dateTime;

    // Kiểm tra nếu thời gian được chọn là quá khứ
    // if (dateTime.isBefore(now)) {
    //   finalDateTime = now.add(30, "minute");
    //   message.warning(
    //     "Không thể chọn thời gian trong quá khứ. Đã tự động chọn thời gian hiện tại + 30 phút."
    //   );
    // }
    // // Nếu chọn ngày hôm nay nhưng giờ quá gần hiện tại (< 15 phút)
    // else if (dateTime.isSame(now, "day") && dateTime.diff(now, "minute") < 30) {
    //   finalDateTime = now.add(30, "minute");
    //   message.warning(
    //     "Thời gian chọn quá gần hiện tại. Đã tự động điều chỉnh thành hiện tại + 30 phút."
    //   );
    // }

    setSelectedDateTime(finalDateTime);

    const adjustment = calculatePriceAdjustment(
      finalDateTime.toDate(),
      finalDateTime.hour()
    );

    // Gọi callback để thông báo thay đổi
    if (onTimeChange) {
      onTimeChange(
        finalDateTime.toDate(),
        finalDateTime.hour(),
        finalDateTime.minute(),
        adjustment,
        selectedAddress
      );
    }
  };

  const handleAddressAdded = async () => {
    await refetchAddresses();
  };

  // Hàm xử lý khi chọn ngày (không cần nhấn OK)
  const handleDateSelect = (date) => {
    if (!date) return;

    // Giữ nguyên giờ và phút hiện tại, chỉ thay đổi ngày
    const newDateTime = selectedDateTime
      .year(date.year())
      .month(date.month())
      .date(date.date());
    handleDateTimeChange(newDateTime);
  };

  // Hàm xử lý khi chọn giờ (không cần nhấn OK)
  const handleTimeSelect = (time) => {
    if (!time) return;

    // Giữ nguyên ngày hiện tại, chỉ thay đổi giờ và phút
    const newDateTime = selectedDateTime
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0);
    handleDateTimeChange(newDateTime);
  };

  // Hàm xử lý khi panel thời gian thay đổi (để bắt các thay đổi ngay lập tức)
  const handlePanelChange = (value) => {
    if (value) {
      handleDateTimeChange(value);
    }
  };

  const disabledDate = (current) => {
    // Chỉ disable những ngày trước hôm nay
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (date) => {
    if (!date) return {};

    const now = dayjs();
    const isToday = date.isSame(now, "day");

    if (!isToday) {
      return {}; // Không disable giờ nào cho các ngày khác hôm nay
    }

    // Với ngày hôm nay, disable những giờ và phút đã qua + buffer 15 phút
    const minTime = now.add(30, "minute");

    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < minTime.hour(); i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour) => {
        if (selectedHour < minTime.hour()) {
          return Array.from({ length: 60 }, (_, i) => i); // Disable tất cả phút
        } else if (selectedHour === minTime.hour()) {
          const minutes = [];
          for (let i = 0; i < minTime.minute(); i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return []; // Không disable phút nào cho các giờ sau
      },
    };
  };

  const showLocationModal = () => setIsLocationModalVisible(true);
  const handleLocationCancel = () => setIsLocationModalVisible(false);
  const handleLocationSelect = (address) => {
    setSelectedAddress({
      ...address,
      fullAddress: address.address,
    });
    form.setFieldsValue({ location: address.address });
    setIsLocationModalVisible(false);
    refetchAddresses();
  };

  return (
    <>
      <div className={styles.container}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ location: selectedAddress?.address || "" }}
        >
          <Title level={5}>Chọn địa chỉ</Title>
          <Form.Item name="location">
            <Card size="small" onClick={showLocationModal}>
              <Space
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Space>
                  <EnvironmentOutlined style={{ color: "#1890ff" }} />
                  <Text
                    style={{
                      color: selectedAddress ? "inherit" : "#bfbfbf",
                    }}
                  >
                    {selectedAddress?.fullAddress || "Chưa chọn địa chỉ"}
                  </Text>
                </Space>
                <Button type="primary" onClick={showLocationModal}>
                  {selectedAddress ? "Thay đổi" : "Chọn"}
                </Button>
              </Space>
            </Card>
          </Form.Item>
          <div className={styles.phoneSection}>
            <div className={styles.phoneInfo}>
              <Title level={5}>Số điện thoại</Title>
              <Paragraph>
                Người dọn dẹp sẽ liên hệ với bạn khi đến nơi
              </Paragraph>
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
          <AddressSelectionModal
            isVisible={isLocationModalVisible}
            onCancel={handleLocationCancel}
            onSelect={handleLocationSelect}
            addresses={addresses.map((addr) => ({
              ...addr,
              addressId: addr.id,
            }))}
            loading={addressLoading}
            onSetDefaultAddress={handleSetDefaultAddress}
            currentLocation={location.pathname}
            onAddressAdded={handleAddressAdded}
          />
        </Form>
      </div>
      <div className={styles.container}>
        <Title level={5}>Thời gian làm việc</Title>
        <div className={styles.selectedDate}>
          <Paragraph>Chọn ngày và giờ</Paragraph>
          <DatePicker
            format="DD/MM/YYYY HH:mm"
            showTime={{
              format: "HH:mm",
              hideDisabledOptions: true,
            }}
            onChange={handleDateTimeChange}
            // onSelect={handleDateSelect}
            onOk={handleDateTimeChange}
            onPanelChange={handlePanelChange}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            placeholder="Chọn ngày và giờ"
            className={styles.datePicker}
            size="large"
            value={selectedDateTime}
            showNow={false}
            style={{ width: "200px" }}
            allowClear={false}
          />
        </div>

        {priceAdjustment && (
          <Paragraph className={styles.infoRow} style={{ color: "#1890ff" }}>
            <Text>Phụ phí: </Text>
            <Text style={{ color: "red" }}>
              +{priceAdjustment.percentage}% do {priceAdjustment.reason}
            </Text>
          </Paragraph>
        )}
      </div>
    </>
  );
};

export default Time;
