import serviceImage from "../../assets/imgService/service.png";
import LocationIcon from "../iconsvg/LocationIcon";
import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Spin } from "antd";
import styles from '../../assets/CSS/Service/ServiceContent.module.css';
import { fetchServiceDetails } from "../../services/owner/OwnerAPI"; // Import the API function

const ServiceContent = ({ setIsShowLocationModal, setDescription, customerAddressId, nameAddress }) => {
  const { id } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [price, setPrice] = useState(0);
  // State để lưu serviceDetailId khi chọn diện tích
  const [selectedServiceDetailId, setSelectedServiceDetailId] = useState(null);


  const location = useLocation();
  const state = location.state || {};
  const data = "Thạch thất , Hà Nội";

  useEffect(() => {
    if (!id) return;

    fetchServiceDetails(id)
      .then((data) => {
        setServiceData(data);
        setDescription(data?.description || "Không có mô tả");

        // Set default size and price if data is available
        if (data.serviceDetails.length > 0) {
          setSelectedSize(data.serviceDetails[0]?.minRoomSize);
          setPrice(data.serviceDetails[0]?.price || 0);
          setSelectedServiceDetailId(data.serviceDetails[0]?.serviceDetailId);
        } else {
          setPrice(data?.basePrice || 0);
        }
      })
      .catch((err) => console.error("Lỗi khi gọi API:", err))
      .finally(() => setLoading(false));
  }, [id, setDescription]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const selectedDetail = serviceData?.serviceDetails?.find(
      (detail) => detail?.minRoomSize === size
    );
    setPrice(selectedDetail?.price || 0);
    setSelectedServiceDetailId(selectedDetail?.serviceDetailId); // Cập nhật serviceDetailId khi chọn diện tích
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!serviceData || typeof serviceData !== "object") {
    return <p style={{ textAlign: "center", color: "red" }}>Không có dữ liệu dịch vụ.</p>;
  }

  return (
    <div className="service-content">
      <div className="layout1">
        <img className="img-layout1" src={serviceImage} alt="Service" />
        <img className="img-layout1" src={serviceImage} alt="Service" />
        <img className="img-layout1" src={serviceImage} alt="Service" />
      </div>
      <img className="img-main" src={serviceImage} alt="Service" />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 0" }}>
        <h2>{serviceData?.serviceName || "Dịch vụ"}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontWeight: 600, fontSize: 16 }}>Chọn vị trí</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: "fit-content",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#B8B8B8",
                padding: "9px 15px",
                borderRadius: 10,
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => setIsShowLocationModal(true)}
            >
              <LocationIcon />
              Đổi địa chỉ
            </div>
            <p style={{ maxWidth: "60%", color: "#B8B8B8" }}>{nameAddress}</p>
          </div>
        </div>

        {/* Hiển thị danh sách diện tích dịch vụ */}
        <h3>Diện tích</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {serviceData?.serviceDetails?.length > 0 ? (
            serviceData.serviceDetails.map((detail) => (
              <button
                key={detail?.serviceDetailId || Math.random()}
                style={{
                  padding: "8px 12px",
                  border: selectedSize === detail?.minRoomSize ? "2px solid green" : "1px solid gray",
                  backgroundColor: selectedSize === detail?.minRoomSize ? "#D4F6D4" : "#fff",
                  color: "#333",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
                onClick={() => handleSizeSelect(detail?.minRoomSize)}
              >
                {detail?.minRoomSize || 0}m² - {detail?.maxRoomSize || 0}m²
              </button>
            ))
          ) : (
            <p>Không có dịch vụ nào</p>
          )}
        </div>

        {/* Hiển thị giá */}
        <h2>Giá: {price.toLocaleString()} đ</h2>

        {/* Nút tiếp theo */}
        <button
          className={styles.btn_Next}
          style={{
            width: "fit-content",
            padding: "12px 16px",
            color: "white",
            backgroundColor: "#039855",
            border: "none",
            fontWeight: 700,
            borderRadius: 7,
            cursor: "pointer",
            transitionDuration: "0.5s",
          }}
        >
          <Link
            className={styles.link_Next}
            to="/createjob"
            state={{
              price: price,
              serviceDetailId: selectedServiceDetailId, // Sử dụng state đã lưu serviceDetailId
              serviceId: state || null,
              address: nameAddress,
              serviceName: serviceData?.serviceName || "Dịch vụ",
              selectedSize: selectedSize,
              maxSize: serviceData?.serviceDetails?.find((detail) => detail?.minRoomSize === selectedSize)?.maxRoomSize || 0,
              customerAddressId: customerAddressId
            }}
          >
            Tiếp theo
          </Link>
        </button>
      </div>
    </div>
  );
};

export default ServiceContent;