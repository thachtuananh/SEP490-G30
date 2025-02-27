import ServiceCard from "./ServiceCard";

const SuggestedServices = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <h2
        style={{
          borderBottom: "4px solid #039855",
          paddingBottom: 10,
          width: "fit-content",
        }}
      >
        Dịch vụ tương tự
      </h2>
      <div style={{ display: "flex", gap: 20 }}>
        {Array(5)
          .fill(null)
          .map(() => (
            <ServiceCard />
          ))}
      </div>
    </div>
  );
};

export default SuggestedServices;
