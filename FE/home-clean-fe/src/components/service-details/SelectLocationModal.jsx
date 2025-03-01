import { useEffect, useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import AddLocationModal from "./AddLocationModal";
import styles from "../../assets/CSS/Service/SelectLocationModal.module.css";

const SelectLocationModal = ({ isShowLocationModal, setIsShowLocationModal }) => {
  const [isShowAddLocationModal, setIsShowAddLocationModal] = useState(false);
  const listLocationRef = useRef(null);
  useClickOutside({
    setState: setIsShowLocationModal,
    refElm: listLocationRef,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

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

          {[1, 2].map((_, index) => (
            <div key={index}>
              <div className={styles.addressItem}>
                <div>
                  <div className={styles.addressHeader}>
                    <p className={styles.name}>Trần Tâm Như</p>
                    <p className={styles.phone}>(+84) 912345678</p>
                    <p className={styles.defaultTag}>Mặc định</p>
                  </div>
                  <div className={styles.addressDetail}>
                    <p>Tập Thể Liên Đoàn Bóng Đá Vn, 18 Lý Văn Phức</p>
                    <p>Phường Cát Linh, Quận Đống Đa, Hà Nội</p>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button className={styles.selectButton}>Chọn</button>
                  <p className={styles.checkboxWrapper}>
                    Chọn làm mặc định <input type="checkbox" />
                  </p>
                </div>
              </div>
              {index === 0 && <div className={styles.divider}></div>}
            </div>
          ))}
        </div>
      )}

      {isShowAddLocationModal && <AddLocationModal setIsShowAddLocationModal={setIsShowAddLocationModal} />}
    </div>
  );
};

export default SelectLocationModal;