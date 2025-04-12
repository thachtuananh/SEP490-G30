import React, { useState, useEffect } from "react";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./JobUpload.module.css";
import JobUploadCard from "./JobUploadCard";
import ServiceSelectionModal from "./ServiceSelectionModal";

// Import all icons at the top level
import donBep from "../../assets/icon-home/don-bep.svg";
import donNhaVeSinh from "../../assets/icon-home/don-nha-vs.svg";
import donPhongKhach from "../../assets/icon-home/phong-khach.svg";
import donPhongNgu from "../../assets/icon-home/don-phong-ngu.svg";
import donDepSauTiec from "../../assets/icon-home/don-sk.svg";
import donDepNhaMoi from "../../assets/icon-home/nha-moi.svg";
import donDepVanPhong from "../../assets/icon-home/don-van-phong.svg";
import donDepTheoKy from "../../assets/icon-home/don-dinh-ky.svg";

import { BASE_URL } from "../../utils/config";

// Icon mapping outside of the component
const iconMap = {
  1: donPhongKhach,
  2: donBep,
  3: donPhongNgu,
  4: donNhaVeSinh,
  5: donDepSauTiec,
  6: donDepNhaMoi,
  7: donDepVanPhong,
  8: donDepTheoKy,
};

// Function to map service IDs to their respective icons
function getIconByServiceId(serviceId) {
  return iconMap[serviceId] || donPhongKhach; // Default to phong khach icon if not found
}

const JobUpload = () => {
  const navigate = useNavigate();
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded combo service (only ID 5)
  const comboService = {
    serviceId: 5,
    serviceName: "Dọn dẹp theo Combo",
    description: "Chọn nhiều dịch vụ cùng 1 lúc",
  };

  // Hardcoded display-only services (ID 7 and 8)
  const displayOnlyServices = [
    {
      serviceId: 7,
      serviceName: "Dọn dẹp văn phòng, khu làm việc",
      description:
        "Vệ sinh văn phòng, lau bàn ghế, hút bụi, dọn dẹp không gian làm việc",
    },
    {
      serviceId: 8,
      serviceName: "Dọn dẹp nhà theo định kỳ",
      description:
        "Vệ sinh nhà cửa định kỳ theo tuần/tháng, duy trì không gian sạch sẽ",
    },
  ];

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
        const filteredServices = data.filter(
          (service) => ![5, 7, 8].includes(service.serviceId)
        );

        // Set all services including our hardcoded combo service
        setAllServices([...filteredServices, comboService]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Không thể tải dịch vụ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // For display in the main page - split the services into two rows
  // Get services with ID 1-4 for first row
  const regularServices = allServices.filter(
    (service) => service.serviceId <= 4
  );

  // Get services with ID >= 5 for second row (including combo and display-only services)
  const specialServices = [
    comboService,
    ...allServices.filter((service) => service.serviceId > 5),
    ...displayOnlyServices,
  ];

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

  // if (loading) {
  //   return <div className={styles.loading}>Đang tải dịch vụ...</div>;
  // }

  return (
    <>
      <div className={styles.pageContainer}>
        <h1 className={styles.header}>Đăng tải việc làm</h1>

        <section className={styles.servicesGrid}>
          {regularServices.map((service) => (
            <JobUploadCard
              key={service.serviceId}
              id={service.serviceId}
              icon={getIconByServiceId(service.serviceId)}
              title={service.serviceName}
              description={service.description}
              onComboSelect={showServiceModal}
            />
          ))}
        </section>
        <section className={styles.servicesGrid}>
          {specialServices.map((service) => (
            <JobUploadCard
              key={service.serviceId}
              id={service.serviceId}
              icon={getIconByServiceId(service.serviceId)}
              title={service.serviceName}
              description={service.description}
              onComboSelect={showServiceModal}
              isDisabled={[7, 8].includes(service.serviceId)} // Disable for ID 7 and 8
            />
          ))}
        </section>
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
};

export default JobUpload;
