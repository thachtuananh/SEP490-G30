import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Empty, Button } from 'antd';
import { getNotifications } from '../../services/NotificationService';
import styles from "../../assets/CSS/Notification/Notification.module.css";

const { Text, Title } = Typography;

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Function to fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Không thể tải thông báo. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                // hour: '2-digit',
                // minute: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    return (
        <div className={styles.notification_container} style={{ width: '250px' }}>
            <div className={styles.notification_header}>
                <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
                {/* {onClose && (
                    <Button type="text" onClick={onClose} className={styles.close_button}>
                        ×
                    </Button>
                )} */}
            </div>

            <div className={styles.notification_content} style={{ maxHeight: '400px', overflowY: 'scroll', scrollbarWidth: 'none' }}>
                {loading ? (
                    <div className={styles.loading_container}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <div className={styles.error_container}>
                        <Text type="danger">{error}</Text>
                        <br />
                        <Button type="primary" onClick={fetchNotifications} className={styles.retry_button}>
                            Thử lại
                        </Button>
                    </div>
                ) : notifications.length === 0 ? (
                    <Empty description="Không có thông báo" />
                ) : (
                    <List
                        dataSource={notifications} // Hiển thị tất cả thông báo
                        renderItem={(item) => (
                            <List.Item
                                className={`${styles.notification_item} ${!item.isRead ? styles.unread : ''}`}
                            >
                                <List.Item.Meta
                                    title={
                                        <div className={styles.notification_title}>
                                            {!item.isRead && <span className={styles.unread_indicator} />}
                                            {/* <Text strong={!item.isRead}>{item.title || 'Thông báo'}</Text> */}
                                        </div>
                                    }
                                    description={
                                        <>
                                            {/* <div className={styles.notification_message}>{item.type}</div> */}
                                            <div className={styles.notification_message}>{item.message}</div>
                                            <div className={styles.notification_time}>{formatDate(item.timestamp)}</div>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default Notification;