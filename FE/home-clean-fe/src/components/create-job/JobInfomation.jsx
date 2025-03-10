import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { message } from "antd";
import styles from "../../assets/CSS/createjob/JobInformation.module.css";

const JobInfomation = ({ selectedDate, hour, minute }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const serviceId = state.serviceId;
    const serviceDetailId = state.serviceDetailId;
    const customerAddressId = state.customerAddressId;
    // token
    const { token, customerId } = useContext(AuthContext);

    const handleCreateJob = async () => {
        const formattedJobTime = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}T${hour
                .toString()
                .padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

        const jobData = {
            serviceId,
            serviceDetailId,
            jobTime: formattedJobTime,
            customerAddressId,
            imageUrl: "http://example.com/room.jpg",
        };

        const apiUrl = `http://localhost:8080/api/customer/${customerId}/createjob?customerId=${customerId}`;

        try {
            if (!token) {
                console.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
                return;
            }

            const response = await fetch(`http://localhost:8080/api/customer/${customerId}/createjob?customerId=${customerId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(jobData),
            });

            const responseData = await response.json();

            if (response.ok && responseData.status === "OPEN") {
                console.log("Job created successfully");
                navigate('/ordersuccess');
            } else {
                console.error("Lỗi khi tạo job:", responseData);
                message.error(responseData.message || "Tạo job thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
        }
    };

    return (
        <div className={styles.jobInfoContainer}>
            <h4 className={styles.infoTitle}>Thời gian làm việc</h4>
            <p className={styles.infoRow}>
                <span>Ngày làm việc</span>
                <span>{selectedDate
                    ? `Ngày ${selectedDate.getDate()} - Tháng ${selectedDate.getMonth() + 1} - Năm ${selectedDate.getFullYear()}`
                    : "Chưa chọn"}</span>
            </p>
            <p className={styles.infoRow}>
                <span>Thời gian làm việc</span>
                <span>
                    {selectedDate
                        ? `${hour}h : ${minute}p`
                        : "Chưa chọn"}
                </span>
            </p>

            <br />
            <h4 className={styles.infoTitle}>Chi tiết</h4>
            <p className={styles.infoRow}>
                <span>Loại dịch vụ</span>
                <span>{state?.serviceName}</span>
            </p>
            <p className={styles.infoRow}>
                <span>Địa điểm</span>
                <span>
                    {state.address}
                </span>
            </p>
            <p className={styles.infoRow}>
                <span>Khối lượng công việc</span>
                <span>
                    {state?.selectedSize || 0}m² - {state?.maxSize || 0}m²
                </span>
            </p>
            <p className={styles.infoRow}>
                <span>Số nhân công</span>
                <span>1 người</span>
            </p>
            <div className={styles.divider}></div>

            <div className={styles.totalContainer}>
                <span>Tổng thanh toán</span>
                <h4 className={styles.totalPrice}>
                    {state.price?.toLocaleString() || 0} VNĐ
                </h4>
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
                >
                    Đăng việc
                </div>
            </div>
        </div>
    );
};

export default JobInfomation;