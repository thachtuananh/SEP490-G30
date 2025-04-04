import React from "react";
import { Modal, Button, Checkbox } from "antd";
import styles from "./JobUpload.module.css";

// Import icons
import donBep from "../../assets/icon-home/don-bep.svg";
import donNhaVeSinh from "../../assets/icon-home/don-nha-vs.svg";
import donPhongKhach from "../../assets/icon-home/phong-khach.svg";
import donPhongNgu from "../../assets/icon-home/don-phong-ngu.svg";
import donDepSauTiec from "../../assets/icon-home/don-sk.svg";
import donDepNhaMoi from "../../assets/icon-home/nha-moi.svg";
import donDepVanPhong from "../../assets/icon-home/don-van-phong.svg";
import donDepTheoKy from "../../assets/icon-home/don-dinh-ky.svg";

// Icon mapping
const iconMap = {
  1: donPhongKhach,
  2: donBep,
  3: donPhongNgu,
  4: donNhaVeSinh,
  5: donDepSauTiec,
  6: donDepNhaMoi,
  7: donDepVanPhong,
  8: donDepTheoKy,
};

const ServiceSelectionModal = ({
  isVisible,
  onCancel,
  onOk,
  selectedServices,
  onServiceChange,
  allServices,
}) => {
  return (
    <Modal
      title="Chọn dịch vụ"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <Button
            key="cancel"
            onClick={onCancel}
            style={{ borderRadius: "4px" }}
          >
            Huỷ
          </Button>
          <Button
            key="continue"
            type="primary"
            onClick={onOk}
            style={{
              backgroundColor: "#039855",
              borderColor: "#039855",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Tiếp tục <span style={{ marginLeft: "4px" }}>→</span>
          </Button>
        </div>,
      ]}
      width={800}
    >
      <p>Chọn những dịch vụ bạn muốn</p>
      <div className={styles.serviceCheckboxGrid}>
        {allServices
          // Filter out the combo service (ID: 5)
          .filter((service) => service.serviceId !== 5)
          .map((service) => (
            <div
              key={service.serviceId}
              className={`${styles.serviceCheckboxItem} ${
                selectedServices.includes(service.serviceId)
                  ? styles.serviceCheckboxItemSelected
                  : ""
              }`}
              style={{
                border: selectedServices.includes(service.serviceId)
                  ? "1px solid #039855"
                  : "1px solid #e6e6e6",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => onServiceChange(service.serviceId)}
            >
              <div style={{ marginBottom: "8px" }}>
                <img
                  src={iconMap[service.serviceId]}
                  alt={service.serviceName}
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
              <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                {service.serviceName}
              </div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {service.description && service.description.length > 80
                  ? `${service.description.substring(0, 77)}...`
                  : service.description}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Checkbox
                  checked={selectedServices.includes(service.serviceId)}
                  className={styles.serviceCheckbox}
                  onChange={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default ServiceSelectionModal;
