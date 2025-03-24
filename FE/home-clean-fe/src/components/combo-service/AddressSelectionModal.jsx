import React from "react";
import { Button, Modal, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "../../components/combo-service/JobUpload.module.css"; // Adjust path as needed

const AddressSelectionModal = ({
    isVisible,
    onCancel,
    onSelect,
    addresses = [],
    loading = false,
    onSetDefaultAddress,
    currentLocation,
}) => {
    const navigate = useNavigate();

    return (
        <Modal
            title="Sổ địa chỉ"
            open={isVisible}
            onCancel={onCancel}
            footer={null}
            className={styles.addressBookModal}
        >
            {loading ? (
                <div className={styles.loadingContainer}>
                    <Spin size="small" tip="Đang tải..." />
                </div>
            ) : (
                <>
                    <div className={styles.addressBookHeader}>
                        Quản lý thông tin địa chỉ giao hàng của bạn
                    </div>
                    <div className={styles.addressList}>
                        {addresses.map((address) => (
                            <div
                                key={address.addressId}
                                className={styles.addressItem}
                            >
                                <div className={styles.addressInfo}>
                                    <div className={styles.userName}>
                                        {address.customer.full_name || "Người nhận"}
                                        <span className={styles.phoneNumber}>
                                            {address.customer.phone || "Không có số điện thoại"}
                                        </span>
                                        {address.isDefault && <span className={styles.defaultTag}>Mặc định</span>}
                                    </div>
                                    <div className={styles.address}>{address.address}</div>
                                    <div className={styles.addressActions}>
                                        {!address.isDefault ? (
                                            <div
                                                className={styles.defaultOption}
                                                onClick={() => onSetDefaultAddress(address.addressId)}
                                            >
                                                Chọn làm mặc định <span className={styles.checkBox}></span>
                                            </div>
                                        ) : (
                                            <div className={styles.defaultSelected}>
                                                Chọn làm mặc định <span className={styles.checkIcon}>✓</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.selectButtonContainer}>
                                    <Button
                                        className={styles.selectButton}
                                        onClick={() => onSetDefaultAddress(address.addressId)}
                                    >
                                        Chọn
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* <div className={styles.addAddressButtonContainer}>
                        <Button
                            type="primary"
                            className={styles.addAddressButton}
                            icon={<span>+</span>}
                            onClick={() =>
                                navigate("/address/add", {
                                    state: {
                                        returnPath: currentLocation
                                    }
                                })
                            }
                        >
                            Thêm địa chỉ mới
                        </Button>
                    </div> */}
                </>
            )}
        </Modal>
    );
};

export default AddressSelectionModal;