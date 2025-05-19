import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { message, Typography, Modal, Checkbox } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";
import dayjs from "dayjs";
import { createJob } from "../../services/owner/OwnerAPI"; // Import API function
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

  // State để kiểm tra thời gian
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Thêm state để theo dõi trạng thái đang chuyển hướng
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [basePrice, setBasePrice] = useState(state.price || 0);
  const [adjustedPrice, setAdjustedPrice] = useState(state.price || 0);

  // token
  const { token, customerId } = useContext(AuthContext);

  // Cập nhật thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(timer);
  }, []);

  // Calculate adjusted price when price adjustment changes
  useEffect(() => {
    if (priceAdjustment && basePrice) {
      const adjustmentAmount = basePrice * (priceAdjustment.percentage / 100);
      setAdjustedPrice(basePrice + adjustmentAmount);
    } else {
      setAdjustedPrice(basePrice);
    }
  }, [priceAdjustment, basePrice]);

  // Set base price when state.price changes
  useEffect(() => {
    if (state.price) {
      setBasePrice(state.price);

      // Initially calculate adjusted price
      if (priceAdjustment) {
        const adjustmentAmount =
          state.price * (priceAdjustment.percentage / 100);
        setAdjustedPrice(state.price + adjustmentAmount);
      } else {
        setAdjustedPrice(state.price);
      }
    }
  }, [state.price]);

  const validateJobTime = () => {
    if (!selectedDate) {
      message.error("Vui lòng chọn ngày và giờ làm việc!");
      return false;
    }

    // Tạo đối tượng dayjs từ thời gian đã chọn
    const selectedDateTime = dayjs(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute
      )
    );

    // Kiểm tra nếu thời gian đã chọn nằm trong quá khứ
    if (selectedDateTime.isBefore(currentTime)) {
      Modal.warning({
        title: "Thời gian không hợp lệ",
        content:
          "Thời gian bạn chọn đã là quá khứ. Vui lòng cập nhật thời gian bắt đầu.",
        okText: "Đã hiểu",
      });
      return false;
    }

    // Kiểm tra nếu thời gian đã chọn quá gần hiện tại (ít hơn 30 phút)
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
    // Kiểm tra nếu đang trong quá trình xử lý hoặc chuyển hướng thì không làm gì
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
      // Validate job time
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

      // Check if we have multiple services selected
      const services = state.serviceDetails
        ? state.serviceDetails.map((service) => ({
            serviceId: service.serviceId,
            serviceDetailId: service.serviceDetailId,
            imageUrl: "http://example.com/room.jpg",
          }))
        : [
            {
              serviceId,
              serviceDetailId,
              imageUrl: "http://example.com/room.jpg",
            },
          ];

      // Đảm bảo gửi đúng định dạng của payment method
      // Chuyển đổi "wallet" thành "Wallet" để khớp với định dạng mong muốn
      const normalizedPaymentMethod =
        paymentMethod === "wallet" ? "Wallet" : paymentMethod;

      // Keep only the required fields as specified
      const jobData = {
        customerAddressId,
        jobTime: formattedJobTime,
        services: services,
        paymentMethod: normalizedPaymentMethod, // Sử dụng payment method đã chuẩn hóa
        reminder: reminder,
      };

      console.log("Job data being sent:", jobData); // Add this for debugging

      const responseData = await createJob(customerId, jobData);

      // Handle VNPay payment URL if present
      if (normalizedPaymentMethod === "VNPay" && responseData.paymentUrl) {
        // Đặt trạng thái đang chuyển hướng để chặn các click tiếp theo
        setIsRedirecting(true);

        // Hiển thị thông báo với thanh tiến trình đếm ngược
        // let countdown = 3;
        // const countdownInterval = setInterval(() => {
        //   countdown -= 1;
        //   if (countdown > 0) {
        //     message.loading(
        //       `Đang chuyển đến trang thanh toán VNPay sau ${countdown} giây...`,
        //       1
        //     );
        //   } else {
        //     clearInterval(countdownInterval);
        //   }
        // }, 1000);

        // Show notification that user will be redirected
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

        // Set timeout before redirecting to payment gateway
        setTimeout(() => {
          // Redirect to VNPay payment gateway in the current tab
          window.location.href = responseData.paymentUrl;
        }, 3000);

        return;
      }

      if (responseData.status === "OPEN") {
        message.success("Đăng việc thành công!");
        // try {
        //   await sendNotification(
        //     customerId,
        //     `Bạn đã đăng việc thành công: ${
        //       state.serviceName ||
        //       (state.serviceDetails && state.serviceDetails[0]?.serviceName) ||
        //       "Dọn dẹp"
        //     }`,
        //     "Tạo việc"
        //   );
        // } catch (notifError) {
        //   console.error("Không thể gửi thông báo:", notifError);
        // }
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

  // Xác định khi nào nút bị vô hiệu hóa
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
              {state.selectedSize}m² - {state.maxSize} m²
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

        {/* {priceAdjustment && (
          <Paragraph className={styles.infoRow} style={{ color: "#1890ff" }}>
            <Text>Phụ phí</Text>
            <Text style={{ color: "red" }}>
              +{priceAdjustment.percentage}% do {priceAdjustment.reason}
            </Text>
          </Paragraph>
        )} */}

        <div className={styles.divider}></div>

        <div className={styles.totalContainer}>
          {/* Base price row */}
          <div className={styles.priceColumn}>
            {priceAdjustment && basePrice !== adjustedPrice && (
              <div className={styles.priceLabelValue}>
                <Text className={styles.priceLabel}>Giá cơ bản</Text>
                <Text className={styles.priceValue}>
                  {basePrice.toLocaleString()} VNĐ
                </Text>
              </div>
            )}
          </div>

          {/* Surcharge row */}
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

          {/* Total payment row */}
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
          // Render nút Hủy không có link khi đang xử lý
          <>
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
          </>
        ) : (
          // Render nút Hủy với link chỉ khi không đang xử lý
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
            ? "Đăng việc"
            : "Đăng việc"}
        </div>
      </div>
    </>
  );
};

export default JobInfomation;
