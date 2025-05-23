import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { message, Modal, Input, Button } from "antd";
import { BASE_URL } from "../../../utils/config";
import "../owner/profile.css";

export const Address = () => {
    const { cleaner, dispatch } = useContext(AuthContext);
    const [defaultAddress, setDefaultAddress] = useState("home1");
    const [addresses, setAddresses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchAddresses = async () => {
        const token = localStorage.getItem("token");
        const cleanerId = localStorage.getItem("cleanerId");

        if (token && cleanerId) {
            try {
                const response = await fetch(`${BASE_URL}/employee/${cleanerId}/all-addresses`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const responseData = await response.json();

                    // Transform the data structure to match what your component expects
                    const formattedAddresses = responseData.data.map((item, index) => ({
                        id: index, // Using index as ID if not provided in the response
                        address: item.address,
                        isDefault: item.is_current,
                        name: cleaner?.cleanerName || "",
                        phone: cleaner?.cleanerPhone || ""
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
    }, [dispatch]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNewAddress("");
    };

    const handleAddAddress = async () => {
        if (!newAddress.trim()) {
            message.error("Vui lòng nhập địa chỉ.");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        const cleanerId = localStorage.getItem("cleanerId");

        try {
            const response = await fetch(`${BASE_URL}/employee/${cleanerId}/create-address`, {
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
                setIsModalVisible(false);
                setNewAddress("");
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
        const token = localStorage.getItem("token");
        const cleanerId = localStorage.getItem("cleanerId");

        try {
            const response = await fetch(`${BASE_URL}/employee/${cleanerId}/delete-address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                message.success("Xóa địa chỉ thành công!");
                fetchAddresses(); // Refresh the addresses list
            } else {
                message.error("Không thể xóa địa chỉ.");
            }
        } catch (error) {
            message.error("Lỗi máy chủ, vui lòng thử lại sau.");
        }
    };

    const handleUpdateAddress = async (addressId, currentAddress) => {
        Modal.confirm({
            title: 'Cập nhật địa chỉ',
            content: (
                <Input.TextArea
                    defaultValue={currentAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Nhập địa chỉ mới"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            ),
            onOk: async () => {
                if (!newAddress.trim()) {
                    message.error("Vui lòng nhập địa chỉ.");
                    return;
                }

                const token = localStorage.getItem("token");
                const cleanerId = localStorage.getItem("cleanerId");

                try {
                    const response = await fetch(`${BASE_URL}/employee/${cleanerId}/update-address/${addressId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ address: newAddress })
                    });

                    if (response.ok) {
                        message.success("Cập nhật địa chỉ thành công!");
                        setNewAddress("");
                        fetchAddresses(); // Refresh the addresses list
                    } else {
                        message.error("Không thể cập nhật địa chỉ.");
                    }
                } catch (error) {
                    message.error("Lỗi máy chủ, vui lòng thử lại sau.");
                }
            },
            onCancel() {
                setNewAddress("");
            },
        });
    };

    const handleSetDefaultAddress = async (addressId) => {
        const token = localStorage.getItem("token");
        const cleanerId = localStorage.getItem("cleanerId");

        try {
            const response = await fetch(`${BASE_URL}/employee/${cleanerId}/set-default-address/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                message.success("Đã đặt địa chỉ mặc định!");
                setDefaultAddress(`home${addressId}`);
                fetchAddresses(); // Refresh the addresses list
            } else {
                message.error("Không thể đặt địa chỉ mặc định.");
            }
        } catch (error) {
            message.error("Lỗi máy chủ, vui lòng thử lại sau.");
        }
    };

    // Debug logging
    console.log("Addresses data:", addresses);

    return (
        <div className="address-container">
            <div className="address-header">
                <div>
                    <b>Địa chỉ của bạn</b>
                    <p className="address-subtext">Quản lý thông tin địa chỉ của bạn</p>
                </div>
                <button className="add-address-button" onClick={showModal}>+ Thêm địa chỉ mới</button>
            </div>

            <div className="address-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {addresses && addresses.length > 0 ? (
                    addresses.map((address, index) => (
                        <div
                            key={index}
                            className="address-item"
                            style={{
                                padding: '16px',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                // border: address.isDefault ? '2px solid #1890ff' : '1px solid #e8e8e8',
                                position: 'relative'
                            }}
                        >
                            <div className="address-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <b style={{ fontSize: '16px', marginRight: '15px' }}>
                                    {address.name || cleaner?.cleanerName || "Không có tên"}
                                </b>
                                <p style={{ color: '#666', margin: '0' }}>
                                    {address.phone || cleaner?.cleanerPhone || "Không có số điện thoại"}
                                </p>
                                {address.isDefault && (
                                    <div
                                        className="default-badge"
                                        style={{
                                            backgroundColor: '#00a651',
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        <b>Mặc định</b>
                                    </div>
                                )}
                            </div>
                            <p
                                className="address-text"
                                style={{
                                    margin: '0 0 15px',
                                    fontSize: '15px',
                                    lineHeight: '1.5',
                                    width: '30%',
                                }}
                            >
                                {address.address || "Chưa có địa chỉ"}
                            </p>

                            <div
                                className="address-actions"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid #f0f0f0',
                                    paddingTop: '10px'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <b
                                        className="update-button"
                                        onClick={() => handleUpdateAddress(address.id, address.address)}
                                        style={{
                                            color: '#00a651',
                                            cursor: 'pointer',
                                            transition: 'color 0.3s'
                                        }}
                                    >
                                        Cập nhật
                                    </b>
                                    <b
                                        className="delete-button"
                                        onClick={() => handleDeleteAddress(address.id)}
                                        style={{
                                            color: '#ff4d4f',
                                            cursor: 'pointer',
                                            transition: 'color 0.3s'
                                        }}
                                    >
                                        Xóa
                                    </b>
                                </div>
                                <div
                                    className="default-checkbox"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <p style={{ margin: '0', fontSize: '14px' }}>Chọn làm mặc định</p>
                                    <input
                                        type="checkbox"
                                        checked={address.isDefault}
                                        onChange={() => handleSetDefaultAddress(address.id)}
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            cursor: 'pointer',
                                            backgroundColor: '#00a651'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        Không có địa chỉ nào.
                    </p>
                )}
            </div>

            <Modal
                title="Thêm địa chỉ mới"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleAddAddress}>
                        Thêm
                    </Button>,
                ]}
            >
                <Input.TextArea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Nhập địa chỉ mới"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                />
            </Modal>
        </div>
    );
};