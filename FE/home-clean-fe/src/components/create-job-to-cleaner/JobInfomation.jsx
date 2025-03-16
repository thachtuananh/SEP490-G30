import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { message, Typography, Modal, Checkbox } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";
import dayjs from "dayjs";
import { createJobToCleaner } from "../../services/owner/OwnerAPI"; // Import API function

const { Title, Text, Paragraph } = Typography;

const JobInfomation = ({ selectedDate, hour, minute }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const serviceId = state.serviceId;
    const serviceDetailId = state.serviceDetailId;
    const customerAddressId = state.customerAddressId;
    const cleanerId = parseInt(state.cleanerId);
    const [termsAccepted, setTermsAccepted] = useState(false);
    // State để kiểm tra thời gian
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());

    // token
    const { token, customerId } = useContext(AuthContext);

    // Cập nhật thời gian hiện tại mỗi phút
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000); // Cập nhật mỗi phút

        return () => clearInterval(timer);
    }, []);

    const validateJobTime = () => {
        if (!selectedDate) {
            message.error("Vui lòng chọn ngày và giờ làm việc!");
            return false;
        }

        // Tạo đối tượng dayjs từ thời gian đã chọn
        const selectedDateTime = dayjs(new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            hour,
            minute
        ));

        // Kiểm tra nếu thời gian đã chọn nằm trong quá khứ
        if (selectedDateTime.isBefore(currentTime)) {
            Modal.warning({
                title: 'Thời gian không hợp lệ',
                content: 'Thời gian bạn chọn đã là quá khứ. Vui lòng cập nhật thời gian bắt đầu.',
                okText: 'Đã hiểu'
            });
            return false;
        }

        // Kiểm tra nếu thời gian đã chọn quá gần hiện tại (ít hơn 30 phút)
        if (selectedDateTime.diff(currentTime, 'minute') < 30) {
            return new Promise((resolve) => {
                Modal.confirm({
                    title: 'Thời gian quá gần',
                    content: `Thời gian bạn chọn chỉ còn ${selectedDateTime.diff(currentTime, 'minute')} phút nữa. 
                             Nhân công có thể không kịp nhận việc. Bạn có muốn tiếp tục?`,
                    okText: 'Tiếp tục',
                    cancelText: 'Hủy',
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false)
                });
            });
        }

        return true;
    };
    const handleCreateJob = async () => {
        if (!termsAccepted) {
            message.error("Vui lòng đồng ý với Điều khoản và dịch vụ để tiếp tục!");
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

            const formattedJobTime = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}T${hour
                    .toString()
                    .padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

            // Check if we have multiple services selected
            const services = state.serviceDetails ?
                state.serviceDetails.map(service => ({
                    serviceId: service.serviceId,
                    serviceDetailId: service.serviceDetailId,
                    imageUrl: "http://example.com/room.jpg"
                })) :
                [{
                    serviceId,
                    serviceDetailId,
                    imageUrl: "http://example.com/room.jpg"
                }];

            const jobData = {
                customerAddressId,
                jobTime: formattedJobTime,
                services: services,
            };

            console.log("Job data being sent:", jobData);

            // Use the appropriate API call based on whether we have a cleaner ID
            let responseData;
            if (state.cleanerId) {
                console.log("Using createJobToCleaner with cleanerId:", state.cleanerId);
                responseData = await createJobToCleaner(customerId, state.cleanerId, jobData);
            } else {
                console.error("No cleanerId found in state:", state);
                message.error("Không thể tìm thấy thông tin nhân công!");
                return;
            }
            if (responseData.status === "BOOKED") {
                console.log("Job created successfully");
                message.success("Đăng việc thành công!");
                navigate('/ordersuccess');
            } else {
                console.error("Lỗi khi tạo job:", responseData);
                message.error(responseData.message || "Tạo job thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles.jobInfoContainer}>
                <Title level={5} className={styles.infoTitle}>Thời gian làm việc</Title>
                <Paragraph className={styles.infoRow}>
                    <Text>Ngày làm việc</Text>
                    <Text>{selectedDate
                        ? `${selectedDate.getDate().toString().padStart(2, '0')} - ${(selectedDate.getMonth() + 1).toString().padStart(2, '0')} - ${selectedDate.getFullYear()}`
                        : "Chưa chọn"}</Text>
                </Paragraph>
                <Paragraph className={styles.infoRow}>
                    <Text>Thời gian làm việc</Text>
                    <Text>
                        {selectedDate
                            ? `${hour.toString().padStart(2, '0')} : ${minute.toString().padStart(2, '0')}`
                            : "Chưa chọn"}
                    </Text>
                </Paragraph>
                <Title level={5} className={styles.infoTitle}>Chi tiết</Title>
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
                    <Text>
                        {state.address}
                    </Text>
                </Paragraph>
                <Paragraph className={styles.infoRow}>
                    <Text>Khối lượng công việc</Text>
                    {state?.selectedSize ? (
                        <Text>{state.selectedSize}m² - {state.maxSize} m²</Text>
                    ) : (
                        <Text className={styles.serviceTags}>
                            {state?.serviceDetails?.map((service, index) => (
                                <Text key={index} className={styles.serviceTag}>
                                    {service.serviceName} | {service.selectedSize}m² - {service.maxSize}m²
                                </Text>
                            ))}
                        </Text>
                    )}

                </Paragraph>
                <Paragraph className={styles.infoRow}>
                    <Text>Tên nhân công</Text>
                    <Text>{state.cleanerName || "Chưa chọn nhân công"}</Text>
                </Paragraph>
                <div className={styles.divider}></div>

                <div className={styles.totalContainer}>
                    <Text>Tổng thanh toán</Text>
                    <Title level={4} className={styles.totalPrice}>
                        {state.price?.toLocaleString() || 0} VNĐ
                    </Title>
                </div>


            </div>
            <div style={{ margin: '16px 0px' }}>
                <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                >
                    <Text style={{ fontSize: '14px' }}>
                        Tôi đồng ý với <Text strong>Điều khoản và dịch vụ</Text> của HouseClean
                    </Text>
                </Checkbox>
            </div>

            <div className={styles.actionButtons}>
                <Link to="/" className={styles.linkReset}>
                    <div className={styles.cancelButton}>
                        Hủy
                    </div>
                </Link>
                <div
                    className={styles.submitButton}
                    onClick={handleCreateJob}
                    style={{
                        opacity: (isSubmitting || !termsAccepted) ? 0.7 : 1,
                        cursor: (isSubmitting || !termsAccepted) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng việc'}
                </div>
            </div>
        </>
    );
};

export default JobInfomation;