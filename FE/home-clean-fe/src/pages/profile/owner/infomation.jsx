import React, { useEffect, useState, useContext } from "react";
import MenuInfomation from "../../../components/profile/owner/menu_Infomation";
import { PersonaInformation } from "../../../components/profile/owner/personal_information";
import { Address } from "../../../components/profile/owner/address";
import { AuthContext } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/config";
import { message } from "antd";
import "./infor.css"; // Import CSS riêng
import WalletBalance from "../../../components/profile/owner/wallet_balance";

const Infomation = () => {
  const { dispatch } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState("1");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");
      const customerId = sessionStorage.getItem("customerId");

      if (token && customerId) {
        try {
          const response = await fetch(
            `${BASE_URL}/customer/${customerId}/profile?customer_id=${customerId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await response.json();
          if (response.ok) {
            dispatch({ type: "FETCH_PROFILE_SUCCESS_CUSTOMER", payload: data });
          } else {
            message.error(
              data.message || "Không thể lấy thông tin người dùng."
            );
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
    1: <PersonaInformation />,
    2: <Address />,
    3: <WalletBalance />,
  };

  return (
    <div className="infomation-container">
      <div className="menu-container">
        <MenuInfomation
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
        />
      </div>

      <div className="content-container">
        {menuComponents[selectedMenu] || <p>Chưa có nội dung</p>}
      </div>
    </div>
  );
};

export default Infomation;
