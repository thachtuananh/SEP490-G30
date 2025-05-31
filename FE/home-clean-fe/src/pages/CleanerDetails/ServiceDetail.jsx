import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Select, Button, message, Spin, Table, InputNumber } from "antd";
import styles from "../../components/combo-service/JobUpload.module.css";
import AddressSelectionModal from "../../components/combo-service/AddressSelectionModal";
import { AuthContext } from "../../context/AuthContext";
import { fetchServiceDetails, createJob } from "../../services/owner/OwnerAPI";
import {
  fetchCustomerAddresses,
  setDefaultAddress,
} from "../../services/owner/OwnerAddressAPI";
import { BASE_URL } from "../../utils/config";

const { Option } = Select;

const ServiceDetailsCombo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedServices: initialSelectedServices } = location.state || {
    selectedServices: [],
  };
  const { token, customerId } = useContext(AuthContext);

  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(
    initialSelectedServices.map((id) => ({
      serviceId: id,
      quantity: 1,
      serviceDetailId: null,
    })) || []
  );
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [servicesDetails, setServicesDetails] = useState([]);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [servicePrices, setServicePrices] = useState({});
  const [serviceSizes, setServiceSizes] = useState({});
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedServiceDetailId, setSelectedServiceDetailId] = useState(null);
  const cleanerId = location.state?.cleanerId;
  const cleanerName = location.state?.cleanerName;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/services/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched services:", data);
        // Filter out duplicate service IDs
        const uniqueServices = data.filter(
          (service, index, self) =>
            index === self.findIndex((s) => s.serviceId === service.serviceId)
        );
        setAllServices(uniqueServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Không thể tải dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  const loadCustomerAddresses = async () => {
    try {
      if (customerId) {
        const rawAddressesData = await fetchCustomerAddresses(customerId);
        const addressesData = rawAddressesData.map((addr) => ({
          addressId: addr.id,
          customer: addr.customer,
          address: addr.address,
          isDefault: addr.current,
        }));
        setCustomerAddresses(addressesData);
        if (!selectedAddress) {
          const defaultAddress =
            addressesData.find((addr) => addr.isDefault) || addressesData[0];
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            form.setFieldsValue({ location: defaultAddress.address });
          }
        }
        return addressesData;
      }
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
      message.error("Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.");
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // await loadCustomerAddresses();
        const detailsPromises = selectedServices.map((item) =>
          fetchServiceDetails(item.serviceId)
        );
        const detailsResults = await Promise.all(detailsPromises);
        setServicesDetails(detailsResults);

        const prices = {};
        const sizes = {};
        detailsResults.forEach((serviceData, index) => {
          const serviceId = selectedServices[index].serviceId;
          const selectedDetailId = selectedServices[index].serviceDetailId;
          if (
            serviceData &&
            serviceData.serviceDetails &&
            serviceData.serviceDetails.length > 0
          ) {
            const detail = selectedDetailId
              ? serviceData.serviceDetails.find(
                  (d) => d.serviceDetailId === selectedDetailId
                )
              : serviceData.serviceDetails[0];
            prices[serviceId] = detail.price;
            sizes[serviceId] = detail.serviceDetailId;
            form.setFieldsValue({
              [`area_${serviceId}_${index}`]: detail.serviceDetailId,
            });
          } else {
            prices[serviceId] = serviceData?.basePrice || 120000;
            sizes[serviceId] = null;
            form.setFieldsValue({ [`area_${serviceId}_${index}`]: null });
          }
        });
        setServicePrices(prices);
        setServiceSizes(sizes);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId, selectedServices]);

  const handleSizeChange = (serviceId, serviceDetailId, index) => {
    const serviceData = servicesDetails.find((s) => s.serviceId === serviceId);
    if (
      serviceData &&
      serviceData.serviceDetails &&
      serviceData.serviceDetails.length > 0
    ) {
      const selectedDetail = serviceData.serviceDetails.find(
        (detail) => detail.serviceDetailId === serviceDetailId
      );
      if (selectedDetail) {
        setServicePrices({
          ...servicePrices,
          [serviceId]: selectedDetail.price,
        });
        setServiceSizes({
          ...serviceSizes,
          [serviceId]: serviceDetailId,
        });
        if (index !== undefined) {
          setSelectedServices((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], serviceDetailId };
            return updated;
          });
        }
      }
    }
  };

  const handleQuantityChange = (index, value) => {
    setSelectedServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: value };
      return updated;
    });
  };

  const handleDuplicateService = (index) => {
    setSelectedServices((prev) => {
      const serviceToDuplicate = prev[index];
      const existingServiceIndex = prev.findIndex(
        (item) =>
          item.serviceId === serviceToDuplicate.serviceId &&
          item.serviceDetailId === serviceToDuplicate.serviceDetailId
      );

      if (existingServiceIndex !== -1) {
        // If service with same serviceId and serviceDetailId exists, increment quantity
        const updated = [...prev];
        updated[existingServiceIndex] = {
          ...updated[existingServiceIndex],
          quantity: updated[existingServiceIndex].quantity + 1,
        };
        return updated;
      } else {
        // If no matching service, duplicate as a new entry
        return [...prev, { ...serviceToDuplicate, quantity: 1 }];
      }
    });
  };

  const handleRemoveService = (index) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    setSelectedServiceDetailId(null);
    if (serviceId) {
      const serviceData = allServices.find((s) => s.serviceId === serviceId);
      if (serviceData?.serviceDetails?.length > 0) {
        const defaultDetail = serviceData.serviceDetails[0];
        setSelectedServiceDetailId(defaultDetail.serviceDetailId); // Set default detail
        form.setFieldsValue({ area: defaultDetail.serviceDetailId }); // Update form field
        setServicePrices((prev) => ({
          ...prev,
          [serviceId]: defaultDetail.price,
        }));
      } else {
        form.setFieldsValue({ area: null }); // Clear area field if no details
        setServicePrices((prev) => ({
          ...prev,
          [serviceId]: serviceData?.basePrice || 120000,
        }));
      }
    } else {
      form.setFieldsValue({ area: null }); // Clear area field if no service selected
    }
  };

  const handleAddService = () => {
    if (!selectedServiceId) {
      message.error("Vui lòng chọn một dịch vụ!");
      return;
    }
    setSelectedServices((prev) => {
      const existingServiceIndex = prev.findIndex(
        (item) =>
          item.serviceId === selectedServiceId &&
          item.serviceDetailId === selectedServiceDetailId
      );
      if (existingServiceIndex !== -1) {
        // Increment quantity if service exists
        const updated = [...prev];
        updated[existingServiceIndex] = {
          ...updated[existingServiceIndex],
          quantity: updated[existingServiceIndex].quantity + 1,
        };

        return updated;
      } else {
        // Add new service
        const newService = {
          serviceId: selectedServiceId,
          serviceDetailId: selectedServiceDetailId,
          quantity: 1,
        };
        return [...prev, newService];
      }
    });
    setSelectedServiceId(null);
    setSelectedServiceDetailId(null);
    form.setFieldsValue({ service: null, area: null });
  };

  const handleAddressAdded = async () => {
    await loadCustomerAddresses();
  };

  const getServiceDetails = (serviceId) => {
    return allServices.find((service) => service.serviceId === serviceId);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      // if (!selectedAddress) {
      //   message.error("Vui lòng chọn địa chỉ!");
      //   return;
      // }
      if (selectedServices.length === 0) {
        message.error("Vui lòng chọn ít nhất một dịch vụ!");
        return;
      }
      navigate("/createjobtocleaner", {
        state: {
          cleanerId: cleanerId,
          cleanerName: cleanerName,
          selectedServices: selectedServices.map((item) => item.serviceId),
          serviceDetails: selectedServices.map((item, index) => {
            const serviceData = servicesDetails.find(
              (s) => s.serviceId === item.serviceId
            );
            const selectedDetail = serviceData?.serviceDetails?.find(
              (detail) => detail.serviceDetailId === item.serviceDetailId
            );
            const serviceAll = allServices.find(
              (s) => s.serviceId === item.serviceId
            );
            return {
              serviceId: item.serviceId,
              serviceDetailId: item.serviceDetailId || null,
              serviceName:
                serviceData?.serviceName ||
                serviceAll?.serviceName ||
                `Dịch vụ ${item.serviceId}`,
              price: servicePrices[item.serviceId] * item.quantity,
              selectedSize: selectedDetail.minRoomSize,
              maxSize: selectedDetail.maxRoomSize,
              quantity: item.quantity,
            };
          }),
          // address: selectedAddress.address,
          // customerAddressId: selectedAddress.addressId,
          price: calculateTotalPrice(),
        },
      });
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const showLocationModal = async () => {
    setAddressLoading(true);
    setIsLocationModalVisible(true);
    await loadCustomerAddresses();
    setAddressLoading(false);
  };

  const handleLocationCancel = () => {
    setIsLocationModalVisible(false);
  };

  const handleLocationSelect = (address) => {
    setSelectedAddress(address);
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
      setCustomerAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.addressId === addressId,
        }))
      );
      const updatedDefaultAddress = customerAddresses.find(
        (addr) => addr.addressId === addressId
      );
      if (updatedDefaultAddress) {
        if (!selectedAddress || selectedAddress.addressId !== addressId) {
          const updatedAddress = { ...updatedDefaultAddress, isDefault: true };
          setSelectedAddress(updatedAddress);
          form.setFieldsValue({ location: updatedAddress.address });
        }
      }
      message.success("Đã đặt địa chỉ mặc định mới");
    } catch (error) {
      console.error("Error setting default address:", error);
      message.error("Không thể đặt địa chỉ mặc định");
    } finally {
      setAddressLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, item) => {
      const price = servicePrices[item.serviceId] || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: "5%",
    },
    {
      title: "Tên dịch vụ",
      render: (_, record) => {
        const service = getServiceDetails(record.serviceId);
        const serviceData = servicesDetails.find(
          (s) => s.serviceId === record.serviceId
        );
        return (
          service?.serviceName ||
          serviceData?.serviceName ||
          `Dịch vụ ${record.serviceId}`
        );
      },
    },
    {
      title: "Diện tích",
      render: (_, record, index) => {
        const serviceData = servicesDetails.find(
          (s) => s.serviceId === record.serviceId
        );
        return (
          <Form.Item name={`area_${record.serviceId}_${index}`} noStyle>
            <Select
              style={{ width: 150 }}
              onChange={(value) =>
                handleSizeChange(record.serviceId, value, index)
              }
              // value={record.serviceDetailId}
              value={selectedServiceDetailId}
              disabled={!serviceData?.serviceDetails?.length}
            >
              {serviceData &&
              serviceData.serviceDetails &&
              serviceData.serviceDetails.length > 0
                ? serviceData.serviceDetails.map((detail) => (
                    <Option
                      key={detail.serviceDetailId}
                      value={detail.serviceDetailId}
                    >
                      {`${detail.minRoomSize} - ${detail.maxRoomSize} m²`}
                    </Option>
                  ))
                : null}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: "Số lượng",
      render: (_, __, index) => (
        <InputNumber
          min={1}
          value={selectedServices[index].quantity}
          onChange={(value) => handleQuantityChange(index, value)}
        />
      ),
    },
    {
      title: "Số tiền",
      render: (_, record) =>
        (servicePrices[record.serviceId] * record.quantity).toLocaleString() +
        " đ",
    },
    {
      title: "Thao tác",
      render: (_, __, index) => (
        <div>
          <Button
            type="primary"
            onClick={() => handleDuplicateService(index)}
            style={{ marginRight: 8 }}
          >
            Thêm
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleRemoveService(index)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const selectedServiceDetails = allServices.find(
    (s) => s.serviceId === selectedServiceId
  );

  return (
    <div className={styles.pageContainerCombo}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>Lựa chọn dịch vụ</h1>
      </div>

      <div className={styles.serviceDetailsContainer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ location: selectedAddress?.address || "" }}
        >
          {/* <Form.Item
            name="location"
            label="Chọn địa chỉ"
            rules={[{ required: true, message: "Vui lòng chọn địa chỉ!" }]}
          >
            <div className={styles.locationSelectorContainer}>
              <div className={styles.locationDisplay}>
                {form.getFieldValue("location") || "Chưa chọn địa chỉ"}
              </div>
              <Button
                type="primary"
                onClick={showLocationModal}
                className={styles.locationButton}
              >
                <div className={styles.buttonContent}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 13.5C13.933 13.5 15.5 11.933 15.5 10C15.5 8.067 13.933 6.5 12 6.5C10.067 6.5 8.5 8.067 8.5 10C8.5 11.933 10.067 13.5 12 13.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 21C16 17 20 13.4183 20 10C20 6.13401 16.4183 3 12 3C7.58172 3 4 6.13401 4 10C4 13.4183 8 17 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Chọn địa chỉ</span>
                </div>
              </Button>
            </div>
          </Form.Item> */}

          <div>
            {/* <div className={styles.serviceHeaderText}>Dịch vụ chọn</div> */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: 16,
                width: "100%",
              }}
            >
              <Form.Item name="service" noStyle>
                <Select
                  style={{ width: "45%" }}
                  placeholder="Chọn dịch vụ"
                  onChange={handleServiceSelect}
                  allowClear
                  value={selectedServiceId}
                >
                  {allServices.map((service) => (
                    <Option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName || `Dịch vụ ${service.serviceId}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="area" noStyle>
                <Select
                  style={{ width: "45%" }}
                  placeholder="Chọn diện tích"
                  onChange={setSelectedServiceDetailId}
                  value={selectedServiceDetailId}
                  disabled={!selectedServiceDetails?.serviceDetails?.length}
                >
                  {selectedServiceDetails &&
                  selectedServiceDetails.serviceDetails &&
                  selectedServiceDetails.serviceDetails.length > 0
                    ? selectedServiceDetails.serviceDetails.map((detail) => (
                        <Option
                          key={detail.serviceDetailId}
                          value={detail.serviceDetailId}
                        >
                          {`${detail.minRoomSize} - ${detail.maxRoomSize} m²`}
                        </Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
              <Button
                style={{ width: "10%" }}
                type="primary"
                onClick={handleAddService}
                disabled={
                  !selectedServiceId || // No service selected
                  (selectedServiceDetails?.serviceDetails?.length > 0 &&
                    !selectedServiceDetailId) // Service has details but no detail selected
                }
              >
                Thêm
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={selectedServices}
              rowKey={(record, index) => `${record.serviceId}_${index}`}
              pagination={false}
            />
            <div className={styles.totalPrice}>
              <div>Tổng giá</div>
              <div className={styles.totalPriceValue}>
                {calculateTotalPrice().toLocaleString()} đ
              </div>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <Button onClick={handleGoBack} className={styles.backButton}>
              Quay lại
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className={styles.continueButton}
            >
              Tiếp tục
            </Button>
          </div>
        </Form>
      </div>

      <AddressSelectionModal
        isVisible={isLocationModalVisible}
        onCancel={handleLocationCancel}
        onSelect={handleLocationSelect}
        addresses={customerAddresses}
        loading={addressLoading}
        onSetDefaultAddress={handleSetDefaultAddress}
        currentLocation={location.pathname}
        onAddressAdded={handleAddressAdded}
      />
    </div>
  );
};

export default ServiceDetailsCombo;
