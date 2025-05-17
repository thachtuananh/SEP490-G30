import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Radio, Button, message, Spin } from "antd";
import styles from "../../components/combo-service/JobUpload.module.css";
import ServiceSelectionModal from "../../components/combo-service/ServiceSelectionModal";
import AddressSelectionModal from "../../components/combo-service/AddressSelectionModal"; // Import the new component
import { AuthContext } from "../../context/AuthContext";
import { fetchServiceDetails, createJob } from "../../services/owner/OwnerAPI";
import {
  fetchCustomerAddresses,
  setDefaultAddress,
} from "../../services/owner/OwnerAddressAPI";

const ServiceDetailsCombo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedServices: initialSelectedServices, allServices } =
    location.state || { selectedServices: [], allServices: [] };
  const { token, customerId } = useContext(AuthContext);

  const [selectedServices, setSelectedServices] = useState(
    initialSelectedServices || []
  );
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [servicesDetails, setServicesDetails] = useState([]);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [servicePrices, setServicePrices] = useState({});
  const [serviceSizes, setServiceSizes] = useState({});

  // Function to fetch customer addresses
  const loadCustomerAddresses = async () => {
    try {
      if (customerId) {
        const rawAddressesData = await fetchCustomerAddresses(customerId);

        // Map the API response fields to the expected format
        const addressesData = rawAddressesData.map((addr) => ({
          addressId: addr.id,
          customer: addr.customer,
          address: addr.address,
          isDefault: addr.current,
        }));

        setCustomerAddresses(addressesData);

        // Set default address if no address is selected yet
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

  // Fetch service details and customer addresses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customer addresses
        await loadCustomerAddresses();

        // Fetch service details for selected services
        const detailsPromises = selectedServices.map((serviceId) =>
          fetchServiceDetails(serviceId)
        );
        const detailsResults = await Promise.all(detailsPromises);

        setServicesDetails(detailsResults);

        // Initialize service prices and sizes based on API response
        const prices = {};
        const sizes = {};

        detailsResults.forEach((serviceData, index) => {
          const serviceId = selectedServices[index];

          // Check if service has details
          if (
            serviceData &&
            serviceData.serviceDetails &&
            serviceData.serviceDetails.length > 0
          ) {
            // Default to the first size option (smallest range)
            const defaultDetail = serviceData.serviceDetails[0];
            prices[serviceId] = defaultDetail.price;
            sizes[serviceId] = defaultDetail.serviceDetailId;

            // Set the default form value to the serviceDetailId instead of "small/medium/large"
            form.setFieldsValue({
              [`area_${serviceId}`]: defaultDetail.serviceDetailId,
            });
          } else {
            // Fallback if no details
            prices[serviceId] = serviceData?.basePrice || 170000;
            sizes[serviceId] = "default";
            form.setFieldsValue({ [`area_${serviceId}`]: "default" });
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

  // Update service price when size changes
  const handleSizeChange = (serviceId, serviceDetailId) => {
    // Find the service in the details
    const serviceData = servicesDetails.find((s) => s.serviceId === serviceId);

    if (
      serviceData &&
      serviceData.serviceDetails &&
      serviceData.serviceDetails.length > 0
    ) {
      // Find the specific service detail by its ID
      const selectedDetail = serviceData.serviceDetails.find(
        (detail) => detail.serviceDetailId === serviceDetailId
      );

      if (selectedDetail) {
        // Set the price from the selected detail
        setServicePrices({
          ...servicePrices,
          [serviceId]: selectedDetail.price,
        });

        // Store the serviceDetailId instead of size name
        setServiceSizes({
          ...serviceSizes,
          [serviceId]: serviceDetailId,
        });
      }
    }
  };

  // Find service details based on ID
  const getServiceDetails = (serviceId) => {
    return allServices.find((service) => service.id === serviceId);
  };

  const onServiceChange = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (!selectedAddress) {
        message.error("Vui lòng chọn địa chỉ!");
        return;
      }

      if (selectedServices.length === 0) {
        message.error("Vui lòng chọn ít nhất một dịch vụ!");
        return;
      }

      // Navigate to create job page with all necessary details
      navigate("/createjob", {
        state: {
          selectedServices,
          serviceDetails: selectedServices.map((serviceId) => {
            const serviceData = servicesDetails.find(
              (s) => s.serviceId === serviceId
            );
            let selectedDetail = serviceData?.serviceDetails?.find(
              (detail) => detail.serviceDetailId === serviceSizes[serviceId]
            );

            return {
              serviceId,
              serviceDetailId: selectedDetail?.serviceDetailId || null, // ✅ Thêm serviceDetailId vào
              serviceName: serviceData?.serviceName || `Dịch vụ ${serviceId}`,
              price: servicePrices[serviceId],
              selectedSize: selectedDetail
                ? `${selectedDetail.minRoomSize}`
                : "0",
              maxSize: selectedDetail ? `${selectedDetail.maxRoomSize}` : "20",
            };
          }),
          address: selectedAddress.address,
          customerAddressId: selectedAddress.addressId,
          price: calculateTotalPrice(),
        },
      });
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Helper functions for size display
  const getSelectedSizeText = (size) => {
    switch (size) {
      case "small":
        return "0";
      case "medium":
        return "20";
      case "large":
        return "40";
      default:
        return "0";
    }
  };

  const getMaxSizeText = (size) => {
    switch (size) {
      case "small":
        return "20";
      case "medium":
        return "40";
      case "large":
        return "60";
      default:
        return "20";
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const showServiceModal = () => {
    setIsServiceModalVisible(true);
  };

  const handleServiceCancel = () => {
    setIsServiceModalVisible(false);
  };

  const handleServiceOk = () => {
    if (selectedServices.length === 0) {
      message.error("Vui lòng chọn ít nhất một dịch vụ!");
      return;
    }
    setIsServiceModalVisible(false);
  };

  // Handle location modal
  const showLocationModal = async () => {
    // Reload addresses when opening the modal
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

  // Handle setting default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      if (!addressId) {
        console.error("Invalid address ID:", addressId);
        message.error("Địa chỉ không hợp lệ");
        return;
      }

      setAddressLoading(true);
      await setDefaultAddress(customerId, addressId);

      // Thay vì gọi lại API, chỉ cập nhật trạng thái địa chỉ cục bộ
      setCustomerAddresses((prevAddresses) => {
        return prevAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.addressId === addressId,
        }));
      });

      // Cập nhật địa chỉ được chọn nếu cần
      const updatedDefaultAddress = customerAddresses.find(
        (addr) => addr.addressId === addressId
      );
      if (updatedDefaultAddress) {
        // Nếu đây không phải địa chỉ đang được chọn, cập nhật nó
        if (!selectedAddress || selectedAddress.addressId !== addressId) {
          const updatedAddress = {
            ...updatedDefaultAddress,
            isDefault: true,
          };
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
    return Object.values(servicePrices).reduce(
      (total, price) => total + price,
      0
    );
  };

  // if (loading) {
  //   return (
  //     <div className={styles.loadingContainer}>
  //       <Spin size="large" tip="Đang tải..." />
  //     </div>
  //   );
  // }

  return (
    <div className={styles.pageContainerCombo}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>Điền thông tin dịch vụ</h1>
      </div>

      <div className={styles.serviceDetailsContainer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ location: selectedAddress?.address || "" }}
        >
          <Form.Item
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
          </Form.Item>

          <div>
            <div className={styles.serviceHeaderText}>Dịch vụ chọn</div>

            {selectedServices.map((serviceId) => {
              const service = getServiceDetails(serviceId);
              const serviceData = servicesDetails.find(
                (s) => s.serviceId === serviceId
              );

              return (
                <div key={serviceId} className={styles.selectedServiceItem}>
                  <div className={styles.selectedServiceHeader}>
                    <span>
                      {service?.title ||
                        serviceData?.serviceName ||
                        `Dịch vụ ${serviceId}`}
                    </span>
                    <Button
                      type="text"
                      danger
                      icon={<span>🗑️</span>}
                      onClick={() => onServiceChange(serviceId)}
                    />
                  </div>
                  <div className={styles.serviceAreaSelection}>
                    <div>Diện tích</div>
                    <Form.Item name={`area_${serviceId}`} noStyle>
                      {serviceData &&
                      serviceData.serviceDetails &&
                      serviceData.serviceDetails.length > 0 ? (
                        <Radio.Group
                          onChange={(e) =>
                            handleSizeChange(serviceId, e.target.value)
                          }
                          defaultValue={
                            serviceData.serviceDetails[0].serviceDetailId
                          }
                        >
                          {serviceData.serviceDetails.map((detail) => (
                            <Radio.Button
                              key={detail.serviceDetailId}
                              value={detail.serviceDetailId}
                            >
                              {`${detail.minRoomSize}m² - ${detail.maxRoomSize}m²`}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      ) : (
                        <Radio.Group defaultValue="default">
                          <Radio.Button value="default">
                            {"< 20m²"}
                          </Radio.Button>
                        </Radio.Group>
                      )}
                    </Form.Item>
                    <div className={styles.servicePrice}>
                      Giá dịch vụ
                      <div className={styles.servicePriceValue}>
                        {servicePrices[serviceId]?.toLocaleString()} đ
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className={styles.addMoreService}>
              <Button type="dashed" onClick={showServiceModal} block>
                Thêm dịch vụ +
              </Button>
            </div>

            <div className={styles.totalPrice}>
              <div>Tổng giá</div>
              <div className={styles.totalPriceValue}>
                {calculateTotalPrice().toLocaleString()} đ
              </div>
            </div>
            {/* <div className={styles.priceNote}>Giá đã bao gồm VAT</div> */}
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

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isVisible={isServiceModalVisible}
        onCancel={handleServiceCancel}
        onOk={handleServiceOk}
        selectedServices={selectedServices}
        onServiceChange={onServiceChange}
        allServices={allServices}
      />

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isVisible={isLocationModalVisible}
        onCancel={handleLocationCancel}
        onSelect={handleLocationSelect}
        addresses={customerAddresses}
        loading={addressLoading}
        onSetDefaultAddress={handleSetDefaultAddress}
        currentLocation={location.pathname}
      />
    </div>
  );
};

export default ServiceDetailsCombo;
