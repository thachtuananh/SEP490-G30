import serviceImage from "../../assets/imgService/service.png";
import LocationIcon from "../iconsvg/LocationIcon";
import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Spin } from "antd";
import { fetchServiceDetails } from "../../services/owner/OwnerAPI";
import style from "../../assets/CSS/Service/ServiceContent.module.css";

const ServiceContent = ({
  setIsShowLocationModal,
  setDescription,
  customerAddressId,
  nameAddress,
}) => {
  const { id } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [price, setPrice] = useState(0);
  const [selectedServiceDetailId, setSelectedServiceDetailId] = useState(null);
  const [activeImage, setActiveImage] = useState(serviceImage);

  const location = useLocation();
  const state = location.state || {};

  useEffect(() => {
    if (!id) return;

    fetchServiceDetails(id)
      .then((data) => {
        setServiceData(data);
        setDescription(data?.description || "Không có mô tả");

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
    setSelectedServiceDetailId(selectedDetail?.serviceDetailId);
  };

  const handleThumbnailClick = (image) => {
    setActiveImage(image);
  };

  const serviceThumbnails = [serviceImage, serviceImage, serviceImage];

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!serviceData || typeof serviceData !== "object") {
    return (
      <div className={style.errorContainer}>
        <p>Không có dữ liệu dịch vụ.</p>
      </div>
    );
  }

  return (
    <div className={style.serviceContentWrapper}>
      <div className={style.serviceGallery}>
        <div className={style.mainImageContainer}>
          <img className={style.mainImage} src={activeImage} alt="Service" />
        </div>
      </div>

      <div className={style.serviceDetails}>
        <h1 className={style.serviceTitle}>
          {serviceData?.serviceName || "Dịch vụ"}
        </h1>

        <div className={style.locationSection}>
          <h3 className={style.sectionTitle}>Chọn vị trí</h3>
          <div className={style.locationContainer}>
            <button
              className={style.changeLocationButton}
              onClick={() => setIsShowLocationModal(true)}
            >
              <LocationIcon />
              <span>Đổi địa chỉ</span>
            </button>
            <p className={style.addressText}>{nameAddress}</p>
          </div>
        </div>

        <div className={style.sizeSection}>
          <h3 className={style.sectionTitle}>Diện tích</h3>
          <div className={style.sizeOptions}>
            {serviceData?.serviceDetails?.length > 0 ? (
              serviceData.serviceDetails.map((detail) => (
                <button
                  key={detail?.serviceDetailId || Math.random()}
                  className={`${style.sizeOption} ${
                    selectedSize === detail?.minRoomSize
                      ? style.sizeOptionSelected
                      : ""
                  }`}
                  onClick={() => handleSizeSelect(detail?.minRoomSize)}
                >
                  {detail?.minRoomSize || 0}m² - {detail?.maxRoomSize || 0}m²
                </button>
              ))
            ) : (
              <p className={style.noServices}>Không có dịch vụ nào</p>
            )}
          </div>
        </div>

        <div className={style.priceSection}>
          <h2 className={style.price}>{price.toLocaleString()} đ</h2>
        </div>

        <div className={style.actionSection}>
          <Link
            className={style.nextButton}
            to="/createjob"
            state={{
              price: price,
              serviceDetailId: selectedServiceDetailId,
              serviceId: state || null,
              address: nameAddress,
              serviceName: serviceData?.serviceName || "Dịch vụ",
              selectedSize: selectedSize,
              maxSize:
                serviceData?.serviceDetails?.find(
                  (detail) => detail?.minRoomSize === selectedSize
                )?.maxRoomSize || 0,
              customerAddressId: customerAddressId,
            }}
          >
            Tiếp theo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceContent;
