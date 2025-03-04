import ServiceCard from "./ServiceCard";
import { fetchServices } from "../api/Home_API";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


const SuggestedServices = () => {
  const DEFAULT_IMAGE = "https://file.hstatic.net/1000317132/file/38879381_l_b3812863aa1e4f9a9b30a8149bbe54b4_grande.jpg";

  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchServices();
      console.log(data);
      setServices(data);
    }
    fetchData();
  }, []);

  const location = useLocation();
  const state = location.state || {};


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <h2
        style={{
          borderBottom: "4px solid #039855",
          paddingBottom: 10,
          width: "fit-content",
        }}
      >
        Dịch vụ tương tự
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: 'wrap' }}>

        {/* {Array(5)
          .fill(null)
          .map(() => (
            <ServiceCard />
          ))} */}

        {services.length > 0 ? (
          services.map((service) =>
            service.serviceId === state ? ( // ✅ Kiểm tra serviceId
              <div key={service.serviceId}>
                <h3 className="service-category">{service.serviceName}</h3>
                <div className="service-grid">
                  {service.serviceDetails.length > 0 ? (
                    service.serviceDetails.map((detail) => (
                      <ServiceCard
                        key={detail.serviceDetailId}
                        id={detail.serviceDetailId}
                        image={DEFAULT_IMAGE}
                        title={detail.name}
                        description={detail.description || "Không có mô tả"}
                        rating={4.6}
                        reviews={100}
                        serviceId={service.serviceId}
                      />
                    ))
                  ) : (
                    <p>Không có dịch vụ nào</p>
                  )}
                </div>
              </div>
            ) : null
          )
        ) : (
          <p>Đang tải dịch vụ...</p>
        )}

      </div>
    </div>
  );
};

export default SuggestedServices;