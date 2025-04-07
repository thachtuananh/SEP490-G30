import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { message, Modal, Input, Button, Select } from "antd";
import { BASE_URL } from "../../../utils/config";
import "../owner/profile.css";
// Import the address data from external JSON file
import addressDataJSON from "../../../utils/address-data.json";

const { Option } = Select;

export const Address = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);

  // Address selection state
  const [addressData, setAddressData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [streetAddress, setStreetAddress] = useState("");

  // Districts and wards based on selection
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const loadAddressData = () => {
    try {
      // Use the imported JSON data
      setAddressData(addressDataJSON);
    } catch (error) {
      console.error("Error loading address data:", error);
      message.error("Không thể tải dữ liệu địa chỉ.");
    }
  };

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    if (token && customerId) {
      try {
        const response = await fetch(
          `${BASE_URL}/customer/${customerId}/addresses`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const responseData = await response.json();

          // Handle the new API response format
          // The API now returns an array of address objects directly
          const formattedAddresses = responseData.map((item) => ({
            id: item.id, // Using the actual ID from the response
            address: item.address,
            isDefault: item.is_current,
            name: item.customer?.full_name || user?.name || "",
            phone: item.customer?.phone || user?.phone || "",
          }));

          setAddresses(formattedAddresses);
        } else {
          message.error("Không thể lấy danh sách địa chỉ.");
        }
      } catch (error) {
        message.error("Lỗi máy chủ, vui lòng thử lại sau.");
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
    loadAddressData();
  }, [dispatch]);

  // Update districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const city = addressData.find((city) => city.code === selectedCity);
      if (city) {
        setDistricts(city.districts);
        // Don't reset selectedDistrict here to allow pre-filling to work
        if (!selectedDistrict) {
          setSelectedWard(null);
          setWards([]);
        }
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
          // Don't reset selectedWard here to allow pre-filling to work
        }
      }
    }
  }, [selectedDistrict, selectedCity, addressData]);

  const resetAddressForm = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setStreetAddress("");
  };

  const showModal = () => {
    setIsModalVisible(true);
    resetAddressForm();
  };

  // Improved parsing logic for address components
  const findCityByName = (cityName) => {
    if (!cityName) return null;
    const normalizedCityName = cityName.toLowerCase().trim();
    return addressData.find(
      (city) =>
        city.name.toLowerCase().includes(normalizedCityName) ||
        normalizedCityName.includes(city.name.toLowerCase())
    );
  };

  const findDistrictByName = (cityCode, districtName) => {
    if (!cityCode || !districtName) return null;
    const city = addressData.find((city) => city.code === cityCode);
    if (!city) return null;

    const normalizedDistrictName = districtName.toLowerCase().trim();
    return city.districts.find(
      (district) =>
        district.name.toLowerCase().includes(normalizedDistrictName) ||
        normalizedDistrictName.includes(district.name.toLowerCase())
    );
  };

  const findWardByName = (cityCode, districtCode, wardName) => {
    if (!cityCode || !districtCode || !wardName) return null;
    const city = addressData.find((city) => city.code === cityCode);
    if (!city) return null;

    const district = city.districts.find(
      (district) => district.code === districtCode
    );
    if (!district) return null;

    const normalizedWardName = wardName.toLowerCase().trim();
    return district.wards.find(
      (ward) =>
        ward.name.toLowerCase().includes(normalizedWardName) ||
        normalizedWardName.includes(ward.name.toLowerCase())
    );
  };

  const parseAddress = (address) => {
    // Expected format "Street Address, Ward, District, City"
    const addressParts = address.split(", ");
    if (addressParts.length < 2) return { streetAddress: address };

    // Try different parsing approaches - starting from the end which is usually City
    const possibleCity = addressParts[addressParts.length - 1];
    const possibleDistrict = addressParts[addressParts.length - 2];
    const possibleWard =
      addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null;

    // The remaining parts are the street address
    const streetParts = addressParts.slice(
      0,
      Math.max(1, addressParts.length - 3)
    );
    const streetAddress = streetParts.join(", ");

    return {
      cityName: possibleCity,
      districtName: possibleDistrict,
      wardName: possibleWard,
      streetAddress: streetAddress || addressParts[0], // Fallback
    };
  };

  const showUpdateModal = async (addressId, currentAddress) => {
    setIsUpdateModalVisible(true);
    setCurrentAddressId(addressId);

    try {
      // Parse the current address
      const {
        cityName,
        districtName,
        wardName,
        streetAddress: parsedStreet,
      } = parseAddress(currentAddress);

      // Pre-fill the street address
      setStreetAddress(parsedStreet || currentAddress);

      // Find matching data for dropdowns
      const cityObj = findCityByName(cityName);
      if (cityObj) {
        setSelectedCity(cityObj.code);

        // Wait for districts to update based on city selection
        setTimeout(() => {
          const districtObj = findDistrictByName(cityObj.code, districtName);
          if (districtObj) {
            setSelectedDistrict(districtObj.code);

            // Wait for wards to update based on district selection
            setTimeout(() => {
              const wardObj = findWardByName(
                cityObj.code,
                districtObj.code,
                wardName
              );
              if (wardObj) {
                setSelectedWard(wardObj.code);
              }
            }, 300);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error parsing address:", error);
      // If parsing fails, just set the street address to the full address
      setStreetAddress(currentAddress);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    resetAddressForm();
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    resetAddressForm();
    setCurrentAddressId(null);
  };

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

    setLoading(true);
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

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
          body: JSON.stringify({
            address: fullAddress,
          }),
        }
      );

      if (response.ok) {
        message.success("Thêm địa chỉ mới thành công!");
        setIsModalVisible(false);
        resetAddressForm();
        fetchAddresses(); // Refresh the addresses list
      } else {
        message.error("Không thể thêm địa chỉ mới.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const token = localStorage.getItem("token");

        try {
          const response = await fetch(
            `${BASE_URL}/customer/${addressId}/delete_address`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (response.ok) {
            message.success("Xóa địa chỉ thành công!");
            fetchAddresses(); // Refresh the addresses list
          } else {
            message.error("Không thể xóa địa chỉ.");
          }
        } catch (error) {
          message.error("Lỗi máy chủ, vui lòng thử lại sau.");
        }
      },
    });
  };

  const handleUpdateAddress = () => {
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

    setLoading(true);
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    fetch(
      `${BASE_URL}/customer/${customerId}/update_address/${currentAddressId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ address: fullAddress }),
      }
    )
      .then((response) => {
        if (response.ok) {
          message.success("Cập nhật địa chỉ thành công!");
          setIsUpdateModalVisible(false);
          resetAddressForm();
          setCurrentAddressId(null);
          fetchAddresses(); // Refresh the addresses list
        } else {
          message.error("Không thể cập nhật địa chỉ.");
        }
      })
      .catch((error) => {
        message.error("Lỗi máy chủ, vui lòng thử lại sau.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSetDefaultAddress = async (addressId) => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    try {
      const response = await fetch(
        `${BASE_URL}/customer/${customerId}/addresses/${addressId}/set-default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        message.success("Đã đặt địa chỉ mặc định!");
        setDefaultAddress(`home${addressId}`);

        // Update the local state directly instead of calling fetchAddresses()
        setAddresses((prevAddresses) =>
          prevAddresses.map((address) => ({
            ...address,
            isDefault: address.id === addressId,
          }))
        );
      } else {
        message.error("Không thể đặt địa chỉ mặc định.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    }
  };

  const renderAddressForm = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Tỉnh/Thành phố:
        </label>
        <Select
          placeholder="Chọn Tỉnh/Thành phố"
          style={{ width: "100%" }}
          value={selectedCity}
          onChange={(value) => setSelectedCity(value)}
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
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Số nhà, tên đường, tòa nhà..."
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </div>
    </div>
  );

  return (
    <div className="address-container">
      <div className="address-header">
        <div>
          <b>Địa chỉ của bạn</b>
          <p className="address-subtext">Quản lý thông tin địa chỉ của bạn</p>
        </div>
        <button className="add-address-button" onClick={showModal}>
          + Thêm địa chỉ mới
        </button>
      </div>

      <div
        className="address-list"
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {addresses && addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div
              key={index}
              className="address-item"
              style={{
                padding: "16px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <div
                className="address-info"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <b style={{ fontSize: "16px", marginRight: "15px" }}>
                  {address.name}
                </b>
                <p style={{ color: "#666", margin: "0" }}>{address.phone}</p>
                {address.isDefault && (
                  <div
                    className="default-badge"
                    style={{
                      backgroundColor: "#00a651",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginLeft: "10px",
                      padding: "2px 6px",
                    }}
                  >
                    <b>Mặc định</b>
                  </div>
                )}
              </div>
              <p
                className="address-text"
                style={{
                  margin: "0 0 15px",
                  fontSize: "15px",
                  lineHeight: "1.5",
                  width: "100%",
                }}
              >
                {address.address}
              </p>

              <div
                className="address-actions"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "15px" }}>
                  <b
                    className="update-button"
                    onClick={() => showUpdateModal(address.id, address.address)}
                    style={{
                      color: "#00a651",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    Cập nhật
                  </b>
                  <b
                    className="delete-button"
                    onClick={() => handleDeleteAddress(address.id)}
                    style={{
                      color: "#ff4d4f",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    Xóa
                  </b>
                </div>
                <div
                  className="default-checkbox"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <p style={{ margin: "0", fontSize: "14px" }}>
                    Chọn làm mặc định
                  </p>
                  <input
                    type="checkbox"
                    checked={address.isDefault}
                    onChange={() => handleSetDefaultAddress(address.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            Không có địa chỉ nào.
          </p>
        )}
      </div>

      {/* Modal thêm địa chỉ mới */}
      <Modal
        title="Thêm địa chỉ mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleAddAddress}
          >
            Thêm
          </Button>,
        ]}
        width={600}
      >
        {renderAddressForm()}
      </Modal>

      {/* Modal cập nhật địa chỉ */}
      <Modal
        title="Cập nhật địa chỉ"
        visible={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={[
          <Button key="back" onClick={handleUpdateCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdateAddress}
          >
            Cập nhật
          </Button>,
        ]}
        width={600}
      >
        {renderAddressForm()}
      </Modal>
    </div>
  );
};
