import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { message, Typography, Modal, Checkbox, List } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";
import dayjs from "dayjs";
import { createJobShedule } from "../../services/owner/OwnerAPI";

const { Title, Text, Paragraph } = Typography;

const JobInformation = ({
  serviceSchedules,
  paymentMethod,
  reminder,
  priceAdjustment,
  price,
  address,
  customerAddressId,
  serviceDetails,
}) => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [basePrice, setBasePrice] = useState(price || 0);
  const [adjustedPrice, setAdjustedPrice] = useState(price || 0);
  const [serviceNames, setServiceNames] = useState({});
  const [serviceDetailsMap, setServiceDetailsMap] = useState({});

  const { token, customerId } = useContext(AuthContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nameMap = {};
    const detailsMap = {};
    if (serviceDetails && serviceDetails.length > 0) {
      serviceDetails.forEach((service) => {
        nameMap[service.serviceId] =
          service.serviceName || `Dịch vụ ${service.serviceId}`;
        detailsMap[service.serviceDetailId] = service;
      });
      setServiceNames(nameMap);
      setServiceDetailsMap(detailsMap);
    }
  }, [serviceDetails]);

  useEffect(() => {
    if (priceAdjustment && basePrice) {
      const adjustmentAmount = basePrice * (priceAdjustment.percentage / 100);
      setAdjustedPrice(basePrice + adjustmentAmount);
    } else {
      setAdjustedPrice(basePrice);
    }
  }, [priceAdjustment, basePrice]);

  useEffect(() => {
    if (price) {
      setBasePrice(price);
      if (priceAdjustment) {
        const adjustmentAmount = price * (priceAdjustment.percentage / 100);
        setAdjustedPrice(price + adjustmentAmount);
      } else {
        setAdjustedPrice(price);
      }
    }
  }, [price, priceAdjustment]);

  const validateJobTimes = async () => {
    let hasSchedules = false;
    for (const serviceId in serviceSchedules) {
      if (serviceSchedules[serviceId].length > 0) {
        hasSchedules = true;
        for (const schedule of serviceSchedules[serviceId]) {
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
      }
    }

    if (!hasSchedules) {
      message.error("Vui lòng chọn ít nhất một lịch trình làm việc!");
      return false;
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

      // Group schedules by jobTime to create jobs with multiple services
      const jobMap = {};
      for (const serviceId in serviceSchedules) {
        if (serviceSchedules[serviceId].length > 0) {
          serviceSchedules[serviceId].forEach((schedule) => {
            const jobTime = dayjs(schedule.jobTime).format(
              "YYYY-MM-DDTHH:mm:ss"
            );
            if (!jobMap[jobTime]) {
              jobMap[jobTime] = [];
            }
            jobMap[jobTime].push({
              serviceId: Number(serviceId),
              serviceDetailId: Number(schedule.serviceDetailId),
              imageUrl: "http://example.com/room.jpg",
            });
          });
        }
      }

      // Convert jobMap to jobs array
      const jobs = Object.keys(jobMap).map((jobTime) => ({
        jobTime,
        services: jobMap[jobTime],
      }));

      const jobData = {
        customerAddressId: Number(customerAddressId),
        paymentMethod: paymentMethod === "wallet" ? "Wallet" : paymentMethod,
        reminder: reminder || "",
        jobs,
      };

      const responseData = await createJobShedule(customerId, jobData);

      if (paymentMethod === "VNPay" && responseData.paymentUrl) {
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

      if (responseData.message === "Đặt lịch thành công") {
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

  const getServiceName = (serviceId) => {
    return serviceNames[serviceId] || `Dịch vụ ${serviceId}`;
  };

  // Filter serviceDetails based on serviceSchedules
  const getScheduledServiceDetails = () => {
    const scheduledDetails = new Set();
    Object.keys(serviceSchedules).forEach((serviceId) => {
      serviceSchedules[serviceId].forEach((schedule) => {
        const detail = serviceDetails.find(
          (d) => d.serviceDetailId === schedule.serviceDetailId
        );
        if (detail) {
          scheduledDetails.add(
            JSON.stringify({
              serviceId: detail.serviceId,
              serviceName: getServiceName(detail.serviceId),
              minRoomSize: detail.minRoomSize,
              maxSize: detail.maxSize,
            })
          );
        }
      });
    });
    return Array.from(scheduledDetails).map((item) => JSON.parse(item));
  };

  const scheduledServiceDetails = getScheduledServiceDetails();

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.scheduleSection}>
        <Title level={5} className={styles.infoTitle}>
          Lịch trình làm việc
        </Title>
        {Object.keys(serviceSchedules).every(
          (serviceId) => serviceSchedules[serviceId].length === 0
        ) ? (
          <Paragraph className={styles.emptySchedule}>
            Chưa có lịch trình nào được chọn.
          </Paragraph>
        ) : (
          <div className={styles.scheduleContainer}>
            {Object.keys(serviceSchedules).map(
              (serviceId) =>
                serviceSchedules[serviceId].length > 0 && (
                  <div key={serviceId} className={styles.serviceScheduleCard}>
                    <div className={styles.serviceNameHeader}>
                      <Text strong>{getServiceName(serviceId)}</Text>
                    </div>
                    <List
                      className={styles.scheduleList}
                      itemLayout="horizontal"
                      dataSource={serviceSchedules[serviceId]}
                      renderItem={(schedule) => (
                        <List.Item className={styles.scheduleItem}>
                          <div className={styles.scheduleItemContent}>
                            <div className={styles.scheduleDate}>
                              {dayjs(schedule.date).format("DD/MM/YYYY")}
                            </div>
                            <div className={styles.scheduleTime}>
                              {schedule.hour.toString().padStart(2, "0")}:
                              {schedule.minute.toString().padStart(2, "0")} |{" "}
                              {
                                serviceDetails.find(
                                  (d) =>
                                    d.serviceDetailId ===
                                    schedule.serviceDetailId
                                )?.minRoomSize
                              }
                              m² -{" "}
                              {
                                serviceDetails.find(
                                  (d) =>
                                    d.serviceDetailId ===
                                    schedule.serviceDetailId
                                )?.maxSize
                              }
                              m²
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )
            )}
          </div>
        )}
      </div>
      <Title level={5} className={styles.infoTitle}>
        Chi tiết
      </Title>
      <Paragraph className={styles.infoRow}>
        <Text>Địa điểm</Text>
        <Text>{address || "Chưa chọn địa chỉ"}</Text>
      </Paragraph>
      <Paragraph className={styles.infoRow}>
        <Text>Khối lượng công việc</Text>
        <Text className={styles.serviceTags}>
          {scheduledServiceDetails.length > 0 ? (
            scheduledServiceDetails.map((service, index) => (
              <Text key={index} className={styles.serviceTag}>
                {service.serviceName} | {service.minRoomSize}m² -{" "}
                {service.maxSize}m²
              </Text>
            ))
          ) : (
            <Text>Chưa chọn dịch vụ</Text>
          )}
        </Text>
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

      {basePrice > 0 ? ( // Chỉ hiển thị giá nếu basePrice > 0
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
      ) : (
        <Paragraph>Chưa có lịch trình nào để tính giá.</Paragraph>
      )}

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

export default JobInformation;
