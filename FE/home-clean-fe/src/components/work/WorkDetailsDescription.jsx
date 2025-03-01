import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import { FaClock, FaSearchLocation, FaDollarSign, FaCommentAlt } from "react-icons/fa";
import styles from "../../assets/CSS/work/WorkDetailsDescription.module.css";

const WorkDetailsDesCription = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <div className={styles.container}>
      <div className={styles.leftCard}>
        <div className={styles.header}>
          <h3>Dọn phòng khách</h3>
          <span>Đăng vào 2 tiếng trước</span>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <FaDollarSign className={styles.icon} />
            <div className={styles.text}>
              <span>Thù lao</span>
              <b>900.000 VNĐ</b>
            </div>
          </div>

          <div className={styles.infoItem}>
            <FaSearchLocation className={styles.icon} />
            <div className={styles.text}>
              <span>Địa điểm</span>
              <b>Hà Nội</b>
            </div>
          </div>

          <div className={styles.infoItem}>
            <FaClock className={styles.icon} />
            <div className={styles.text}>
              <span>Thời gian</span>
              <b>13h - 15h</b>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Button className={styles.contactButton} icon={<FaCommentAlt />}>
            Liên hệ
          </Button>
          <Button type="primary" className={styles.acceptButton} onClick={showModal}>
            Nhận việc
          </Button>
        </div>
      </div>

      <div className={styles.rightCard}>
        <h3>Thông tin chung</h3>
        <h4>Mô tả công việc</h4>
        <b>Loại dịch vụ:</b>
        <ul>
          <li>Dọn phòng khách</li>
        </ul>

        <b>Yêu cầu ứng viên:</b>
        <ul>
          <li>Hiểu rõ quy trình dọn vệ sinh</li>
          <li>Tác phong nhanh nhẹn</li>
          <li>Không yêu cầu kinh nghiệm</li>
          <li>Cẩn thận, tỉ mỉ</li>
        </ul>

        <b>Địa điểm làm việc</b>
        <p>Hà Nội: Hoàn Kiếm, Ba Đình, Cầu Giấy</p>

        <b>Thời gian làm việc</b>
        <p>Thứ 2 (từ 13:00 đến 15:00)</p>
      </div>

      {/* Modal Nhận Việc */}
      <Modal title="Ứng tuyển dọn phòng khách" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <div className={styles.modalContent}>
          <h4 className={styles.sectionTitle}>Nhập thông tin đầy đủ</h4>
          <p className={styles.description}>Vui lòng nhập thông tin đầy đủ</p>
          <Input placeholder="Nhập họ và tên" className={styles.input} />
          <Input placeholder="Nhập email" className={styles.input} />
          <Input placeholder="Nhập số điện thoại" className={styles.input} />

          <h4 className={styles.sectionTitle}>Lời giới thiệu của bạn với người thuê</h4>
          <p className={styles.description}>
            Một thư giới thiệu ngắn gọn, chỉnh chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với người thuê.
          </p>
          <Input.TextArea placeholder="Nhập lời giới thiệu" rows={4} className={styles.input} />

          <div className={styles.modalFooter}>
            <Button onClick={handleCancel} className={styles.cancelButton}>Hủy</Button>
            <Button type="primary" onClick={handleOk} className={styles.submitButton}>Nhận việc</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkDetailsDesCription;