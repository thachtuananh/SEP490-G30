import React, { useState } from "react";
import { Form, message } from "antd";
import styles from "./JobUpload.module.css";
import JobUploadCard from "./JobUploadCard";
import ServiceSelectionModal from "./ServiceSelectionModal";
import ServiceDetailsModal from "./ServiceDetailsModal";
import donBep from "../../assets/icon-home/don-bep.svg";
import donNhaVeSinh from "../../assets/icon-home/don-nha-vs.svg";
import donPhongKhach from "../../assets/icon-home/phong-khach.svg";
import donPhongNgu from "../../assets/icon-home/don-phong-ngu.svg";
import donDepSauTiec from "../../assets/icon-home/don-sk.svg";
import donDepNhaMoi from "../../assets/icon-home/nha-moi.svg";
import donDepVanPhong from "../../assets/icon-home/don-van-phong.svg";
import donDepTheoKy from "../../assets/icon-home/don-dinh-ky.svg";

const JobUpload = () => {
    const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [form] = Form.useForm();

    // Combined services array (regular + special)
    const allServices = [
        {
            id: 1,
            icon: donPhongKhach,
            title: "Dọn phòng khách",
            description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
        },
        {
            id: 2,
            icon: donBep,
            title: "Dọn bếp",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
        },
        {
            id: 3,
            icon: donPhongNgu,
            title: "Dọn phòng ngủ",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
        },
        {
            id: 4,
            icon: donNhaVeSinh,
            title: "Dọn nhà vệ sinh",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
        },
        {
            id: 5,
            icon: donDepSauTiec,
            title: "Dọn dẹp sau tiệc/tổ chức sự kiện",
            description: "Mô tả dịch vụ",
        },
        {
            id: 6,
            icon: donDepNhaMoi,
            title: "Dọn dẹp nhà mới xây, sau sửa chữa",
            description: "Mô tả dịch vụ",
        },
        {
            id: 7,
            icon: donDepVanPhong,
            title: "Dọn dẹp văn phòng, cửa hàng",
            description: "Mô tả dịch vụ",
        },
        {
            id: 8,
            icon: donDepTheoKy,
            title: "Dọn dẹp nhà theo định kỳ (Hàng tuần, hàng tháng)",
            description: "Mô tả dịch vụ",
        },
    ];

    // For display in the main page
    const regularServices = allServices.slice(0, 4);
    const specialServices = allServices.slice(4, 8);

    const showServiceModal = () => {
        setIsServiceModalVisible(true);
    };

    const handleServiceCancel = () => {
        setIsServiceModalVisible(false);
    };

    const handleServiceOk = () => {
        if (selectedServices.length > 0) {
            setIsServiceModalVisible(false);
            setIsDetailsModalVisible(true);
        } else {
            message.error('Vui lòng chọn ít nhất một dịch vụ!');
        }
    };

    const handleDetailsCancel = () => {
        setIsDetailsModalVisible(false);
        setIsServiceModalVisible(true);
    };

    const handleDetailsOk = () => {
        form.validateFields().then(values => {
            // Process form data with selectedServices
            console.log('Selected services:', selectedServices);
            console.log('Form values:', values);

            // Reset and close
            setSelectedServices([]);
            form.resetFields();
            setIsDetailsModalVisible(false);
        });
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

    const switchToServiceSelection = () => {
        setIsDetailsModalVisible(false);
        setIsServiceModalVisible(true);
    };

    // Find service details based on ID
    const getServiceDetails = (serviceId) => {
        return allServices.find(service => service.id === serviceId);
    };

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.header}>Đăng tải việc làm</h1>
                    <button
                        className={styles.comboButton}
                        onClick={showServiceModal}
                    >
                        Đăng ký dịch vụ tuỳ chọn +
                    </button>
                </div>
                <section className={styles.servicesGrid}>
                    {regularServices.map((service, index) => (
                        <JobUploadCard
                            key={index}
                            id={service.id}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                        />
                    ))}
                </section>
                <h2 className={styles.sectionTitle}>Dịch Vụ Theo Nhu Cầu</h2>
                <section className={styles.servicesGrid}>
                    {specialServices.map((service, index) => (
                        <JobUploadCard
                            key={index}
                            id={service.id}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                        />
                    ))}
                </section>
            </div>

            {/* Service Selection Modal Component */}
            <ServiceSelectionModal
                isVisible={isServiceModalVisible}
                onCancel={handleServiceCancel}
                onOk={handleServiceOk}
                selectedServices={selectedServices}
                onServiceChange={onServiceChange}
                allServices={allServices}
            />

            {/* Service Details Modal Component */}
            <ServiceDetailsModal
                isVisible={isDetailsModalVisible}
                onCancel={handleDetailsCancel}
                onOk={handleDetailsOk}
                form={form}
                selectedServices={selectedServices}
                getServiceDetails={getServiceDetails}
                onServiceChange={onServiceChange}
                switchToServiceSelection={switchToServiceSelection}
            />
        </>
    );
};

export default JobUpload;