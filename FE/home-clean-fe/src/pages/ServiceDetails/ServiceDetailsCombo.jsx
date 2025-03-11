import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Radio, Button, message } from "antd";
import styles from "../../components/combo-service/JobUpload.module.css";
import ServiceSelectionModal from "../../components/combo-service/ServiceSelectionModal";

const ServiceDetailsCombo = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedServices: initialSelectedServices, allServices } = location.state || { selectedServices: [], allServices: [] };

    const [selectedServices, setSelectedServices] = useState(initialSelectedServices || []);
    const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);

    // Find service details based on ID
    const getServiceDetails = (serviceId) => {
        return allServices.find(service => service.id === serviceId);
    };

    const onServiceChange = (serviceId) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            console.log('Selected services:', selectedServices);
            console.log('Form values:', values);

            // Handle form submission

            // Navigate back to home
            navigate("/createjob");
        });
    };

    const handleGoBack = () => {
        navigate("/");
    };

    const showServiceModal = () => {
        setIsServiceModalVisible(true);
    };

    const handleServiceCancel = () => {
        setIsServiceModalVisible(false);
    };

    const handleServiceOk = () => {
        if (selectedServices.length === 0) {
            message.error('Vui lòng chọn ít nhất một dịch vụ!');
            return;
        }
        setIsServiceModalVisible(false);
    };

    const totalPrice = selectedServices.reduce((total, id) => {
        return total + (id <= 4 ? 170000 : 350000);
    }, 0);

    return (
        <div className={styles.pageContainerCombo}>
            <div className={styles.headerContainer}>
                <h1 className={styles.header}>Điền thông tin dịch vụ</h1>
            </div>

            <div className={styles.serviceDetailsContainer}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ location: 'Số 36 Đường Tôn Đức Thắng, Khu 2, Thị trấn Côn Đảo, Huyện Côn Đảo, Tỉnh Bà Rịa – Vũng Tàu, Việt Nam.' }}
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
                            const isCleaningService = serviceId <= 4;
                            return (
                                <div key={serviceId} className={styles.selectedServiceItem}>
                                    <div className={styles.selectedServiceHeader}>
                                        <span>{service?.title || `Dịch vụ ${serviceId}`}</span>
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
                                                {isCleaningService ? "170.000 đ" : "350.000 đ"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className={styles.addMoreService}>
                            <Button
                                type="dashed"
                                onClick={showServiceModal}
                                block
                            >
                                Thêm dịch vụ +
                            </Button>
                        </div>

                        <div className={styles.totalPrice}>
                            <div>Tổng giá</div>
                            <div className={styles.totalPriceValue}>
                                {totalPrice.toLocaleString()} đ
                            </div>
                        </div>
                        <div className={styles.priceNote}>Giá đã bao gồm VAT</div>
                    </div>

                    <div className={styles.actionButtons}>
                        <Button
                            onClick={handleGoBack}
                            className={styles.backButton}
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            className={styles.continueButton}
                        >
                            Tiếp tục
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Service Selection Modal */}
            <ServiceSelectionModal
                isVisible={isServiceModalVisible}
                onCancel={handleServiceCancel}
                onOk={handleServiceOk}
                selectedServices={selectedServices}
                onServiceChange={onServiceChange}
                allServices={allServices}
            />
        </div>
    );
};

export default ServiceDetailsCombo;