import React, { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";

export const Address = () => {
    const { user } = useContext(AuthContext);
    const [defaultAddress, setDefaultAddress] = useState("home1");

    const addresses = user?.addresses || []; // Giả sử `user` có thuộc tính `addresses`

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
                            <p className="address-text">{address.adr || "Chưa có địa chỉ"}</p>

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
