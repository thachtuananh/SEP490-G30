import "../../assets/CSS/Service/Service.css";
import { useState, useEffect, useContext } from "react";
import ServiceContent from "../../components/service-details/ServiceContent";
import ServiceDescription from "../../components/service-details/ServiceDescription";
import SelectLocationModal from "../../components/service-details/SelectLocationModal";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

const ServiceDetails = () => {
  const [isShowLocationModal, setIsShowLocationModal] = useState(false);
  const [description, setDescription] = useState("Không có mô tả");
  const [customerAddressId, setCustomerAddressId] = useState("0");
  const [nameAddress, setNameAddress] = useState("Vui lòng chọn địa chỉ");
  const { token, customerId } = useContext(AuthContext);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        if (!token) return;
        const response = await fetch(
          `${BASE_URL}/customer/${customerId}/addresses`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const addresses = await response.json();
          const defaultAddress = addresses.find((address) => address.current); // Tìm địa chỉ mặc định

          if (defaultAddress) {
            setCustomerAddressId(defaultAddress.id);
            setNameAddress(defaultAddress.address);
          }
        } else {
          console.error("Lỗi khi lấy danh sách địa chỉ");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    if (customerId) fetchDefaultAddress();
  }, [customerId]); // Chỉ chạy khi có customerId

  return (
    <div className="container-service">
      <div className="body-service">
        <ServiceContent
          setIsShowLocationModal={setIsShowLocationModal}
          setDescription={setDescription}
          customerAddressId={customerAddressId}
          nameAddress={nameAddress}
        />
        {/* <div style={{ height: 50 }}></div> */}
        <ServiceDescription description={description} />
        {/* <div style={{ height: 100 }}></div> */}

        {isShowLocationModal && (
          <SelectLocationModal
            isShowLocationModal={isShowLocationModal}
            setIsShowLocationModal={setIsShowLocationModal}
            setCustomerAddressId={setCustomerAddressId}
            setNameAddress={setNameAddress}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
