import "../../assets/CSS/Service/Service.css";
import { useState } from "react";
import ServiceContent from "../../components/service-details/ServiceContent"
import ServiceDescription from "../../components/service-details/ServiceDescription";
import SuggestedServices from "../../components/service-details/SuggestedServices";
import SelectLocationModal from "../../components/service-details/SelectLocationModal";

const ServiceDetails = () => {
  const [isShowLocationModal, setIsShowLocationModal] = useState(false);
  const [description, setDescription] = useState("Không có mô tả");
  const [customerAddressId, setCustomerAddressId] = useState("Không có mô tả");
  return (
    <div className="container-service">
      <div className="body-service">
        <ServiceContent setIsShowLocationModal={setIsShowLocationModal} setDescription={setDescription} customerAddressId={customerAddressId} />
        <div style={{
          height: 50
        }}></div>
        <ServiceDescription description={description} />
        <div style={{
          height: 100
        }}></div>

        {/* <SuggestedServices /> */}
        {isShowLocationModal && (
          <SelectLocationModal
            isShowLocationModal={isShowLocationModal}
            setIsShowLocationModal={setIsShowLocationModal}
            setCustomerAddressId={setCustomerAddressId}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;