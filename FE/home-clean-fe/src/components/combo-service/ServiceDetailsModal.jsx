import React from "react";
import { Modal, Button, Form, Input, Radio } from "antd";
import styles from "./JobUpload.module.css";

const ServiceDetailsModal = ({
    isVisible,
    onCancel,
    onOk,
    form,
    selectedServices,
    getServiceDetails,
    onServiceChange,
    switchToServiceSelection
}) => {
    return (
        <Modal
            title="Điền thông tin dịch vụ"
            open={isVisible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Quay lại
                </Button>,
                <Button key="submit" type="primary" onClick={onOk}>
                    Tiếp tục
                </Button>,
            ]}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ location: 'Số 35 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đảo, Huyện Côn Đảo, Tỉnh Bà Rịa – Vũng Tàu, Việt Nam.' }}
            >
                <Form.Item
                    name="location"
                    label="Chọn vị trí"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input.TextArea readOnly />
                </Form.Item>
                <div>
                    <div className={styles.serviceHeaderText}>Dịch vụ chọn</div>
                    {selectedServices.map(serviceId => {
                        const service = getServiceDetails(serviceId);
                        return (
                            <div key={serviceId} className={styles.selectedServiceItem}>
                                <div className={styles.selectedServiceHeader}>
                                    <span>{service.title}</span>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<span>🗑️</span>}
                                        onClick={() => onServiceChange(serviceId)}
                                    />
                                </div>
                                <div className={styles.serviceAreaSelection}>
                                    <div>Diện tích</div>
                                    <Form.Item name={`area_${serviceId}`} noStyle>
                                        <Radio.Group>
                                            <Radio.Button value="small">{"< 20m²"}</Radio.Button>
                                            <Radio.Button value="medium">20m² - 40m²</Radio.Button>
                                            <Radio.Button value="large">{"> 40m²"}</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                    <div className={styles.servicePrice}>
                                        Giá dịch vụ
                                        <div className={styles.servicePriceValue}>
                                            {serviceId <= 4 ? "170.000 đ" : "350.000 đ"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className={styles.addMoreService}>
                        <Button
                            type="dashed"
                            onClick={switchToServiceSelection}
                            block
                        >
                            Thêm dịch vụ +
                        </Button>
                    </div>
                    <div className={styles.totalPrice}>
                        <div>Tổng giá</div>
                        <div className={styles.totalPriceValue}>
                            {selectedServices.reduce((total, id) => {
                                return total + (id <= 4 ? 170000 : 350000);
                            }, 0).toLocaleString()} VND
                        </div>
                    </div>
                    <div className={styles.priceNote}>Giá đã bao gồm VAT</div>
                </div>
            </Form>
        </Modal>
    );
};

export default ServiceDetailsModal;