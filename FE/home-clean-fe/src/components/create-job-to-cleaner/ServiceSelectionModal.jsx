import React from "react";
import { Modal, Button, Checkbox } from "antd";
import styles from "../combo-service/JobUpload.module.css";

const ServiceSelectionModal = ({
    isVisible,
    onCancel,
    onOk,
    selectedServices,
    onServiceChange,
    allServices
}) => {
    return (
        <Modal
            title="Chọn dịch vụ"
            open={isVisible}
            onCancel={onCancel}
            footer={[
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button key="cancel" onClick={onCancel} style={{ borderRadius: '4px' }}>
                        Huỷ
                    </Button>
                    <Button
                        key="continue"
                        type="primary"
                        onClick={onOk}
                        style={{
                            backgroundColor: '#039855',
                            borderColor: '#039855',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        Tiếp tục <span style={{ marginLeft: '4px' }}>→</span>
                    </Button>
                </div>
            ]}
            width={800}
        >
            <p>Chọn những dịch vụ bạn muốn</p>
            <div className={styles.serviceCheckboxGrid}>
                {allServices.map((service) => (
                    <div
                        key={service.id}
                        className={`${styles.serviceCheckboxItem} ${selectedServices.includes(service.id) ? styles.serviceCheckboxItemSelected : ''}`}
                        style={{
                            border: selectedServices.includes(service.id) ? '1px solid #039855' : '1px solid #e6e6e6',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => onServiceChange(service.id)}
                    >
                        <div style={{ marginBottom: '8px' }}>
                            <img
                                src={service.icon}
                                alt={service.title}
                                style={{ width: '40px', height: '40px' }}
                            />
                        </div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {service.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {service.description}
                        </div>
                        <div style={{
                            marginTop: '12px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Checkbox
                                checked={selectedServices.includes(service.id)}
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