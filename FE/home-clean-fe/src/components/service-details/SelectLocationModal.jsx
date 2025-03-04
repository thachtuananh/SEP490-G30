import { useEffect, useRef, useState, useContext } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import AddLocationModal from "./AddLocationModal";
import styles from "../../assets/CSS/Service/SelectLocationModal.module.css";
import { AuthContext } from "../../context/AuthContext";

const SelectLocationModal = ({ isShowLocationModal, setIsShowLocationModal, setCustomerAddressId, setNameAddress }) => {
  const [isShowAddLocationModal, setIsShowAddLocationModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const listLocationRef = useRef(null);
  const { token, customerId } = useContext(AuthContext);

  useClickOutside({
    setState: setIsShowLocationModal,
    refElm: listLocationRef,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  // Gọi API để lấy danh sách địa chỉ
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!token) {
          console.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/customer/${customerId}/addresses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error("Lỗi khi lấy danh sách địa chỉ");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    if (customerId) fetchAddresses();
  }, [customerId]);

  // 🛠 **Hàm cập nhật địa chỉ mặc định**
  const setDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/customer/${customerId}/addresses/${addressId}/set-default`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setLocations((prevLocations) =>
          prevLocations.map((loc) => ({
            ...loc,
            is_current: loc.id === addressId, // Đánh dấu địa chỉ được chọn là mặc định
          }))
        );
        setCustomerAddressId(addressId);
        const selectedAddress = locations.find((loc) => loc.id === addressId);
        if (selectedAddress) {
          setNameAddress(selectedAddress.address);
        }
        console.log("Cập nhật địa chỉ mặc định thành công");
      } else {
        console.error("Lỗi khi cập nhật địa chỉ mặc định");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu cập nhật địa chỉ mặc định:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      {!isShowAddLocationModal && (
        <div className={styles.modal} ref={listLocationRef}>
          <div className={styles.header}>
            <div>
              <p className={styles.title}>Sổ địa chỉ</p>
              <p className={styles.subtitle}>Quản lý thông tin địa chỉ giao hàng của bạn</p>
            </div>
            <button className={styles.addButton} onClick={() => setIsShowAddLocationModal(true)}>
              <span className={styles.plus}>+</span> Thêm địa chỉ mới
            </button>
          </div>

          {locations.length > 0 ? (
            locations.map((location) => (
              <div key={location.id}>
                <div className={styles.addressItem}>
                  <div>
                    <div className={styles.addressHeader}>
                      <p className={styles.name}>{location.customer.full_name}</p>
                      <p className={styles.phone}>(+84) {location.customer.phone}</p>
                      {location.is_current && <p className={styles.defaultTag}>Mặc định</p>}
                    </div>
                    <div className={styles.addressDetail}>{location.address}</div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.selectButton}
                      style={{
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setDefaultAddress(location.id);
                        setCustomerAddressId(location.id);
                        setNameAddress(location.address)
                      }}
                    >
                      Chọn
                    </button>

                    <p className={styles.checkboxWrapper}>
                      Chọn làm mặc định
                      <input
                        type="checkbox"
                        checked={location.is_current}
                        onChange={() => setDefaultAddress(location.id)}
                      />
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noAddress}>Chưa có địa chỉ nào.</p>
          )}
        </div>
      )}

      {isShowAddLocationModal && <AddLocationModal setIsShowAddLocationModal={setIsShowAddLocationModal} />}
    </div>
  );
};

export default SelectLocationModal;