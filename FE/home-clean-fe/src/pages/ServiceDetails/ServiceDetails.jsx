import "../../assets/CSS/Service/Service.css";
import { useState } from "react";
import ServiceContent from "../../components/service-details/ServiceContent"

import SuggestedServices from "../../components/service-details/SuggestedServices";
import SelectLocationModal from "../../components/service-details/SelectLocationModal";

const ServiceDetails = () => {
  const [isShowLocationModal, setIsShowLocationModal] = useState(false);
  return (
    <div className="container-service">
      <div className="body-service">
        <ServiceContent setIsShowLocationModal={setIsShowLocationModal} />
        <div style={{
          height: 100
        }}></div>
        <SuggestedServices />
        {isShowLocationModal && (
          <SelectLocationModal
            isShowLocationModal={isShowLocationModal}
            setIsShowLocationModal={setIsShowLocationModal}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;