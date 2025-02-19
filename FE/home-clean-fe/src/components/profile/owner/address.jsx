import React, { useState } from "react";

export const Address = () => {
    const [defaultAddress, setDefaultAddress] = useState("home1");

    const adress = {
        home1: {
            name: "Trần Tiến Mạnh",
            phone: "377648322",
            adr: "Tập thể Liên Đoàn Bóng Đá VN, 18 Lý Văn Phức, Phường Cát Linh, Quận Đống Đa, Hà Nội"
        },
        home2: {
            name: "Trần Tiến Mạnh",
            phone: "377648322",
            adr: "18 Lý Văn Phức, Phường Cát Linh, Quận Đống Đa, Hà Nội"
        },
        home3: {
            name: "Trần Tiến Mạnh",
            phone: "377648322",
            adr: "18 Lý Văn Phức, Phường Cát Linh, Quận Đống Đa, Hà Nội"
        }

    };

    return (
        <div style={{width : 878 , boxSizing : 'border-box'}}>
            <div style={{ display: 'flow' }}>
                <div>
                    <b>Số địa chỉ</b>
                    <p style={{ paddingTop: 5 }}>
                        Quản lý thông tin địa chỉ giao hàng của bạn
                    </p>
                </div>
                <button
                    style={{
                        padding: '10px 15px',
                        color: 'white',
                        background: 'green',
                        border: 'none',
                        borderRadius: 5,
                        float: 'right',
                        marginTop: -35,
                        cursor: 'pointer',
                    }}
                >
                    + Thêm địa chỉ mới
                </button>
            </div>
            <div style={{ paddingTop : 30, width: '878px' }}>
                {Object.entries(adress).map(([key, value]) => (
                    <div
                    key={key}
                    style={{
                        display: "flex",
                        width: '100%',
                        paddingBottom : 25
                    }}
                    >
                    <div
                    style={{
                        width : '70%'
                    }}
                    >
                        <div
                        style={{
                            display: 'flex',
                            gap: 20,
                            width: '100%'
                        }}
                        >
                            <b>{value.name}</b>
                            <p>(+84) {value.phone}</p>
                            {defaultAddress === key && (
                                <div
                                    style={{
                                        color: 'green',
                                        background: '#B8D9D0',
                                        width: 90,
                                        borderRadius: 20,
                                        fontSize: 'bold',
                                        textAlign: 'center',
                                        height: 25
                                    }}
                                    >
                                    <b>Mặc định</b>
                                </div>
                            )}
                        </div>

                        <div style={{ paddingTop: 10 }}>
                            <p>{value.adr}</p>
                        </div>
                    </div>

                    <div style={{ width: '30%', float: 'right' }}>
                        <div style={{ float: 'right' }}>
                        <b style={{ color: 'green', cursor: 'pointer' }}>Cập nhật</b>
                        <b style={{ color: 'red', paddingLeft: 20, cursor: 'pointer' }}>Xóa</b>
                        </div>
                        <div
                        style={{
                            display: 'flex',
                            paddingTop: 10,
                            float: 'right',
                            gap: 10
                        }}
                        >
                        <p>Chọn làm mặc định</p>
                        <input 
                            type="checkbox" 
                            checked={defaultAddress === key} 
                            onChange={() => setDefaultAddress(key)}
                        />
                        </div>
                    </div>
                    </div>   
                ))}
            </div>

        </div>
    );
};
