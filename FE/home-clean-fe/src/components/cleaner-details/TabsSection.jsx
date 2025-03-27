import React, { useState, useEffect } from 'react';
import { Tabs, Rate, Typography, Card, Spin, Empty } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';

const { Text, Paragraph } = Typography;

export const TabsSection = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract cleanerId from URL
  const { cleanerId } = useParams();

  const fetchFeedbacks = async () => {
    // Retrieve token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/customer/cleaners/${cleanerId}/feedbacks`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setFeedbacks(response.data);
    } catch (err) {
      setError('Không thể tải đánh giá');
      console.error('Feedback fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: (
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </Paragraph>
      ),
    },
    {
      key: 'reviews',
      label: 'Đánh giá',
      children: (
        <div>
          {isLoading ? (
            <Spin tip="Đang tải đánh giá..." fullscreen />
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
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 16 }}>
                Người làm việc này chưa nhận được đánh giá nào.
                Hãy trở thành người đầu tiên đánh giá!
              </Paragraph> */}
            </Empty>
          ) : (
            feedbacks.map((feedback, index) => (
              <Card
                key={index}
                style={{
                  marginBottom: 16,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <Text type="secondary">Công việc #{feedback.jobId}</Text>
                  <Rate
                    disabled
                    value={feedback.rating}
                    style={{ color: '#FFC107' }}
                  />
                </div>
                <Paragraph>
                  {feedback.comment}
                </Paragraph>
              </Card>
            ))
          )}
        </div>
      ),
    }
  ];

  useEffect(() => {
    if (cleanerId) {
      fetchFeedbacks();
    }
  }, [cleanerId]);

  return (
    <Tabs
      defaultActiveKey="info"
      items={tabItems}
      style={{ width: '100%' }}
    />
  );
};

export default TabsSection;