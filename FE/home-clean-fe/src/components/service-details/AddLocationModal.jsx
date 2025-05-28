import { useRef, useState, useEffect } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import styles from "../../assets/CSS/Service/AddLocationModal.module.css";
import { BASE_URL } from "../../utils/config";
import { message, Select } from "antd";
// Import address data
import addressDataJSON from "../../utils/address-data.json";

const { Option } = Select;

const AddLocationModal = ({ setIsShowAddLocationModal, onAddressAdded }) => {
  const [streetAddress, setStreetAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const addLocationRef = useRef(null);

  // State to track if a dropdown is open
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Address selection state
  const [addressData, setAddressData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Districts and wards based on selection
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Modified useClickOutside to respect dropdown state
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if dropdown is open or if click is inside the modal
      if (
        isDropdownOpen ||
        (addLocationRef.current &&
          addLocationRef.current.contains(event.target))
      ) {
        return;
      }

      // Check if the click target is an ant-select dropdown
      const isAntSelectDropdown = event.target.closest(".ant-select-dropdown");
      if (isAntSelectDropdown) return;

      setIsShowAddLocationModal(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsShowAddLocationModal, isDropdownOpen]);

  // Load address data on component mount
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

        // Update address list
        onAddressAdded();
        setIsShowAddLocationModal(false);
      } else {
        message.error("Không thể thêm địa chỉ mới.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalContainer} ref={addLocationRef}>
      <h3>Thêm địa chỉ</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "20px",
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
            onDropdownVisibleChange={(open) => setIsDropdownOpen(open)}
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
            onDropdownVisibleChange={(open) => setIsDropdownOpen(open)}
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
            onDropdownVisibleChange={(open) => setIsDropdownOpen(open)}
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
          <textarea
            className={styles.textarea}
            rows="3"
            placeholder="Số nhà, tên đường, tòa nhà..."
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.cancelButton}
          onClick={() => setIsShowAddLocationModal(false)}
          disabled={loading}
        >
          Trở lại
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleAddAddress}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Hoàn thành"}
        </button>
      </div>
    </div>
  );
};

export default AddLocationModal;
