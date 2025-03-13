import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { message } from "antd";
import { BASE_URL } from "../../../utils/config";
import "../owner/profile.css";

export const Address = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [defaultAddress, setDefaultAddress] = useState("home1");
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
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
                        const data = await response.json();
                        setAddresses(data); // Cập nhật danh sách địa chỉ
                        dispatch({ type: "FETCH_ADDRESSES_SUCCESS", payload: data });
                    } else {
                        message.error("Không thể lấy danh sách địa chỉ.");
                    }
                } catch (error) {
                    message.error("Lỗi máy chủ, vui lòng thử lại sau.");
                }
            }
        };

        fetchAddresses();
    }, [dispatch]);

    return (
        <div className="address-container">
            <div className="address-header">
                <div>
                    <b>Địa chỉ của bạn</b>
                    <p className="address-subtext">Quản lý thông tin địa chỉ của bạn</p>
                </div>
                <button className="add-address-button">+ Thêm địa chỉ mới</button>
            </div>

            <div className="address-list">
                {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                        <div key={index} className="address-item">
                            <div className="address-info">
                                <b>{address.name || user?.name}</b>
                                <p>(+84) {address.phone || user?.phone}</p>
                                {defaultAddress === `home${index + 1}` && (
                                    <div className="default-badge">
                                        <b>Mặc định</b>
                                    </div>
                                )}
                            </div>
                            <p className="address-text">{address.address || "Chưa có địa chỉ"}</p>

                            <div className="address-actions">
                                <b className="update-button">Cập nhật</b>
                                <b className="delete-button">Xóa</b>
                                <div className="default-checkbox">
                                    <p>Chọn làm mặc định</p>
                                    <input
                                        type="checkbox"
                                        checked={defaultAddress === `home${index + 1}`}
                                        onChange={() => setDefaultAddress(`home${index + 1}`)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có địa chỉ nào.</p>
                )}
            </div>
        </div>
    );
};
