import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatIcon } from "./ChatIcon";
import styles from "./styles.module.css";
import ServiceSelectionModal from "../../components/create-job-to-cleaner/ServiceSelectionModal";
import donBep from "../../assets/icon-home/don-bep.svg";
import donNhaVeSinh from "../../assets/icon-home/don-nha-vs.svg";
import donPhongKhach from "../../assets/icon-home/phong-khach.svg";
import donPhongNgu from "../../assets/icon-home/don-phong-ngu.svg";
import donDepNhaMoi from "../../assets/icon-home/nha-moi.svg";
import donDepVanPhong from "../../assets/icon-home/don-van-phong.svg";
import donDepTheoKy from "../../assets/icon-home/don-dinh-ky.svg";

export const PriceSection = ({ cleanerId, cleanerName }) => {
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const allServices = [
    {
      id: 1,
      icon: donPhongKhach,
      title: "Dọn phòng khách",
      description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    },
    {
      id: 2,
      icon: donBep,
      title: "Dọn phòng bếp",
      description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    },
    {
      id: 3,
      icon: donPhongNgu,
      title: "Dọn phòng ngủ",
      description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    },
    {
      id: 4,
      icon: donNhaVeSinh,
      title: "Dọn nhà vệ sinh",
      description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    },
    {
      id: 6,
      icon: donDepNhaMoi,
      title: "Dọn dẹp nhà mới xây, sau sửa chữa",
      description: "Mô tả dịch vụ",
    },
    {
      id: 7,
      icon: donDepVanPhong,
      title: "Dọn dẹp văn phòng, cửa hàng",
      description: "Mô tả dịch vụ",
    },
    {
      id: 8,
      icon: donDepTheoKy,
      title: "Dọn dẹp nhà theo định kỳ",
      description: "Mô tả dịch vụ",
    },
  ];
  const showServiceModal = () => {
    setIsServiceModalVisible(true);
  };

  const handleServiceCancel = () => {
    setIsServiceModalVisible(false);
  };

  const handleServiceOk = () => {
    if (selectedServices.length === 0) {
      return;
    }

    navigate("/service-details-cleaner", {
      state: {
        selectedServices,
        cleanerId,
        cleanerName,
        allServices
      }
    });

    setIsServiceModalVisible(false);
  };

  const onServiceChange = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  return (
    <section className={styles.priceSection}>
      <div className={styles.actionButtons}>
        {/* <button className={styles.chatButton}>
          <ChatIcon />
          <span>Chat ngay</span>
        </button> */}
        <button className={styles.hireButton} onClick={showServiceModal}>Thuê ngay</button>
      </div>

      <ServiceSelectionModal
        isVisible={isServiceModalVisible}
        onCancel={handleServiceCancel}
        onOk={handleServiceOk}
        selectedServices={selectedServices}
        onServiceChange={onServiceChange}
        allServices={allServices}
      />
    </section>
  );
};