const ServiceDescription = () => {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
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
        <p style={{ color: "#667085", marginTop: 14, maxWidth: "70%" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </p>
      </div>
    );
  };
  
  export default ServiceDescription;
  