import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCleanerDetails } from "../../services/owner/OwnerAPI";
import { ImageGallery } from "../../components/cleaner-details/ImageGallery";
import { ServiceInfo } from "../../components/cleaner-details/ServiceInfo";
import PriceSection from "../../components/cleaner-details/PriceSection";
import { TabsSection } from "../../components/cleaner-details/TabsSection";
import styles from "../../components/cleaner-details/styles.module.css";

export const CleanerDetails = () => {
  const { cleanerId } = useParams();
  const [cleaner, setCleaner] = useState(null);

  useEffect(() => {
    if (!cleanerId) {
      console.error("Cleaner ID không hợp lệ!");
      return;
    }

    async function loadCleaner() {
      const data = await fetchCleanerDetails(cleanerId);
      if (data) {
        setCleaner(data);
      }
    }
    loadCleaner();
  }, [cleanerId]);

  return (
    <div className={styles.container}>
      <div className={styles.mainContainer}>
        <ImageGallery image={cleaner?.profileImage} />
        <div className={styles.rightSection}>
          <ServiceInfo
            cleanerName={cleaner?.cleanerName}
            averageRating={cleaner?.averageRating}
          />
          <PriceSection
            cleanerId={cleanerId} // Pass cleanerId here
            cleanerName={cleaner?.cleanerName} // Pass cleanerName here
          />
        </div>
      </div>
      <TabsSection />
    </div>
  );
};

export default CleanerDetails;
