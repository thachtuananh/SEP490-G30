import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button, message } from "antd";
import { FaClock, FaSearchLocation, FaDollarSign, FaCommentAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext"; // Lấy token từ AuthContext
import styles from "../../assets/CSS/work/WorkDetailsDescription.module.css";

const WorkDetailsDescription = () => {
  const { jobId } = useParams(); // Lấy jobId từ URL
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/cleaner/job/${jobId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => setJob(data))
      .catch((error) => console.error("Lỗi khi lấy chi tiết công việc:", error));
  }, [jobId, token]);

  // Hàm gửi yêu cầu nhận việc
  const handleApplyJob = () => {
    if (!token) {
      message.error("Bạn cần đăng nhập để nhận việc!");
      return;
    }

    fetch(`http://localhost:8080/api/cleaner/apply-job/${jobId}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể nhận việc!");
        }
        return response.json();
      })
      .then(() => {
        // message.success("Bạn đã nhận việc thành công!");
        navigate("/applysuccess");
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error("Lỗi khi nhận việc:", error);
        message.error("Nhận việc thất bại, vui lòng thử lại!");
      });
  };

  if (!job) {
    return <p>Đang tải chi tiết công việc...</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} - ${date.getMonth() + 1} - ${date.getFullYear()}`;
  };

  // const formatTime = (dateString) => {
  //   const date = new Date(dateString);
  //   const startHour = date.getHours();
  //   const endHour = startHour + 3;
  //   return `${endHour - startHour} giờ - Từ ${startHour}:00 đến ${endHour}:00`;
  // };

  return (
    <div className={styles.container}>
      {/* Left Card */}
      <div className={styles.leftCard}>
        <div className={styles.header}>
          <h3>{job.serviceName}</h3>
          <span>{job.status === "OPEN" ? "Đang mở" : "Đã đóng"}</span>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <FaDollarSign className={styles.icon} />
            <div className={styles.text}>
              <span>Thù lao</span>
              <b>{job.totalPrice.toLocaleString()} VNĐ</b>
            </div>
          </div>

          <div className={styles.infoItem}>
            <FaSearchLocation className={styles.icon} />
            <div className={styles.text}>
              <span>Địa điểm</span>
              <b>{job.customerAddress}</b>
            </div>
          </div>

          <div className={styles.infoItem}>
            <FaClock className={styles.icon} />
            <div className={styles.text}>
              <span>Thời gian</span>
              <b>{formatDate(job.scheduledTime)}</b>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Button className={styles.contactButton} icon={<FaCommentAlt />}>
            Liên hệ
          </Button>
          <Button type="primary" className={styles.acceptButton} onClick={() => setIsModalOpen(true)}>
            Nhận việc
          </Button>
        </div>
      </div>

      {/* Right Card */}
      <div className={styles.rightCard}>
        <h3>Thông tin chung</h3>
        <h4>Mô tả công việc</h4>
        <ul>
          <li >{job.serviceDescription}</li>
        </ul>
        <b>Loại dịch vụ:</b>
        <ul>
          {job.serviceDetails.map((detail) => (
            <li key={detail.serviceDetailId}>{detail.name} - {detail.description}</li>
          ))}
        </ul>

        <b>Ưu đãi:</b>
        <ul>
          <li>
            {job.serviceDetails[0]?.discounts || "Không có ưu đãi"}
          </li>
        </ul>


        <b>Khách hàng:</b>
        <ul>
          <li>
            {job.customerName} - {job.customerPhone}
          </li>
        </ul>
      </div>

      {/* Modal Nhận Việc */}
      <Modal title="Xác nhận nhận việc" open={isModalOpen} onOk={handleApplyJob} onCancel={() => setIsModalOpen(false)}>
        <p>Bạn có chắc chắn muốn nhận công việc này không?</p>
      </Modal>
    </div>
  );
};

export default WorkDetailsDescription;
