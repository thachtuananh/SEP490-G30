import React, { useState } from "react";
import MenuInfomation from "../../../components/profile/owner/menu_Infomation";
import { PersonaInformation } from "../../../components/profile/owner/personal_information";
import { Address } from "../../../components/profile/owner/address";
import "../../../pages/profile/owner/infor.css"; // Import CSS riêng

const Infomation = () => {
    const [selectedMenu, setSelectedMenu] = useState("1");

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
