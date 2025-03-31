import React, { useEffect, useState, useContext } from "react";
import MenuInfomation from "../../../components/profile/cleanner/menu_Infomation";
import { PersonaInformation } from "../../../components/profile/cleanner/personal_information";
import { Address } from "../../../components/profile/cleanner/address";
import { AuthContext } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/config";
import { message } from "antd";
import Navbar from "../../../components/Home/Cleaner/Navbar";
import Footer from "../../../components/Home/Cleaner/Footer";
import { WalletBalance } from "../../../components/profile/cleanner/wallet_balance";

const InfomationCleaner = () => {
    const { dispatch } = useContext(AuthContext); // Lấy thông tin user từ AuthContext
    const [selectedMenu, setSelectedMenu] = useState("1");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const cleanerId = localStorage.getItem("cleanerId");

            if (token && cleanerId) {
                try {
                    const response = await fetch(`${BASE_URL}/employee/${cleanerId}/get_employee_profile`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    const { data } = await response.json();
                    if (response.ok) {
                        dispatch({ type: 'FETCH_PROFILE_SUCCESS_CLEANER', payload: data });
                        // localStorage.setItem("cleaner", JSON.stringify(data)); // Lưu lại thông tin cleaner vào localStorage
                    } else {
                        message.error("Không thể lấy thông tin người dùng.");
                    }
                } catch (error) {
                    message.error("Lỗi máy chủ, vui lòng thử lại sau.");
                }
            }
        };

        fetchProfile();
    }, [dispatch]);

    const menuComponents = {
        "1": <PersonaInformation />,
        "2": <Address />,
        "3": <WalletBalance />
    };

    return (
        <>
            <Navbar />
            <div className="infomation-container">
                <div className="menu-container">
                    <MenuInfomation selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
                </div>
                <div className="content-container">
                    {/* Hiển thị component theo lựa chọn menu */}
                    {menuComponents[selectedMenu] || <p>Chưa có nội dung</p>}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default InfomationCleaner;
