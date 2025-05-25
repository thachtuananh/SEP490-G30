import React, { useState, useEffect } from "react";
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
import { BASE_URL } from "../../utils/config";

// Icon mapping outside of the component
const iconMap = {
  1: donPhongKhach,
  2: donBep,
  3: donPhongNgu,
  4: donNhaVeSinh,
  6: donDepNhaMoi,
  7: donDepVanPhong,
  8: donDepTheoKy,
};

// Function to map service IDs to their respective icons
function getIconByServiceId(serviceId) {
  return iconMap[serviceId] || donPhongKhach; // Default to phong khach icon if not found
}

// Function to truncate description
function truncateDescription(description) {
  return description && description.length > 100
    ? `${description.substring(0, 35)}...`
    : description;
}

const PriceSection = ({ cleanerId, cleanerName, phoneNumber }) => {
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/services/all`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Map the fetched services to include icons and truncate descriptions
        const servicesWithIcons = data.map((service) => ({
          ...service,
          id: service.serviceId,
          title: service.serviceName,
          icon: getIconByServiceId(service.serviceId),
          description: truncateDescription(service.description),
        }));

        setAllServices(servicesWithIcons);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleHireClick = () => {
    // Navigate directly to /service-details-cleaner with state
    navigate("/service-details-cleaner", {
      state: {
        selectedServices: [], // Empty since no modal selection
        cleanerId,
        cleanerName,
        phoneNumber,
        allServices,
      },
    });
  };

  return (
    <section className={styles.priceSection}>
      <div className={styles.actionButtons}>
        {/* <button className={styles.chatButton}>
          <ChatIcon />
          <span>Chat ngay</span>
        </button> */}
        <button className={styles.hireButton} onClick={handleHireClick}>
          Thuê ngay
        </button>
      </div>
    </section>
  );
};

export default PriceSection;
