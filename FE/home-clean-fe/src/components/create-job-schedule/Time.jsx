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
  const [newDateTime, setNewDateTime] = useState(
    dayjs().add(30, "minute").second(0)
  );
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceNames, setServiceNames] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [highestAdjustment, setHighestAdjustment] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  useEffect(() => {
    if (selectedServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(selectedServices[0]);
    }
  }, [selectedServices, selectedServiceId]);

  useEffect(() => {
    const currentDayjs = dayjs();
    setCurrentTime(currentDayjs);

    const initialSchedules = {};
    selectedServices.forEach((serviceId) => {
      initialSchedules[serviceId] = [];
    });
    setServiceSchedules(initialSchedules);

    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);

    return () => clearInterval(timer);
  }, [selectedServices]);

  useEffect(() => {
    // Calculate total price and update highest adjustment
    const newTotalPrice = calculateTotalPrice(serviceSchedules);
    updateHighestAdjustment(serviceSchedules);
    // Update parent whenever serviceSchedules, selectedAddress, or totalPrice changes
    onTimeChange(
      serviceSchedules,
      highestAdjustment,
      selectedAddress,
      newTotalPrice
    );
  }, [serviceSchedules, selectedAddress]);

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleCloseErrorModal = () => {
    setErrorModalVisible(false);
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

  const calculateTotalPrice = (schedules) => {
    let total = 0;
    Object.keys(schedules).forEach((serviceId) => {
      schedules[serviceId].forEach((schedule) => {
        const detail = serviceDetails.find(
          (d) => d.serviceDetailId === schedule.serviceDetailId
        );
        if (detail) {
          let schedulePrice = detail.price;
          if (schedule.adjustment) {
            schedulePrice +=
              schedulePrice * (schedule.adjustment.percentage / 100);
          }
          total += schedulePrice;
        }
      });
    });
    setTotalPrice(total);
    return total;
  };

  const updateHighestAdjustment = (schedules) => {
    let highest = null;
    Object.keys(schedules).forEach((serviceId) => {
      schedules[serviceId].forEach((schedule) => {
        const adjustment = schedule.adjustment;
        if (
          adjustment &&
          (!highest || adjustment.percentage > highest.percentage)
        ) {
          highest = adjustment;
        }
      });
    });
    setHighestAdjustment(highest);
  };

  const handleDateTimeChange = (date) => {
    if (!date) {
      setNewDateTime(dayjs().add(15, "minute").second(0));
      return;
    }

    const selectedDateTime = date;
    const now = dayjs().startOf("day");

    if (selectedDateTime.isBefore(now)) {
      showErrorModal("Không thể chọn ngày trong quá khứ!");
      setNewDateTime(dayjs().add(15, "minute").second(0));
      return;
    }

    const isToday = selectedDateTime.isSame(dayjs(), "day");
    if (isToday && selectedDateTime.isBefore(currentTime.add(15, "minute"))) {
      const defaultTime = currentTime.add(30, "minute").second(0);
      setNewDateTime(defaultTime);
      showErrorModal(
        "Thời gian đã chọn quá gần hoặc trong quá khứ. Đã tự động điều chỉnh thành thời gian hiện tại + 15 phút."
      );
    } else {
      setNewDateTime(selectedDateTime.second(0));
    }
  };

  const handlePickerOpenChange = (open) => {
    setPickerOpen(open);
    if (!open && !newDateTime) {
      setNewDateTime(dayjs().add(30, "minute").second(0));
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
    if (!newDateTime) {
      showErrorModal("Vui lòng chọn ngày và giờ!");
      return;
    }

    if (newDateTime.isBefore(currentTime.add(30, "minute"))) {
      showErrorModal("Không thể đặt lịch cho thời gian đã qua hoặc quá gần!");
      return;
    }

    const newSchedule = {
      jobTime: newDateTime.format("YYYY-MM-DDTHH:mm:ss"),
      hour: newDateTime.hour(),
      minute: newDateTime.minute(),
      date: newDateTime.toDate(),
      adjustment: calculatePriceAdjustment(
        newDateTime.toDate(),
        newDateTime.hour()
      ),
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

    // Recalculate total price and highest adjustment
    const newTotalPrice = calculateTotalPrice(newServiceSchedules);
    updateHighestAdjustment(newServiceSchedules);

    // Update parent
    onTimeChange(
      newServiceSchedules,
      highestAdjustment,
      selectedAddress,
      newTotalPrice
    );

    // Reset form
    setNewDateTime(dayjs().add(30, "minute").second(0));
    setSelectedServiceDetailId(null);
  };

  const removeSchedule = (serviceId, index) => {
    const newSchedules = {
      ...serviceSchedules,
      [serviceId]: serviceSchedules[serviceId].filter((_, i) => i !== index),
    };
    setServiceSchedules(newSchedules);

    // Recalculate total price and highest adjustment
    const newTotalPrice = calculateTotalPrice(newSchedules);
    updateHighestAdjustment(newSchedules);

    // Update parent
    onTimeChange(
      newSchedules,
      highestAdjustment,
      selectedAddress,
      newTotalPrice
    );
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (current) => {
    if (!current || !current.isSame(dayjs(), "day")) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }
    const cutoffTime = currentTime.add(30, "minute");
    const disabledHours = Array.from(
      { length: cutoffTime.hour() },
      (_, i) => i
    );
    const disabledMinutes =
      current.hour() === cutoffTime.hour()
        ? Array.from({ length: cutoffTime.minute() }, (_, i) => i)
        : [];
    return {
      disabledHours: () => disabledHours,
      disabledMinutes: () => disabledMinutes,
      disabledSeconds: () => [],
    };
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
        message.success("Đã đặt địa chỉ mặc định mới");
      } else {
        console.error("Address not found for addressId:", addressId);
        message.error("Không tìm thấy địa chỉ được chọn!");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
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
              <Title level={5}>Ngày và giờ</Title>
              <DatePicker
                format="DD/MM/YYYY HH:mm"
                showTime={{
                  format: "HH:mm",
                  hideDisabledOptions: true,
                }}
                onChange={handleDateTimeChange}
                onOpenChange={handlePickerOpenChange}
                disabledDate={disabledDate}
                disabledTime={disabledTime}
                placeholder="Chọn ngày và giờ"
                className={styles.datePicker}
                size="large"
                value={newDateTime}
                showNow={false}
                style={{ width: "100%" }}
                allowClear={true}
                needConfirm={false}
              />
              <Button
                type="primary"
                onClick={addSchedule}
                disabled={
                  !newDateTime ||
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
              <Paragraph className={styles.emptyState}>
                Chưa có lịch trình nào được thêm.
              </Paragraph>
            ) : (
              <>
                {Object.keys(serviceSchedules)
                  .filter((serviceId) => serviceSchedules[serviceId].length > 0)
                  .map((serviceId) => (
                    <div key={serviceId} className={styles.serviceSection}>
                      <Title level={5} className={styles.serviceTitle}>
                        {getServiceName(serviceId)}
                      </Title>
                      {serviceSchedules[serviceId].map((schedule, index) => {
                        const detail = serviceDetails.find(
                          (d) => d.serviceDetailId === schedule.serviceDetailId
                        );
                        const basePrice = detail?.price || 0;
                        const adjustedPrice = schedule.adjustment
                          ? basePrice +
                            basePrice * (schedule.adjustment.percentage / 100)
                          : basePrice;
                        return (
                          <Card
                            key={index}
                            className={styles.scheduleCard}
                            style={{ marginBottom: "10px" }}
                            actions={[
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeSchedule(serviceId, index)}
                                className={styles.deleteButton}
                                aria-label={`Xóa lịch trình ${dayjs(
                                  schedule.date
                                ).format("DD/MM/YYYY")} - ${schedule.hour
                                  .toString()
                                  .padStart(2, "0")}:${schedule.minute
                                  .toString()
                                  .padStart(2, "0")} cho ${getServiceName(
                                  serviceId
                                )}`}
                              >
                                Xóa
                              </Button>,
                            ]}
                          >
                            <div className={styles.scheduleContent}>
                              <Space
                                direction="vertical"
                                size="small"
                                style={{ width: "100%" }}
                              >
                                <Text strong className={styles.scheduleDate}>
                                  {dayjs(schedule.date).format("DD/MM/YYYY")} -{" "}
                                  {schedule.hour.toString().padStart(2, "0")}:
                                  {schedule.minute.toString().padStart(2, "0")}
                                </Text>
                                <Text>
                                  Diện tích: {detail?.minRoomSize}m² -{" "}
                                  {detail?.maxSize}m²
                                </Text>
                                <div className={styles.priceInfo}>
                                  <div className={styles.priceRow}>
                                    <Text strong>
                                      Giá cơ bản:{" "}
                                      <Text>
                                        {basePrice.toLocaleString()} VNĐ
                                      </Text>
                                    </Text>
                                  </div>
                                  {schedule.adjustment && (
                                    <div className={styles.priceRow}>
                                      <Text strong>
                                        Phụ phí:{" "}
                                        <Text style={{ color: "#ff4d4f" }}>
                                          +{schedule.adjustment.percentage}% do{" "}
                                          {schedule.adjustment.reason}
                                        </Text>
                                      </Text>
                                    </div>
                                  )}
                                  <div className={styles.priceRow}>
                                    <Text strong>
                                      Tổng:{" "}
                                      {Math.round(
                                        adjustedPrice
                                      ).toLocaleString()}{" "}
                                      VNĐ
                                    </Text>
                                  </div>
                                </div>
                              </Space>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ))}
              </>
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
