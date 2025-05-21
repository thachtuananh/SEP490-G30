import React, { useState, useEffect } from "react";
import { Form, message, Button } from "antd";
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
  const [isScheduleMode, setIsScheduleMode] = useState(false);

  // Define special services with custom identifiers that won't conflict with API data
  const comboService = {
    serviceId: "combo", // Use a string identifier instead of a number
    displayId: 5, // For icon mapping purposes
    serviceName: "Dọn dẹp theo Combo",
    description: "Chọn nhiều dịch vụ cùng 1 lúc",
  };

  // Hardcoded display-only services with string IDs
  const displayOnlyServices = [
    {
      serviceId: "office",
      displayId: 7, // For icon mapping purposes
      serviceName: "Dọn dẹp văn phòng, khu làm việc",
      description:
        "Vệ sinh văn phòng, lau bàn ghế, hút bụi, dọn dẹp không gian làm việc",
    },
    {
      serviceId: "periodic",
      displayId: 8, // For icon mapping purposes
      serviceName: "Dọn dẹp ký túc xá, nhà trọ",
      description: "Vệ sinh nhà cửa, dọn dẹp khu vực sinh hoạt chung",
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

        // Set all services including our special services
        setAllServices([...data, comboService, ...displayOnlyServices]);
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
  // Get regular services (those with numeric IDs from API, typically 1-4)
  const regularServices = allServices.filter(
    (service) => typeof service.serviceId === "number" && service.serviceId <= 4
  );

  // Get special services (combo and display-only with string IDs plus any numeric IDs > 4)
  const specialServices = allServices.filter(
    (service) =>
      typeof service.serviceId === "string" ||
      (typeof service.serviceId === "number" && service.serviceId > 4)
  );

  // Filter out displayOnlyServices for modal display
  const modalServices = allServices.filter(
    (service) =>
      !displayOnlyServices.some((dos) => dos.serviceId === service.serviceId)
  );

  const showServiceModal = (isSchedule = false) => {
    setIsScheduleMode(isSchedule);
    setIsServiceModalVisible(true);
  };

  const handleServiceCancel = () => {
    setIsServiceModalVisible(false);
    setIsScheduleMode(false);
  };

  const handleServiceOk = () => {
    if (selectedServices.length > 0) {
      setIsServiceModalVisible(false);

      // Navigate to different routes based on mode
      if (isScheduleMode) {
        navigate("/createjob-schedule", {
          state: {
            selectedServices,
            allServices,
          },
        });
      } else {
        navigate("/service-details-combo", {
          state: {
            selectedServices,
            allServices,
          },
        });
      }

      // Reset schedule mode
      setIsScheduleMode(false);
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

  const handleScheduleClick = () => {
    showServiceModal(true);
  };

  return (
    <>
      <div className={styles.pageContainer}>
        <h1 className={styles.header}>Đăng việc cần dọn</h1>

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
              // Use displayId for icon mapping if available, otherwise use serviceId
              icon={getIconByServiceId(service.displayId || service.serviceId)}
              title={service.serviceName}
              description={service.description}
              onComboSelect={showServiceModal}
              // Check for displayId of 7 or 8, or serviceId for string-based IDs
              isDisabled={
                service.displayId === 7 ||
                service.displayId === 8 ||
                service.serviceId === "office" ||
                service.serviceId === "periodic"
              }
              // Pass down the displayId to use for combo service check
              displayId={service.displayId}
            />
          ))}
        </section>
        <section className={styles.servicesGrid}>
          <p>Bạn muốn đặt dịch vụ theo lịch trình hàng tuần, tháng? </p>
          <Button
            type="link"
            onClick={handleScheduleClick}
            className={styles.comboButton}
          >
            Đặt dịch vụ theo lịch trình
          </Button>
        </section>
      </div>

      {/* Service Selection Modal - now with filtered services */}
      <ServiceSelectionModal
        isVisible={isServiceModalVisible}
        onCancel={handleServiceCancel}
        onOk={handleServiceOk}
        selectedServices={selectedServices}
        onServiceChange={onServiceChange}
        allServices={modalServices} // Use the filtered services list
      />
    </>
  );
};

export default JobUpload;
