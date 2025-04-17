import React, { useState, useEffect } from "react";
import { Button, Modal, message, Spin, Select, Input } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "../../components/combo-service/JobUpload.module.css"; // Adjust path as needed
import { BASE_URL } from "../../utils/config"; // Adjust path as needed
import addressDataJSON from "../../utils/address-data.json"; // Adjust path as needed

const { Option } = Select;

const AddressSelectionModal = ({
  isVisible,
  onCancel,
  onSelect,
  addresses = [],
  loading = false,
  onSetDefaultAddress,
  currentLocation,
  onAddressAdded,
}) => {
  const navigate = useNavigate();
  // State cho modal thêm địa chỉ mới
  const [isAddAddressModalVisible, setIsAddAddressModalVisible] =
    useState(false);
  // State để kiểm soát modal chính
  const [isMainModalVisible, setIsMainModalVisible] = useState(isVisible);

  // Cập nhật state modal chính khi prop isVisible thay đổi
  useEffect(() => {
    setIsMainModalVisible(isVisible);
  }, [isVisible]);

  // Form state for new address
  const [streetAddress, setStreetAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Load address data
  useEffect(() => {
    try {
      setAddressData(addressDataJSON);
    } catch (error) {
      console.error("Error loading address data:", error);
      message.error("Không thể tải dữ liệu địa chỉ.");
    }
  }, []);

  // Update districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const city = addressData.find((city) => city.code === selectedCity);
      if (city) {
        setDistricts(city.districts);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setWards([]);
      }
    }
  }, [selectedCity, addressData]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      const city = addressData.find((city) => city.code === selectedCity);
      if (city) {
        const district = city.districts.find(
          (district) => district.code === selectedDistrict
        );
        if (district) {
          setWards(district.wards);
          setSelectedWard(null);
        }
      }
    }
  }, [selectedDistrict, selectedCity, addressData]);

  // Format the full address from selections
  const formatFullAddress = () => {
    const cityName =
      addressData.find((city) => city.code === selectedCity)?.name || "";

    let districtName = "";
    if (selectedCity && selectedDistrict) {
      const city = addressData.find((city) => city.code === selectedCity);
      if (city) {
        districtName =
          city.districts.find((district) => district.code === selectedDistrict)
            ?.name || "";
      }
    }

    let wardName = "";
    if (selectedCity && selectedDistrict && selectedWard) {
      const city = addressData.find((city) => city.code === selectedCity);
      if (city) {
        const district = city.districts.find(
          (district) => district.code === selectedDistrict
        );
        if (district) {
          wardName =
            district.wards.find((ward) => ward.code === selectedWard)?.name ||
            "";
        }
      }
    }

    const parts = [streetAddress, wardName, districtName, cityName].filter(
      Boolean
    );
    return parts.join(", ");
  };

  // Hàm xử lý khi mở modal thêm địa chỉ mới
  const openAddAddressModal = () => {
    setIsMainModalVisible(false); // Ẩn modal chính
    setIsAddAddressModalVisible(true); // Hiện modal thêm địa chỉ
  };

  // Hàm xử lý khi đóng modal thêm địa chỉ
  const closeAddAddressModal = () => {
    setIsAddAddressModalVisible(false); // Ẩn modal thêm địa chỉ
    setIsMainModalVisible(true); // Hiện lại modal chính
  };

  // Hàm xử lý cancel cho modal chính
  const handleMainModalCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleAddAddress = async () => {
    if (
      !selectedCity ||
      !selectedDistrict ||
      !selectedWard ||
      !streetAddress.trim()
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    const fullAddress = formatFullAddress();

    setIsSubmitting(true);
    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");

    try {
      const response = await fetch(
        `${BASE_URL}/customer/${customerId}/create_address`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ address: fullAddress }),
        }
      );

      if (response.ok) {
        message.success("Thêm địa chỉ mới thành công!");

        // Reset form
        setSelectedCity(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setStreetAddress("");

        // Đóng modal thêm địa chỉ và mở lại modal chính
        setIsAddAddressModalVisible(false);
        setIsMainModalVisible(true);

        // Update address list
        if (onAddressAdded) {
          onAddressAdded();
        }
      } else {
        message.error("Không thể thêm địa chỉ mới.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setStreetAddress("");

    // Đóng modal thêm địa chỉ và mở lại modal chính
    closeAddAddressModal();
  };

  // Modal chính - Danh sách địa chỉ
  return (
    <>
      <Modal
        title="Danh sách địa chỉ"
        open={isMainModalVisible}
        onCancel={handleMainModalCancel}
        footer={null}
        className={styles.addressBookModal}
      >
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="small" tip="Đang tải..." />
          </div>
        ) : (
          <>
            <div
              className={styles.headerContainer}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div className={styles.addressBookHeader}>
                Quản lý thông tin địa chỉ của bạn
              </div>
              <Button
                type="primary"
                icon={<span>+</span>}
                className={styles.addAddressButton}
                onClick={openAddAddressModal}
                style={{ display: "flex", alignItems: "center" }}
              >
                Thêm địa chỉ mới
              </Button>
            </div>

            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div key={address.addressId} className={styles.addressItem}>
                  <div className={styles.addressInfo}>
                    <div className={styles.userName}>
                      {address.customer.full_name || "Người nhận"}
                      <span className={styles.phoneNumber}>
                        {address.customer.phone || "Không có số điện thoại"}
                      </span>
                      {address.isDefault && (
                        <span className={styles.defaultTag}>Mặc định</span>
                      )}
                    </div>
                    <div className={styles.address}>{address.address}</div>
                  </div>
                  <div className={styles.selectButtonContainer}>
                    <Button
                      className={styles.selectButton}
                      onClick={() => onSetDefaultAddress(address.addressId)}
                    >
                      Chọn địa chỉ mặc định
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Modal thêm địa chỉ mới */}
      <Modal
        title="Thêm địa chỉ mới"
        open={isAddAddressModalVisible}
        onCancel={closeAddAddressModal}
        footer={null}
        className={styles.addAddressModal}
      >
        <div className={styles.addAddressForm}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Tỉnh/Thành phố:
              </label>
              <Select
                placeholder="Chọn Tỉnh/Thành phố"
                style={{ width: "100%" }}
                value={selectedCity}
                onChange={(value) => setSelectedCity(value)}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {addressData.map((city) => (
                  <Option key={city.code} value={city.code}>
                    {city.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Quận/Huyện:
              </label>
              <Select
                placeholder="Chọn Quận/Huyện"
                style={{ width: "100%" }}
                value={selectedDistrict}
                onChange={(value) => setSelectedDistrict(value)}
                disabled={!selectedCity}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {districts.map((district) => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Phường/Xã:
              </label>
              <Select
                placeholder="Chọn Phường/Xã"
                style={{ width: "100%" }}
                value={selectedWard}
                onChange={(value) => setSelectedWard(value)}
                disabled={!selectedDistrict}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {wards.map((ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Địa chỉ chi tiết:
              </label>
              <Input.TextArea
                style={{
                  resize: "none",
                }}
                rows={3}
                placeholder="Số nhà, tên đường, tòa nhà..."
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <Button onClick={resetForm} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={handleAddAddress}
              loading={isSubmitting}
            >
              Hoàn thành
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddressSelectionModal;
