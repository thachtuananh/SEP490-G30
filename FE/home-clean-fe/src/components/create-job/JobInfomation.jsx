import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";


const JobInfomation = ({ selectedDate, hour, minute }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const [serviceData, setServiceData] = useState(null);

    useEffect(() => {
        if (!state.serviceDetailId) return;

        const fetchServiceData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/services/details/${state.serviceDetailId}`);
                if (!response.ok) {
                    throw new Error("Lỗi khi gọi API");
                }
                const data = await response.json();
                setServiceData(data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchServiceData();
    }, [state.serviceDetailId]);

    const serviceId = state.serviceId;
    const serviceDetailId = state.serviceDetailId

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
            customerAddressId: 1,
            roomSize: 30,
            imageUrl: "http://example.com/room.jpg",
        };

        try {
            const response = await fetch(`http://localhost:8080/api/customer/1/create-job`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // Nếu API yêu cầu token
                },
                body: JSON.stringify(jobData),
            });
            console.log(`${localStorage.getItem("accessToken")}`);


            console.log("Raw API Response:", response.status, response.statusText);

            if (response.ok) {
                console.log("Job created successfully");
                navigate('/ordersuccess');
            } else {
                console.error("Lỗi khi tạo job:", response.statusText);
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
        }
    };



    return (
        <div
            style={{
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                padding: 16,
                position: 'relative'
            }}>
            <h4>Thời gian làm việc</h4>
            <p>
                <span>Ngày làm việc</span>
                <span style={{ float: "right" }}>{selectedDate
                    ? `Ngày ${selectedDate.getDate()}- Tháng ${selectedDate.getMonth() + 1}- Năm ${selectedDate.getFullYear()}`
                    : "Chưa chọn"}</span>
            </p>
            <p>
                <span>Thời gian làm việc</span>
                <span style={{ float: "right" }}>
                    {selectedDate
                        ? `${hour}h${minute}p`
                        : "Chưa chọn"}
                </span>
            </p>

            <br />
            <h4>Chi tiết</h4>
            <p>
                <span>Loại dịch vụ</span>
                <span style={{ float: "right" }}>{serviceData?.name}</span>
            </p>
            <p>
                <span>Địa điểm</span>
                <span style={{ float: "right" }}>
                    {state.address}
                </span>
            </p>
            {/* <p>
                <span>Khối lượng công việc</span>
                <span style={{ float: "right" }}>30m2</span>
            </p> */}
            <p>
                <span>Số nhân công</span>
                <span style={{ float: "right" }}>1 người</span>
            </p>
            <div
                style={{
                    height: 2,
                    width: '100%',
                    background: 'rgb(225, 225, 225)',
                    marginTop: 15
                }}
            >

            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px 0px 10px 0px'
                }}
            >
                <span>Tổng thanh toán</span>
                <h4 style={{ textAlign: "right", fontSize: 20 }}>
                    {state.price} VNĐ
                </h4>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 15,
                    position: 'absolute',
                    right: 0,
                    bottom: -60
                }}
            >
                <Link to="/"
                    style={{
                        textDecoration: 'none'
                    }}
                >
                    <div
                        style={{
                            height: 40,
                            background: 'rgb(174, 174, 174)',
                            color: 'white',
                            width: 120,
                            borderRadius: 8,
                            alignContent: 'center',
                            textAlign: "center",
                            cursor: 'pointer'
                        }}
                    >
                        Hủy
                    </div>
                </Link>
                <div
                    style={{
                        height: 40,
                        background: 'rgb(10, 139, 3)',
                        color: 'white',
                        width: 180,
                        borderRadius: 8,
                        alignContent: 'center',
                        textAlign: "center",
                        cursor: 'pointer'
                    }}
                    onClick={handleCreateJob}
                >
                    Đăng việc
                </div>

            </div>
        </div>
    );
};

export default JobInfomation;