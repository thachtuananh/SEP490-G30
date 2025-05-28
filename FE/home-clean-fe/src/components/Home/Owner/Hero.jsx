import style from "../../../styles/hero.module.css";
import React, { useState, useEffect } from "react";
import ServiceSelectionModal from "../../../components/combo-service/ServiceSelectionModal";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../utils/config";

function Hero() {
  const navigate = useNavigate();
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const comboService = {
    serviceId: 5,
    serviceName: "Dọn dẹp theo Combo",
    description: "Chọn nhiều dịch vụ cùng 1 lúc",
  };
  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/services/all`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Filter out any service with ID 5, 7, 8 from the API response to avoid duplicates
        // const filteredServices = data.filter(
        //   (service) => ![5, 7, 8].includes(service.serviceId)
        // );

        // Set all services including our hardcoded combo service
        setAllServices([...data, comboService]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Không thể tải dịch vụ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  const showServiceModal = () => {
    setIsServiceModalVisible(true);
  };

  const handleServiceCancel = () => {
    setIsServiceModalVisible(false);
  };

  const handleServiceOk = () => {
    if (selectedServices.length > 0) {
      setIsServiceModalVisible(false);
      // Navigate to the service details page instead of showing modal
      navigate("/service-details-combo", {
        state: {
          selectedServices,
          allServices,
        },
      });
    } else {
      message.error("Vui lòng chọn ít nhất một dịch vụ!");
    }
  };

  const onServiceChange = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  return (
    <>
      <div className={style.hero}>
        <div className={style.heroContent}>
          <h1>Nhà Sạch - Sống Vui</h1>
          <p>
            Một không gian sống mới không chỉ mang lại sự thoải mái, mà còn chứa
            đựng tinh thần hướng cuộc sống một cách trọn vẹn hơn. Với dịch vụ
            dọn dẹp chuyên nghiệp của chúng tôi, ngôi nhà của bạn sẽ luôn sạch
            sẽ, thoáng mát, giúp bạn thư giãn và hạnh phúc hơn mỗi ngày!
          </p>
          <div className={style.heroStats}>
            <div className={style.stat}>
              <span className={style.statValue}>4.8 ★</span>
              <span className={style.statLabel}>Rating trên App Store</span>
            </div>
            <div className={style.stat}>
              <span className={style.statValue}>135K+</span>
              <span className={style.statLabel}>Người dùng hoạt động</span>
            </div>
          </div>
          <div className={style.herohireBtn}>
            <button className={style.hireBtn} onClick={showServiceModal}>
              Thuê ngay
            </button>
          </div>
        </div>
      </div>
      {/* Service Selection Modal - keep this as a modal */}
      <ServiceSelectionModal
        isVisible={isServiceModalVisible}
        onCancel={handleServiceCancel}
        onOk={handleServiceOk}
        selectedServices={selectedServices}
        onServiceChange={onServiceChange}
        allServices={allServices}
      />
    </>
  );
}

export default Hero;
