const ServiceDescription = ({ description }) => {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 50, margin: '20px 0' }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            borderBottom: "4px solid #039855",
            paddingBottom: 10,
          }}
        >
          Mô tả dịch vụ
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            paddingBottom: 10,
            borderBottom: "4px solid transparent",
            color: "#475467",
          }}
        >
          Đánh giá
        </div>
      </div>
      <p style={{ color: "#667085", marginTop: 14, maxWidth: "70%" }}>{description}</p>

    </div>

  );
};

export default ServiceDescription;