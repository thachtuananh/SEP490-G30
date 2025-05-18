import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { message, Typography, Modal, Checkbox, List } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";
import dayjs from "dayjs";
import { createJobShedule } from "../../services/owner/OwnerAPI";

const { Title, Text, Paragraph } = Typography;

const JobInfomation = ({
  schedules,
  paymentMethod,
  reminder,
  priceAdjustment,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const serviceId = state.serviceId;
  const serviceDetailId = state.serviceDetailId;
  const customerAddressId = state.customerAddressId;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [basePrice, setBasePrice] = useState(state.price || 0);
  const [adjustedPrice, setAdjustedPrice] = useState(state.price || 0);

  const { token, customerId } = useContext(AuthContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (priceAdjustment && basePrice) {
      const adjustmentAmount = basePrice * (priceAdjustment.percentage / 100);
      setAdjustedPrice(basePrice + adjustmentAmount);
    } else {
      setAdjustedPrice(basePrice);
    }
  }, [priceAdjustment, basePrice]);

  useEffect(() => {
    if (state.price) {
      setBasePrice(state.price);
      if (priceAdjustment) {
        const adjustmentAmount =
          state.price * (priceAdjustment.percentage / 100);
        setAdjustedPrice(state.price + adjustmentAmount);
      } else {
        setAdjustedPrice(state.price);
      }
    }
  }, [state.price]);

  const validateJobTimes = async () => {
    if (!schedules || schedules.length === 0) {
      message.error("Vui lòng chọn ít nhất một lịch trình làm việc!");
      return false;
    }

    for (const schedule of schedules) {
      const selectedDateTime = dayjs(schedule.jobTime);
      if (selectedDateTime.isBefore(currentTime)) {
        Modal.warning({
          title: "Thời gian không hợp lệ",
          content: `Lịch trình ${selectedDateTime.format(
            "DD/MM/YYYY HH:mm"
          )} đã là quá khứ. Vui lòng cập nhật.`,
          okText: "Đã hiểu",
        });
        return false;
      }

      if (selectedDateTime.diff(currentTime, "minute") < 30) {
        const confirmed = await new Promise((resolve) => {
          Modal.confirm({
            title: "Thời gian quá gần",
            content: `Lịch trình ${selectedDateTime.format(
              "DD/MM/YYYY HH:mm"
            )} chỉ còn ${selectedDateTime.diff(
              currentTime,
              "minute"
            )} phút nữa. Người dọn dẹp có thể không kịp nhận việc. Bạn có muốn tiếp tục?`,
            okText: "Tiếp tục",
            cancelText: "Hủy",
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!confirmed) return false;
      }
    }
    return true;
  };

  const handleCreateJob = async () => {
    if (isSubmitting || isRedirecting) return;
    if (!termsAccepted) {
      message.error("Vui lòng đồng ý với Điều khoản và dịch vụ!");
      return;
    }
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    setIsSubmitting(true);

    try {
      const isTimeValid = await validateJobTimes();
      if (!isTimeValid) {
        setIsSubmitting(false);
        return;
      }

      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        setIsSubmitting(false);
        return;
      }

      const services = state.serviceDetails
        ? state.serviceDetails.map((service) => ({
            serviceId: service.serviceId,
            serviceDetailId: service.serviceDetailId,
          }))
        : [{ serviceId, serviceDetailId }];

      const jobData = {
        customerAddressId,
        paymentMethod: paymentMethod === "wallet" ? "Wallet" : paymentMethod,
        reminder,
        jobs: schedules.map((schedule) => ({
          jobTime: schedule.jobTime,
          services,
        })),
      };

      console.log("Job data being sent:", jobData);

      const responseData = await createJobShedule(customerId, jobData);

      if (paymentMethod === "VNPay" && responseData.paymentUrl) {
        setIsRedirecting(true);
        message.info(
          "Bạn sẽ được chuyển đến cổng thanh toán VNPay trong 3 giây!",
          3
        );
        setTimeout(() => {
          window.location.href = responseData.paymentUrl;
        }, 3000);
        return;
      }

      if (responseData.status === "OPEN") {
        message.success("Đăng việc thành công!");
        navigate("/");
      } else {
        message.error(responseData.message || "Tạo công việc thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || isRedirecting || !termsAccepted;
  const isProcessing = isSubmitting || isRedirecting;

  return (
    <div className={styles.jobInfoContainer}>
      <Title level={5} className={styles.infoTitle}>
        Lịch trình làm việc
      </Title>
      {schedules.length === 0 ? (
        <Paragraph>Chưa có lịch trình nào được chọn.</Paragraph>
      ) : (
        <List
          dataSource={schedules}
          renderItem={(schedule) => (
            <List.Item>
              <Text>
                {dayjs(schedule.date).format("DD/MM/YYYY")} -{" "}
                {schedule.hour.toString().padStart(2, "0")}:
                {schedule.minute.toString().padStart(2, "0")}
              </Text>
            </List.Item>
          )}
        />
      )}

      <Title level={5} className={styles.infoTitle}>
        Chi tiết
      </Title>
      <Paragraph className={styles.infoRow}>
        <Text>Loại dịch vụ</Text>
        {state?.serviceName ? (
          <Text>{state.serviceName}</Text>
        ) : (
          <Text className={styles.serviceTags}>
            {state?.serviceDetails?.map((service, index) => (
              <Text key={index} className={styles.serviceTag}>
                {service.serviceName}
              </Text>
            ))}
          </Text>
        )}
      </Paragraph>
      <Paragraph className={styles.infoRow}>
        <Text>Địa điểm</Text>
        <Text>{state.address}</Text>
      </Paragraph>
      <Paragraph className={styles.infoRow}>
        <Text>Khối lượng công việc</Text>
        {state?.selectedSize ? (
          <Text>
            {state.selectedSize}m² - {state.maxSize}m²
          </Text>
        ) : (
          <Text className={styles.serviceTags}>
            {state?.serviceDetails?.map((service, index) => (
              <Text key={index} className={styles.serviceTag}>
                {service.serviceName} | {service.selectedSize}m² -{" "}
                {service.maxSize}m²
              </Text>
            ))}
          </Text>
        )}
      </Paragraph>
      <Paragraph className={styles.infoRow}>
        <Text>Phương thức thanh toán</Text>
        <Text>
          {paymentMethod === "VNPay" && "Thanh toán VNPay"}
          {paymentMethod === "wallet" && "Thanh toán ví điện tử"}
          {!paymentMethod && "Chưa chọn"}
        </Text>
      </Paragraph>

      <div className={styles.divider}></div>

      <div className={styles.totalContainer}>
        {priceAdjustment && basePrice !== adjustedPrice && (
          <div className={styles.priceColumn}>
            <div className={styles.priceLabelValue}>
              <Text className={styles.priceLabel}>Giá cơ bản</Text>
              <Text className={styles.priceValue}>
                {basePrice.toLocaleString()} VNĐ
              </Text>
            </div>
          </div>
        )}
        {priceAdjustment && (
          <div className={styles.priceColumn}>
            <div className={styles.priceLabelValue}>
              <Text className={styles.priceLabel}>Phụ phí</Text>
              <Text className={styles.priceValue} style={{ color: "red" }}>
                +{priceAdjustment.percentage}% do {priceAdjustment.reason}
              </Text>
            </div>
          </div>
        )}
        <div className={styles.priceColumn}>
          <div className={styles.priceLabelValue}>
            <Text className={styles.priceLabel}>Tổng thanh toán</Text>
            <Text className={styles.priceValue}>
              {Math.round(adjustedPrice).toLocaleString()} VNĐ
            </Text>
          </div>
        </div>
      </div>

      <div style={{ margin: "16px 0px" }}>
        <Checkbox
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          disabled={isSubmitting || isRedirecting}
        >
          <Text style={{ fontSize: "14px" }}>
            Tôi đồng ý với <Text strong>Điều khoản và dịch vụ</Text> của
            HouseClean
          </Text>
        </Checkbox>
      </div>

      <div className={styles.actionButtons}>
        {isProcessing ? (
          <Link className={styles.linkReset}>
            <div
              className={styles.cancelButton}
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            >
              Hủy
            </div>
          </Link>
        ) : (
          <Link to="/" className={styles.linkReset}>
            <div className={styles.cancelButton}>Hủy</div>
          </Link>
        )}
        <div
          className={styles.submitButton}
          onClick={handleCreateJob}
          style={{
            opacity: isButtonDisabled ? 0.7 : 1,
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting || isRedirecting ? "Đang xử lý..." : "Đăng việc"}
        </div>
      </div>
    </div>
  );
};

export default JobInfomation;
