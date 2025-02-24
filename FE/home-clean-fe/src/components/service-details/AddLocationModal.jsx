import { useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import styles from "../../assets/CSS/Service/AddLocationModal.module.css";

const AddLocationModal = ({ setIsShowAddLocationModal }) => {
  const [address, setAddress] = useState("Văn phòng");
  const addressType = ["Văn phòng", "Nhà riêng"];
  const addLocationRef = useRef(null);

  useClickOutside({
    setState: setIsShowAddLocationModal,
    refElm: addLocationRef,
  });

  return (
    <div className={styles.modalContainer} ref={addLocationRef}>
      <h3>Thêm địa chỉ</h3>
      <select className={styles.select}>
        <option value="1">Bà Rịa - Vũng Tàu, Huyện Côn Đảo, Xã Côn Đảo</option>
        <option value="2">
          Bà Rịa 2 - Vũng Tàu, Huyện Côn Đảo, Xã Côn Đảo
        </option>
      </select>
      <textarea className={styles.textarea} rows="3">
        Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đảo, Huyện Côn Đảo, Tỉnh
        Bà Rịa - Vũng Tàu, Việt Nam.
      </textarea>
      <iframe
        width="100%"
        height="300"
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps?q=Côn+Đảo,Vietnam&output=embed"
      ></iframe>
      <div className={styles.addressTypeContainer}>
        <p>Loại địa chỉ:</p>
        <div className={styles.addressTypeOptions}>
          {addressType.map((type) => (
            <div
              key={type}
              className={`${styles.addressTypeItem} ${
                address === type ? styles.active : ""
              }`}
              onClick={() => setAddress(type)}
            >
              {type}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.cancelButton}
          onClick={() => setIsShowAddLocationModal(false)}
        >
          Trở lại
        </button>
        <button className={styles.confirmButton}>Hoàn thành</button>
      </div>
    </div>
  );
};

export default AddLocationModal;
