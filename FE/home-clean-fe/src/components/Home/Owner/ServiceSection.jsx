import { useEffect, useState } from "react";
import ServiceCard from "./ServiceCard";
import { fetchServices } from "../../api/Home_API";

const DEFAULT_IMAGE = "https://file.hstatic.net/1000317132/file/38879381_l_b3812863aa1e4f9a9b30a8149bbe54b4_grande.jpg";

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
      <h2 className="section-title">Danh sách dịch vụ</h2>
      <div
        style={{
          display: 'flex',
          gap: 15,
          flexWrap: 'wrap'
        }}
      >
        {services.length > 0 ? (
          services.map((service) => (
            <ServiceCard
              key={service.serviceId}
              id={service.serviceId}
              image={DEFAULT_IMAGE}
              title={service.serviceName}
              description={service.description || "Không có mô tả"}
              rating={4.6}
              reviews={100}
              serviceId={service.serviceId}
            />
          ))
        ) : (
          <p>Đang tải dịch vụ...</p>
        )}
      </div>
    </section>
  );
}

export default ServiceSection;