import React, { useState, useEffect } from "react";
import { Tabs, Rate, Typography, Card, Spin, Empty, message } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/config";

const { Text, Paragraph } = Typography;

export const TabsSection = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract cleanerId from URL
  const { cleanerId } = useParams();

  const fetchFeedbacks = async () => {
    // Retrieve token from sessionStorage
    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Không tìm thấy token đăng nhập");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}/customer/cleaners/${cleanerId}/feedbacks`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setFeedbacks(response.data);
      } else {
        setFeedbacks([]);
        // console.warn("Received non-array feedback data:", response.data);
      }
    } catch (err) {
      message.error("Không thể tải đánh giá");
      // console.error("Feedback fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cleanerId) {
      fetchFeedbacks();
    }
  }, [cleanerId]);

  // Content for the Info tab
  const InfoContent = (
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </Paragraph>
  );

  // Content for the Reviews tab
  const ReviewsContent = (
    <div>
      {isLoading ? (
        <Spin tip="Đang tải đánh giá..." />
      ) : error ? (
        <Empty
          description="Rất tiếc, đã có lỗi xảy ra"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : feedbacks.length === 0 ? (
        <Empty
          description="Chưa có đánh giá nào"
          imageStyle={{
            height: 160,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      ) : (
        feedbacks.map((feedback, index) => (
          <Card
            key={index}
            style={{
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text type="secondary">Công việc #{feedback.jobId}</Text>
              <Rate
                disabled
                value={feedback.rating}
                style={{ color: "#FFC107" }}
              />
            </div>
            <Paragraph>{feedback.comment}</Paragraph>
          </Card>
        ))
      )}
    </div>
  );

  // Correctly formatted items for Tabs component in Ant Design v5
  const tabItems = [
    {
      key: "info",
      label: "Thông tin",
      children: InfoContent,
    },
    {
      key: "reviews",
      label: "Đánh giá",
      children: ReviewsContent,
    },
  ];

  return (
    <Tabs defaultActiveKey="info" items={tabItems} style={{ width: "100%" }} />
  );
};

export default TabsSection;
