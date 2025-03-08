import { useEffect, useState, useContext } from "react";
import ServiceCard from "./ServiceCard";
import { AuthContext } from "../../../context/AuthContext";

import { fetchServices } from "../../api/Home_API";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";

function ServiceSection() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchServices();
      setServices(data);
    }
    fetchData();
  }, []);

  return (
    <section className="service-section">
      <h2 className="section-title">Danh sách cleaner</h2>
      <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        {services.length > 0 ? (
          services.map((cleaner) => (
            <ServiceCard
              key={cleaner.cleanerId}
              cleanerId={cleaner.cleanerId}
              cleanerImg={cleaner.cleanerImg}
              cleanerName={cleaner.cleanerName}
              rating={4.6}
              reviews={100}
            />
          ))
        ) : (
          <p>Đang tải danh sách cleaner...</p>
        )}
      </div>
    </section>
  );
}

export default ServiceSection;