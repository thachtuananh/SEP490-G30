import { useEffect, useState } from "react";
import CleanerCard from "./CleanerCard";

import { fetchCleaners } from "../../../services/owner/OwnerAPI";

function CleanerSection() {
  const [cleaners, setCleaners] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCleaners();
      setCleaners(data);
    }
    fetchData();
  }, []);

  return (
    <section className="service-section">
      <h2 className="section-title">Danh sách cleaner</h2>
      <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        {cleaners.length > 0 ? (
          cleaners.map((cleaner) => (
            <CleanerCard
              key={cleaner.cleanerId}
              cleanerId={cleaner.cleanerId}
              cleanerImg={cleaner.cleanerImg}
              cleanerName={cleaner.cleanerName}
              rating={4.6}
              reviews={100}
            />
          ))
        ) : (
          <p>Đang tải danh sách cleaner...</p>
        )}
      </div>
    </section>
  );
}

export default CleanerSection;