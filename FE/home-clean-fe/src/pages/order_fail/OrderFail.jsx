import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Spin } from "antd";

const OrderFail = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: 531,
        textAlign: "center",
        alignContent: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 20px",
      }}
    >
      {isLoading ? (
        <Spin size="large" />
      ) : (
        <>
          <FaTimesCircle
            style={{
              fontSize: "100",
              color: "#FF3B30",
            }}
          />
          <h1 style={{ marginTop: 16, color: "#333" }}>Thất bại</h1>
          <p style={{ marginTop: 8, color: "#666", fontSize: 16 }}>
            Quá trình thanh toán không thành công. Vui lòng kiểm tra lại thông
            tin và thử lại.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "white",
              }}
            >
              <div
                style={{
                  height: 40,
                  width: 150,
                  background: "rgb(128, 128, 128)",
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Về trang chủ
              </div>
            </Link>
            <Link
              to="/activitylist"
              style={{
                textDecoration: "none",
                color: "white",
              }}
            >
              <div
                style={{
                  height: 40,
                  width: 150,
                  background: "#FF3B30",
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Thử lại
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderFail;
