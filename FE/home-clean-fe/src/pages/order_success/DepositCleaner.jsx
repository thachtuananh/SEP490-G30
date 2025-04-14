import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import Navbar from "../../components/Home/Cleaner/Navbar";
import Footer from "../../components/Home/Cleaner/Footer";

const DepositCleaner = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: 531,
          textAlign: "center",
          alignContent: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <Spin size="large" />
        ) : (
          <>
            <FaCheckCircle
              style={{
                fontSize: "100",
                color: "rgb(81, 238, 133)",
              }}
            />
            <h1>Thành công</h1>
            <p>Bạn đã nạp tiền thành công. Cảm ơn đã sử dụng dịch vụ</p>
            <Link
              to="/homeclean/infomationcleaner"
              style={{
                textDecoration: "none",
                color: "white",
                width: 200,
                marginTop: 30,
              }}
            >
              <div
                style={{
                  height: 40,
                  width: 200,
                  background: "rgb(16, 112, 48)",
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: 5,
                  alignContent: "center",
                }}
              >
                Về trang chủ
              </div>
            </Link>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default DepositCleaner;
