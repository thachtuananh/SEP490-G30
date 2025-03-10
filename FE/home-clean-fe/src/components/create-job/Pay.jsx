import React, { useState } from "react";
import styles from "../../assets/CSS/createjob/Pay.module.css";

const paymentMethods = [
    { id: "cash", label: "Thanh toán tiền mặt", icon: "💵" },
    { id: "bank", label: "Thanh toán chuyển khoản", icon: "🏦", account: "BIDV 4271****" },
    { id: "momo", label: "Thanh toán qua ví điện tử", icon: "📱", account: "*********687" },
    { id: "zalo", label: "Thanh toán qua ví điện tử", icon: "📱", account: "*********687" },
];

const Pay = () => {
    const [selectedMethod, setSelectedMethod] = useState("cash");

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>Phương thức thanh toán</h4>
            <div className={styles.separator}></div>

            <div className={styles.paymentList}>
                {paymentMethods.map((method) => (
                    <label key={method.id} className={styles.paymentItem}>
                        <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className={styles.radioInput}
                        />
                        <span className={styles.icon}>{method.icon}</span>
                        <span className={styles.label}>{method.label}</span>
                        {method.account && <span className={styles.account}>{method.account}</span>}
                    </label>
                ))}
            </div>

            <div className={styles.terms}>
                <input type="checkbox" id="terms" className={styles.checkbox} />
                <label htmlFor="terms" className={styles.termsLabel}>
                    Tôi đồng ý với <strong>Điều khoản và dịch vụ</strong> của HouseClean
                </label>
            </div>
        </div>
    );
};

export default Pay;