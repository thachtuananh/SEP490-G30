import React, { useEffect, useState, useContext } from "react";
import MenuInfomation from "../../../components/profile/owner/menu_Infomation";
import { PersonaInformation } from "../../../components/profile/owner/personal_information";
import { Address } from "../../../components/profile/owner/address";
import { AuthContext } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/config";
import { message } from "antd";
import "./infor.css"; // Import CSS riêng

const Infomation = () => {
    const { dispatch } = useContext(AuthContext);
    const [selectedMenu, setSelectedMenu] = useState("1");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const customerId = localStorage.getItem("customerId");

            if (token && customerId) {
                try {
                    const response = await fetch(`${BASE_URL}/customer/${customerId}/profile?customer_id=${customerId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    const data = await response.json();
                    if (response.ok) {
                        dispatch({ type: 'FETCH_PROFILE_SUCCESS', payload: data });
                    } else {
                        message.error(data.message || "Không thể lấy thông tin người dùng.");
                    }
                } catch (error) {
                    message.error("Lỗi máy chủ, vui lòng thử lại sau.");
                }
            }
        };

        fetchProfile();
    }, [dispatch]);
    // Dùng object thay vì switch-case để tối ưu code
    const menuComponents = {
        "1": <PersonaInformation />,
        "2": <Address />
    };

    return (
        <div className="infomation-container">
            <div className="menu-container">
                <MenuInfomation selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
            </div>

            <div className="content-container">
                {menuComponents[selectedMenu] || <p>Chưa có nội dung</p>}
            </div>
        </div>
    );
};

export default Infomation;
