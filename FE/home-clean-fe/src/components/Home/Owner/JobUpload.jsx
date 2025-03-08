import React from "react";
import styles from "../Owner/JobUpload.module.css";
import JobUploadCard from "../Owner/JobUploadCard";
import donBep from "../../../assets/icon-home/don-bep.svg";
import donNhaVeSinh from "../../../assets/icon-home/don-nha-vs.svg";
import donPhongKhach from "../../../assets/icon-home/phong-khach.svg";
import donPhongNgu from "../../../assets/icon-home/don-phong-ngu.svg";
import donDepSauTiec from "../../../assets/icon-home/don-sk.svg";
import donDepNhaMoi from "../../../assets/icon-home/nha-moi.svg";
import donDepVanPhong from "../../../assets/icon-home/don-van-phong.svg";
import donDepTheoKy from "../../../assets/icon-home/don-dinh-ky.svg";

const JobUpload = () => {
    const regularServices = [
        {
            icon: donPhongKhach,
            title: "Dọn phòng khách",
            description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
            srcDetail: "/service/1",
        },
        {
            icon: donBep,
            title: "Dọn bếp",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
            srcDetail: "/service/2",

        },
        {
            icon: donPhongNgu,
            title: "Dọn phòng ngủ",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
            srcDetail: "/service/3",

        },
        {
            icon: donNhaVeSinh,
            title: "Dọn nhà vệ sinh",
            description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
            srcDetail: "/service/",

        },
    ];

    const specialServices = [
        {
            icon: donDepSauTiec,
            title: "Dọn dẹp sau tiệc/tổ chức sự kiện",
            description: "Mô tả dịch vụ",
        },
        {
            icon: donDepNhaMoi,
            title: "Dọn dẹp nhà mới xây, sau sửa chữa",
            description: "Mô tả dịch vụ",
        },
        {
            icon: donDepVanPhong,
            title: "Dọn dẹp văn phòng, cửa hàng",
            description: "Mô tả dịch vụ",
        },
        {
            icon: donDepTheoKy,
            title: "Dọn dẹp nhà theo định kỳ (Hàng tuần, hàng tháng)",
            description: "Mô tả dịch vụ",
        },
    ];

    return (
        <>
            <div className={styles.pageContainer}>
                <h1 className={styles.header}>Đăng tải việc làm</h1>
                <section className={styles.servicesGrid}>
                    {regularServices.map((service, index) => (
                        <JobUploadCard
                            key={index}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            srcDetail={service.srcDetail}
                        />
                    ))}
                </section>
                <h2 className={styles.sectionTitle}>Dịch Vụ Theo Nhu Cầu</h2>
                <section className={styles.servicesGrid}>
                    {specialServices.map((service, index) => (
                        <JobUploadCard
                            key={index}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            srcDetail={service.srcDetail}
                        />
                    ))}
                </section>
            </div>
        </>
    );
};

export default JobUpload;
