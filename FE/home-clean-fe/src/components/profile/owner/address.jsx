import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
  message,
  Modal,
  Input,
  Button,
  Select,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Checkbox,
  Tag,
  Pagination,
  Divider,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { BASE_URL } from "../../../utils/config";
// import "../owner/profile.css";
import "../owner/address.css";
// Import the address data from external JSON file
import addressDataJSON from "../../../utils/address-data.json";

const { Option } = Select;
const { Title, Text } = Typography;

export const Address = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

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
    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");

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
            isDefault: item.current,
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

  const showUpdateModal = (addressId, currentAddress) => {
    setCurrentAddressId(addressId);
    setIsUpdateModalVisible(true);
    try {
      const {
        cityName,
        districtName,
        wardName,
        streetAddress: parsedStreet,
      } = parseAddress(currentAddress);
      setStreetAddress(parsedStreet || currentAddress);
      const cityObj = addressData.find((city) =>
        city.name.toLowerCase().includes(cityName?.toLowerCase())
      );
      if (cityObj) {
        setSelectedCity(cityObj.code);
        const districtObj = cityObj.districts.find((district) =>
          district.name.toLowerCase().includes(districtName?.toLowerCase())
        );
        if (districtObj) {
          setSelectedDistrict(districtObj.code);
          const wardObj = districtObj.wards.find((ward) =>
            ward.name.toLowerCase().includes(wardName?.toLowerCase())
          );
          if (wardObj) {
            setSelectedWard(wardObj.code);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing address:", error);
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
        const token = sessionStorage.getItem("token");

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
    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");

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
    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");

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
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong>Tỉnh/Thành phố</Text>

        <Select
          placeholder="Chọn Tỉnh/Thành phố"
          style={{ width: "100%", marginTop: 8 }}
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
        <Text strong>Quận/Huyện</Text>

        <Select
          placeholder="Chọn Quận/Huyện"
          style={{ width: "100%", marginTop: 8 }}
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
        <Text strong>Phường/Xã</Text>

        <Select
          placeholder="Chọn Phường/Xã"
          style={{ width: "100%", marginTop: 8 }}
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
        <Text strong>Địa chỉ chi tiết</Text>

        <Input.TextArea
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Số nhà, tên đường, tòa nhà..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ marginTop: 8 }}
        />
      </div>
    </Space>
  );

  // Get current addresses for pagination
  const indexOfLastAddress = currentPage * pageSize;
  const indexOfFirstAddress = indexOfLastAddress - pageSize;
  const currentAddresses = addresses.slice(
    indexOfFirstAddress,
    indexOfLastAddress
  );

  // Change page
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
  };

  return (
    <div className="address-container">
      {/* Header */}
      <div className="address-header">
        <div className="address-title-container">
          <Title level={4} className="address-title">
            Địa chỉ của bạn
          </Title>
          <Text type="secondary" className="address-subtitle">
            Quản lý thông tin địa chỉ của bạn
          </Text>
        </div>
        <div className="address-actions-container">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className="add-address-btn"
          >
            Thêm địa chỉ mới
          </Button>
        </div>
      </div>

      <Divider className="address-divider" />

      {/* Address List */}
      {addresses && addresses.length > 0 ? (
        <div className="address-list">
          {currentAddresses.map((address) => (
            <Card key={address.id} className="address-card">
              <div className="address-card-content">
                <div className="address-user-info">
                  <Text strong className="address-user-name">
                    {address.name || user?.customerName || "Không có tên"}
                  </Text>
                  <div>
                    <Text className="address-user-phone">
                      {address.phone || user?.customerPhone || "Không có SĐT"}
                    </Text>
                  </div>
                </div>
                <div className="address-location-info">
                  <Text className="address-text-location">
                    {address.address || "Chưa có địa chỉ"}
                  </Text>
                  {address.isDefault && (
                    <Tag className="default-tag" color="green">
                      Mặc định
                    </Tag>
                  )}
                </div>
                <div className="address-control-buttons">
                  <div className="address-button-group">
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      style={{ width: "100%" }}
                      onClick={() =>
                        showUpdateModal(address.id, address.address)
                      }
                      className="update-address-btn"
                    >
                      Cập nhật
                    </Button>
                    {/* <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteAddress(address.id)}
                      className="delete-address-btn"
                    >
                      Xóa
                    </Button> */}
                  </div>
                  <Button
                    type="primary"
                    onClick={() => handleSetDefaultAddress(address.id)}
                    className="default-address-btn"
                    disabled={address.isDefault}
                  >
                    {address.isDefault ? "Đã đặt mặc định" : "Chọn mặc định"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={addresses.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="address-pagination"
            />
          </div>
        </div>
      ) : (
        <Card className="empty-address-card">
          <Text>Không có địa chỉ nào.</Text>
        </Card>
      )}

      {/* Add Address Modal */}
      <Modal
        title="Thêm địa chỉ mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} className="cancel-btn">
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleAddAddress}
            className="submit-btn"
          >
            Thêm
          </Button>,
        ]}
        width={600}
        className="address-modal"
      >
        {renderAddressForm()}
      </Modal>

      {/* Update Address Modal */}
      <Modal
        title="Cập nhật địa chỉ"
        open={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={[
          <Button
            key="back"
            onClick={handleUpdateCancel}
            className="cancel-btn"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdateAddress}
            className="submit-btn"
          >
            Cập nhật
          </Button>,
        ]}
        width={600}
        className="address-modal"
      >
        {renderAddressForm()}
      </Modal>
    </div>
  );
};
