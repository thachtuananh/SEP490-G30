import React, { useState, useEffect } from "react";
import { Rate, Spin, Empty, List, Card, Typography, Divider } from "antd";
import styles from "../activity/InfoCleanerCard.module.css";
import { BASE_URL } from "../../utils/config";

const { Text, Title, Paragraph } = Typography;

export const InfoCleanerCard = ({ cleaner }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cleaner && cleaner.cleanerId) {
      fetchCleanerFeedbacks(cleaner.cleanerId);
    }
  }, [cleaner]);

  const fetchCleanerFeedbacks = async (cleanerId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/customer/cleaners/${cleanerId}/feedbacks`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching cleaner feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.flexContainer}>
        {/* Left section - Original cleaner info */}
        <div className={styles.leftSection}>
          <div className={styles.cardContent}>
            {/* Thông tin cơ bản */}
            <div className={styles.basicInfo}>
              <img
                src={`data:image/png;base64,${cleaner.profileImage}`}
                alt="Avatar"
              />
              <strong>Tên : {cleaner.cleanerName}</strong>
              <div className={styles.divider}></div>
              <p>Tuổi : {cleaner.age}</p>
              {/* <p>CCCD: {cleaner.identityNumber}</p> */}
              {/* <p>Email : {cleaner.email}</p> */}
              <p>Kinh nghiệm : {cleaner.experience}</p>

              {/* Display average rating if available */}
              {feedbacks.length > 0 && (
                <div className={styles.ratingContainer}>
                  <Rate
                    disabled
                    defaultValue={parseFloat(calculateAverageRating())}
                    allowHalf
                  />
                  <Text strong className={styles.ratingText}>
                    {calculateAverageRating()} ({feedbacks.length} đánh giá)
                  </Text>
                </div>
              )}
            </div>

            {/* Mô tả thông tin */}
            <div className={styles.infoSection}>
              {/* Could add additional info here if needed */}
            </div>
          </div>
        </div>

        {/* Right section - Feedback section */}
        <div className={styles.rightSection}>
          <Title level={4} style={{ marginBottom: "20px" }}>
            Đánh giá từ khách hàng
          </Title>

          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : feedbacks.length === 0 ? (
            <Empty description="Chưa có đánh giá nào" />
          ) : (
            <List
              className={styles.feedbackList}
              itemLayout="vertical"
              dataSource={feedbacks}
              renderItem={(feedback) => (
                <List.Item className={styles.feedbackItem}>
                  <Card bordered={false} className={styles.feedbackCard}>
                    <div className={styles.feedbackHeader}>
                      <div className={styles.jobInfoText}>
                        <Text type="secondary">
                          Mã công việc: {feedback.jobId}
                        </Text>
                      </div>
                      <Rate
                        disabled
                        defaultValue={feedback.rating}
                        className={styles.rateStars}
                      />
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <Paragraph className={styles.feedbackComment}>
                      {feedback.comment}
                    </Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};
