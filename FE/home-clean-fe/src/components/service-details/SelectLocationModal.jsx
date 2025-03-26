import { useEffect, useRef, useState, useContext } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import AddLocationModal from "./AddLocationModal";
import styles from "../../assets/CSS/Service/SelectLocationModal.module.css";
import { AuthContext } from "../../context/AuthContext";
import { fetchCustomerAddresses, setDefaultAddress } from "../../services/owner/OwnerAddressAPI"; // Import API functions

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

  // Fetch addresses
  useEffect(() => {
    if (!customerId) return;

    fetchCustomerAddresses(customerId)
      .then(data => {
        setLocations(data);
      })
      .catch(error => {
        console.error("Lỗi khi lấy danh sách địa chỉ", error);
      });
  }, [customerId]);

  // Update default address function
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(customerId, addressId);

      setLocations((prevLocations) =>
        prevLocations.map((loc) => ({
          ...loc,
          is_current: loc.id === addressId,
        }))
      );

      setCustomerAddressId(addressId);
      const selectedAddress = locations.find((loc) => loc.id === addressId);
      if (selectedAddress) {
        setNameAddress(selectedAddress.address);
      }

      console.log("Cập nhật địa chỉ mặc định thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
    }
  };

  const handleAddressAdded = () => {
    if (!customerId) return;

    fetchCustomerAddresses(customerId)
      .then(data => {
        setLocations(data);
      })
      .catch(error => {
        console.error("Lỗi khi lấy danh sách địa chỉ", error);
      });
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
                        handleSetDefaultAddress(location.id);
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
                        onChange={() => handleSetDefaultAddress(location.id)}
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

      {isShowAddLocationModal &&
        <AddLocationModal
          setIsShowAddLocationModal={setIsShowAddLocationModal}
          onAddressAdded={handleAddressAdded} />}
    </div>
  );
};

export default SelectLocationModal;