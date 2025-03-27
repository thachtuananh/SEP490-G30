import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Empty, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getNotifications, deleteAllNotifications } from '../../services/NotificationService';
import styles from "../../assets/CSS/Notification/Notification.module.css";
import jwt_decode from 'jwt-decode';

const { Text, Title } = Typography;

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearLoading, setClearLoading] = useState(false);

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

    // Function to clear all notifications
    const handleClearAllNotifications = async () => {
        try {
            setClearLoading(true);
            // Get role and userId from token
            const token = localStorage.getItem('token');
            const decodedToken = jwt_decode(token);
            const { role, id } = decodedToken;

            // Call API to delete all notifications
            await deleteAllNotifications(role, id);

            // Clear notifications in state
            setNotifications([]);
        } catch (error) {
            console.error("Error clearing notifications:", error);
            setError("Không thể xoá thông báo. Vui lòng thử lại sau.");
        } finally {
            setClearLoading(false);
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
                year: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    return (
        <div className={styles.notification_container} style={{ width: '250px' }}>
            <div className={styles.notification_header}            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
                    {notifications.length > 0 && (
                        <DeleteOutlined
                            onClick={handleClearAllNotifications}
                            style={{
                                color: 'red',
                                cursor: 'pointer',
                                opacity: clearLoading ? 0.5 : 1
                            }}
                            spin={clearLoading}
                        />
                    )}

                </div>
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
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                className={`${styles.notification_item} ${!item.isRead ? styles.unread : ''}`}
                            >
                                <List.Item.Meta
                                    title={
                                        <div className={styles.notification_title}>
                                            {!item.isRead && <span className={styles.unread_indicator} />}
                                        </div>
                                    }
                                    description={
                                        <>
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