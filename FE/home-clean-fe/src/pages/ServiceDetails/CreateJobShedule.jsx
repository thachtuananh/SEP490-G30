import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import Time from "../../components/create-job-schedule/Time";
import Note from "../../components/create-job-schedule/Note";
import Pay from "../../components/create-job-schedule/Pay";
import { Typography } from "antd";
import JobInformation from "../../components/create-job-schedule/JobInfomation";
import styles from "../../assets/CSS/createjob/CreateJob.module.css";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchServiceDetails,
  createJobShedule,
} from "../../services/owner/OwnerAPI";
import {
  fetchCustomerAddresses,
  setDefaultAddress,
} from "../../services/owner/OwnerAddressAPI";

const { Title } = Typography;

const CreateJobSchedule = () => {
  const { customerId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [serviceSchedules, setServiceSchedules] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("VNPay");
  const [reminder, setReminder] = useState("");
  const [priceAdjustment, setPriceAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const initializeData = async () => {
      if (!customerId) {
        message.error("Vui lòng đăng nhập để tiếp tục!");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const serviceIdsFromParams =
          params
            .get("services")
            ?.split(",")
            .map((id) => parseInt(id)) || [];

        const serviceIds =
          serviceIdsFromParams.length > 0
            ? serviceIdsFromParams
            : location.state?.selectedServices || [];

        if (serviceIds.length === 0) {
          message.warning("Không có dịch vụ nào được chọn!");
          navigate("/");
          return;
        }

        setSelectedServiceIds(serviceIds);

        const detailsPromises = serviceIds.map((id) => fetchServiceDetails(id));
        const detailsResults = await Promise.all(detailsPromises);

        const processedDetails = [];
        detailsResults.forEach((result) => {
          if (result && result.serviceId && result.serviceDetails) {
            result.serviceDetails.forEach((detail) => {
              processedDetails.push({
                serviceId: result.serviceId,
                serviceName: result.serviceName,
                serviceDetailId: detail.serviceDetailId,
                minRoomSize: detail.minRoomSize,
                maxSize: detail.maxRoomSize,
                price: detail.price,
              });
            });
          }
        });

        setServiceDetails(processedDetails);

        const initialSchedules = {};
        serviceIds.forEach((id) => {
          initialSchedules[id] = [];
        });
        setServiceSchedules(initialSchedules);
      } catch (error) {
        console.error("Error initializing data:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu, vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [customerId, navigate, location]);

  const handleTimeChange = (
    newServiceSchedules,
    adjustment,
    address,
    newTotalPrice
  ) => {
    setServiceSchedules(newServiceSchedules);
    setPriceAdjustment(adjustment);
    setSelectedAddress(address);
    setTotalPrice(newTotalPrice);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleNoteChange = (note) => {
    setReminder(note);
  };

  return (
    <div className={styles.createJobContainer}>
      <div className={styles.createJobContent}>
        <Title level={3} style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Chọn thời gian bắt đầu
        </Title>
        <Time
          onTimeChange={handleTimeChange}
          selectedServices={selectedServiceIds}
          serviceDetails={serviceDetails}
          customerId={customerId}
        />
        <Note onNoteChange={handleNoteChange} />
        <Pay onPaymentMethodChange={handlePaymentMethodChange} />
        <Title
          level={3}
          className={styles.sectionTitle}
          style={{ fontSize: "1.25rem", fontWeight: "bold" }}
        >
          Thông tin công việc
        </Title>
        <JobInformation
          serviceSchedules={serviceSchedules}
          paymentMethod={paymentMethod}
          reminder={reminder}
          priceAdjustment={priceAdjustment}
          price={totalPrice}
          address={selectedAddress?.fullAddress}
          customerAddressId={selectedAddress?.id}
          serviceDetails={serviceDetails}
        />
      </div>
    </div>
  );
};

export default CreateJobSchedule;
