import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { message, Typography, Modal, Checkbox } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";
import dayjs from "dayjs";
import { createJob } from "../../services/owner/OwnerAPI";
import { sendNotification } from "../../services/NotificationService";
const { Title, Text, Paragraph } = Typography;

const JobInfomation = ({
  selectedDate,
  hour,
  minute,
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
  const [basePrice, setBasePrice] = useState(0);
  const [adjustedPrice, setAdjustedPrice] = useState(0);

  const { token, customerId } = useContext(AuthContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.serviceDetails && state.serviceDetails.length > 0) {
      const totalBasePrice = state.serviceDetails.reduce((total, service) => {
        return total + (service.price || 0);
      }, 0);
      setBasePrice(totalBasePrice);
    } else if (state.price) {
      setBasePrice(state.price);
    }
  }, [state.serviceDetails, state.price]);

  useEffect(() => {
    if (priceAdjustment && basePrice) {
      const adjustmentAmount = basePrice * (priceAdjustment.percentage / 100);
      setAdjustedPrice(basePrice + adjustmentAmount);
    } else {
      setAdjustedPrice(basePrice);
    }
  }, [basePrice, priceAdjustment]);

  const validateJobTime = () => {
    if (!selectedDate) {
      message.error("Vui lòng chọn ngày và giờ làm việc!");
      return false;
    }

    const selectedDateTime = dayjs(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute
      )
    );

    if (selectedDateTime.isBefore(currentTime)) {
      Modal.warning({
        title: "Thời gian không hợp lệ",
        content:
          "Thời gian bạn chọn đã là quá khứ. Vui lòng cập nhật thời gian bắt đầu.",
        okText: "Đã hiểu",
      });
      return false;
    }

    if (selectedDateTime.diff(currentTime, "minute") < 30) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: "Thời gian quá gần",
          content: `Thời gian bạn chọn chỉ còn ${selectedDateTime.diff(
            currentTime,
            "minute"
          )} phút nữa. 
                             Người dọn dẹp có thể không kịp nhận việc. Bạn có muốn tiếp tục?`,
          okText: "Tiếp tục",
          cancelText: "Hủy",
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    }

    return true;
  };

  const handleCreateJob = async () => {
    if (isSubmitting || isRedirecting) {
      return;
    }

    if (!termsAccepted) {
      message.error("Vui lòng đồng ý với Điều khoản và dịch vụ để tiếp tục!");
      return;
    }

    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    setIsSubmitting(true);

    try {
      const isTimeValid = await validateJobTime();
      if (!isTimeValid) {
        setIsSubmitting(false);
        return;
      }

      if (!token) {
        console.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        message.error("Vui lòng đăng nhập lại để tiếp tục!");
        setIsSubmitting(false);
        return;
      }

      const formattedJobTime = `${selectedDate.getFullYear()}-${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${selectedDate
        .getDate()
        .toString()
        .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`;

      // Tạo mảng services dựa trên quantity
      const services = state.serviceDetails
        ? state.serviceDetails.reduce((acc, service) => {
            const serviceEntry = {
              serviceId: service.serviceId,
              serviceDetailId: service.serviceDetailId,
              imageUrl: "http://example.com/room.jpg",
            };
            // Thêm serviceEntry vào mảng acc quantity lần
            return [...acc, ...Array(service.quantity).fill(serviceEntry)];
          }, [])
        : [
            {
              serviceId,
              serviceDetailId,
              imageUrl: "http://example.com/room.jpg",
            },
          ];

      const normalizedPaymentMethod =
        paymentMethod === "wallet" ? "Wallet" : paymentMethod;

      const jobData = {
        customerAddressId,
        jobTime: formattedJobTime,
        services,
        paymentMethod: normalizedPaymentMethod,
        reminder,
      };

      console.log("Job data being sent:", jobData);

      const responseData = await createJob(customerId, jobData);

      if (normalizedPaymentMethod === "VNPay" && responseData.paymentUrl) {
        setIsRedirecting(true);

        let countDown = 3;
        const messageKey = "redirectCountdown";

        message.info({
          content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
          key: messageKey,
          duration: 3.5,
        });

        const interval = setInterval(() => {
          countDown -= 1;
          message.info({
            content: `Bạn sẽ được chuyển đến cổng thanh toán VNPay trong ${countDown} giây!`,
            key: messageKey,
            duration: 1.5,
          });

          if (countDown === 0) {
            clearInterval(interval);
          }
        }, 1000);

        setTimeout(() => {
          window.location.href = responseData.paymentUrl;
        }, 3000);

        return;
      }

      if (responseData.status === "OPEN") {
        message.success("Đăng việc thành công!");
        navigate("/");
      } else {
        console.error("Lỗi khi tạo job:", responseData);
        message.error(
          responseData.message || "Tạo job thất bại, vui lòng thử lại!"
        );
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || isRedirecting || !termsAccepted;
  const isProcessing = isSubmitting || isRedirecting;

  return (
    <>
      <div className={styles.jobInfoContainer}>
        <Title level={5} className={styles.infoTitle}>
          Thời gian làm việc
        </Title>
        <Paragraph className={styles.infoRow}>
          <Text>Ngày làm việc</Text>
          <Text>
            {selectedDate
              ? `${selectedDate.getDate().toString().padStart(2, "0")} - ${(
                  selectedDate.getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")} - ${selectedDate.getFullYear()}`
              : "Chưa chọn"}
          </Text>
        </Paragraph>
        <Paragraph className={styles.infoRow}>
          <Text>Thời gian làm việc</Text>
          <Text>
            {selectedDate
              ? `${hour.toString().padStart(2, "0")} : ${minute
                  .toString()
                  .padStart(2, "0")}`
              : "Chưa chọn"}
          </Text>
        </Paragraph>
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
                  {service.serviceName} (x{service.quantity})
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
              {state.selectedSize}m² - {state.maxSize} m²
            </Text>
          ) : (
            <Text className={styles.serviceTags}>
              {state?.serviceDetails?.map((service, index) => (
                <Text key={index} className={styles.serviceTag}>
                  {service.serviceName} | {service.selectedSize}m² -{" "}
                  {service.maxSize}m² (x{service.quantity})
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
        {priceAdjustment && (
          <Paragraph className={styles.infoRow} style={{ color: "#1890ff" }}>
            <Text>Phụ phí</Text>
            <Text style={{ color: "red" }}>
              +{priceAdjustment.percentage}% do {priceAdjustment.reason}
            </Text>
          </Paragraph>
        )}
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
              style={{
                opacity: 0.7,
                cursor: "not-allowed",
              }}
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
          {isSubmitting
            ? "Đăng việc"
            : isRedirecting
            ? "Đang chuyển hướng..."
            : "Đăng việc"}
        </div>
      </div>
    </>
  );
};

export default JobInfomation;
