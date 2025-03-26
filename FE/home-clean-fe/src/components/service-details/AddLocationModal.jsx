import { useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import styles from "../../assets/CSS/Service/AddLocationModal.module.css";
import { BASE_URL } from "../../utils/config";
import { message } from "antd";
const AddLocationModal = ({ setIsShowAddLocationModal, onAddressAdded }) => {
  const [newAddress, setNewAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const addLocationRef = useRef(null);

  useClickOutside({
    setState: setIsShowAddLocationModal,
    refElm: addLocationRef,
  });

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      message.error("Vui lòng nhập địa chỉ.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    try {
      const response = await fetch(`${BASE_URL}/customer/${customerId}/create-address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ address: newAddress })
      });

      if (response.ok) {
        message.success("Thêm địa chỉ mới thành công!");
        setNewAddress("");

        // Gọi lại hàm để cập nhật danh sách địa chỉ
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

      <textarea
        className={styles.textarea}
        rows="3"
        placeholder="Nhập địa chỉ mới"
        value={newAddress}
        onChange={(e) => setNewAddress(e.target.value)}
      />
      {/* <iframe
        width="100%"
        height="300"
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
      ></iframe> */}
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