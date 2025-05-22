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
  List,
  Modal,
  Select,
  message,
  Form,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
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

// Define available time slots (08:00 to 22:00, every 30 minutes)
const timeSlots = [];
for (let hour = 0; hour <= 23; hour++) {
  timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
}
const Time = ({
  onTimeChange,
  selectedServices,
  serviceDetails,
  customerId,
}) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [form] = Form.useForm();
  const [serviceSchedules, setServiceSchedules] = useState({});
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedServiceDetailId, setSelectedServiceDetailId] = useState(null);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [priceAdjustment, setPriceAdjustment] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceNames, setServiceNames] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Initialize serviceNames from serviceDetails
    const nameMap = {};
    if (serviceDetails && serviceDetails.length > 0) {
      serviceDetails.forEach((service) => {
        nameMap[service.serviceId] =
          service.serviceName || `Dịch vụ ${service.serviceId}`;
      });
      setServiceNames(nameMap);
    }

    // Fetch customer addresses
    const fetchAddresses = async () => {
      if (!customerId) return;
      try {
        setAddressLoading(true);
        const addressesData = await fetchCustomerAddresses(customerId);
        console.log("Fetched addresses:", addressesData);
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
          if (!defaultAddress.current && addressesData.length > 0) {
            try {
              console.log(
                "Setting initial default address with id:",
                defaultAddress.id
              );
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
        message.error("Không thể tải danh sách địa chỉ!");
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [serviceDetails, customerId, form]);

  // New useEffect to set default service
  useEffect(() => {
    if (selectedServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(selectedServices[0]);
    }
  }, [selectedServices, selectedServiceId]);

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

    // Update real-time clock
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);

    return () => clearInterval(timer);
  }, [selectedServices]);

  useEffect(() => {
    // Update price adjustment and totalPrice when schedules change
    updatePriceAdjustment(serviceSchedules);
    calculateTotalPrice(serviceSchedules);
  }, [serviceSchedules]);

  useEffect(() => {
    // Update parent when selectedAddress changes
    onTimeChange(
      serviceSchedules,
      priceAdjustment,
      selectedAddress,
      totalPrice
    );
  }, [selectedAddress, totalPrice]);

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleCloseErrorModal = () => {
    setErrorModalVisible(false);
  };

  const calculateTotalPrice = (schedules) => {
    let price = 0;
    Object.keys(schedules).forEach((serviceId) => {
      schedules[serviceId].forEach((schedule) => {
        const detail = serviceDetails.find(
          (d) => d.serviceDetailId === schedule.serviceDetailId
        );
        if (detail) {
          price += detail.price;
        }
      });
    });
    setTotalPrice(price);
    return price;
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
    onTimeChange(schedules, highestAdjustment, selectedAddress, totalPrice);
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

  const handleTimeChange = (timeString) => {
    if (!timeString) return;

    // Parse timeString (e.g., "08:30") to dayjs object
    const [hour, minute] = timeString.split(":").map(Number);
    const selectedTime = dayjs().set("hour", hour).set("minute", minute);

    if (
      newDate.toDateString() === new Date().toDateString() &&
      selectedTime.isBefore(currentTime)
    ) {
      const defaultTime = currentTime.add(15, "minute");
      setNewTime(defaultTime);
      showErrorModal(
        "Thời gian đã chọn là trong quá khứ. Đã tự động điều chỉnh thành thời gian hiện tại + 15 phút."
      );
    } else {
      setNewTime(selectedTime);
    }
  };

  const addSchedule = () => {
    if (!selectedServiceId) {
      showErrorModal("Vui lòng chọn dịch vụ trước khi thêm lịch!");
      return;
    }
    if (!selectedServiceDetailId) {
      showErrorModal("Vui lòng chọn kích thước phòng trước khi thêm lịch!");
      return;
    }
    if (!selectedAddress) {
      showErrorModal("Vui lòng chọn địa chỉ trước khi thêm lịch!");
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

    const newSchedule = {
      jobTime: selectedDateTime.format("YYYY-MM-DDTHH:mm:ss"),
      hour: newTime.hour(),
      minute: newTime.minute(),
      date: newDate, // Ensure this is a Date object
      adjustment: calculatePriceAdjustment(newDate, newTime.hour()),
      serviceDetailId: selectedServiceDetailId,
    };

    const newServiceSchedules = {
      ...serviceSchedules,
      [selectedServiceId]: [
        ...serviceSchedules[selectedServiceId],
        newSchedule,
      ],
    };

    setServiceSchedules(newServiceSchedules);

    // Recalculate total price
    const newTotalPrice = calculateTotalPrice(newServiceSchedules);

    // Recalculate price adjustment
    let highestAdjustment = null;
    Object.keys(newServiceSchedules).forEach((serviceId) => {
      newServiceSchedules[serviceId].forEach((schedule) => {
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
    setTotalPrice(newTotalPrice);

    // Update parent with new schedules, price adjustment, and total price
    onTimeChange(
      newServiceSchedules,
      highestAdjustment,
      selectedAddress,
      newTotalPrice
    );

    // Reset form
    setNewDate(new Date());
    setNewTime(dayjs());
    setSelectedServiceDetailId(null);
  };

  const removeSchedule = (serviceId, index) => {
    const newSchedules = {
      ...serviceSchedules,
      [serviceId]: serviceSchedules[serviceId].filter((_, i) => i !== index),
    };
    setServiceSchedules(newSchedules);

    // Tính lại totalPrice sau khi xóa lịch trình
    const newTotalPrice = calculateTotalPrice(newSchedules);
    onTimeChange(newSchedules, priceAdjustment, selectedAddress, newTotalPrice);
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = () => {
    // Always return empty array to show all time slots
    return [];
  };

  const getServiceName = (serviceId) => {
    return serviceNames[serviceId] || `Dịch vụ ${serviceId}`;
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
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      if (!addressId) {
        console.error("Invalid address ID:", addressId);
        message.error("Địa chỉ không hợp lệ");
        return;
      }

      setAddressLoading(true);
      await setDefaultAddress(customerId, addressId);

      // Update addresses state locally
      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          current: addr.id === addressId,
        }))
      );

      // Update selectedAddress if needed
      const updatedDefaultAddress = addresses.find(
        (addr) => addr.id === addressId
      );
      if (updatedDefaultAddress) {
        if (!selectedAddress || selectedAddress.id !== addressId) {
          const updatedAddress = {
            ...updatedDefaultAddress,
            current: true,
            fullAddress: updatedDefaultAddress.address,
          };
          setSelectedAddress(updatedAddress);
          form.setFieldsValue({ location: updatedAddress.address });
        }
        message.success("Đã đặt địa chỉ mặc định mới");
      } else {
        console.error("Address not found for addressId:", addressId);
        message.error("Không tìm thấy địa chỉ được chọn!");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      // Fallback: Update local state
      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          current: addr.id === addressId,
        }))
      );
      const updatedDefaultAddress = addresses.find(
        (addr) => addr.id === addressId
      );
      if (updatedDefaultAddress) {
        if (!selectedAddress || selectedAddress.id !== addressId) {
          const updatedAddress = {
            ...updatedDefaultAddress,
            current: true,
            fullAddress: updatedDefaultAddress.address,
          };
          setSelectedAddress(updatedAddress);
          form.setFieldsValue({ location: updatedAddress.address });
        }
        message.warning(
          "Đã chọn địa chỉ mặc định tạm thời, nhưng không thể cập nhật trên server!"
        );
      } else {
        message.error("Không tìm thấy địa chỉ được chọn!");
      }
    } finally {
      setAddressLoading(false);
    }
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
          />
        </Form>
      </div>
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
            <Paragraph>Chọn dịch vụ, diện tích và thời gian</Paragraph>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5}>Chọn dịch vụ</Title>
              <Select
                placeholder="Chọn dịch vụ"
                style={{ width: "100%" }}
                onChange={setSelectedServiceId}
                value={selectedServiceId}
                size="large"
              >
                {selectedServices.map((serviceId) => (
                  <Select.Option key={serviceId} value={serviceId}>
                    {getServiceName(serviceId)}
                  </Select.Option>
                ))}
              </Select>
              <Title level={5}>Chọn diện tích</Title>
              <Select
                placeholder="Chọn diện tích"
                style={{ width: "100%" }}
                onChange={setSelectedServiceDetailId}
                value={selectedServiceDetailId}
                disabled={!selectedServiceId}
                size="large"
              >
                {serviceDetails
                  .filter((detail) => detail.serviceId === selectedServiceId)
                  .map((detail) => (
                    <Select.Option
                      key={detail.serviceDetailId}
                      value={detail.serviceDetailId}
                    >
                      {detail.minRoomSize}m² - {detail.maxSize}m²
                    </Select.Option>
                  ))}
              </Select>
              <Title level={5}>Thời gian</Title>
              <DatePicker
                format="DD/MM/YYYY"
                onChange={handleDateChange}
                disabledDate={disabledDate}
                placeholder="Chọn ngày"
                className={styles.datePicker}
                size="large"
                value={dayjs(newDate)}
                showNow={false}
                style={{ width: "100%" }}
              />
              <Select
                placeholder="Chọn khung giờ"
                style={{ width: "100%" }}
                onChange={handleTimeChange}
                value={newTime ? newTime.format("HH:mm") : undefined}
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {timeSlots.map((slot) => (
                  <Select.Option key={slot} value={slot}>
                    {slot}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                onClick={addSchedule}
                disabled={
                  !newDate ||
                  !newTime ||
                  !selectedServiceId ||
                  !selectedServiceDetailId ||
                  !selectedAddress
                }
                style={{ width: "100%" }}
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
                          {schedule.minute.toString().padStart(2, "0")} |{" "}
                          {
                            serviceDetails.find(
                              (d) =>
                                d.serviceDetailId === schedule.serviceDetailId
                            )?.minRoomSize
                          }
                          m² -{" "}
                          {
                            serviceDetails.find(
                              (d) =>
                                d.serviceDetailId === schedule.serviceDetailId
                            )?.maxSize
                          }
                          m²
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
    </>
  );
};

export default Time;
