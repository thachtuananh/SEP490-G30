import React, { useState, useEffect } from "react";
import { List, Typography, Spin, Empty, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import {
  getNotifications,
  deleteAllNotifications,
  markAllNotificationsAsRead,
} from "../../services/NotificationService";
import styles from "../../assets/CSS/Notification/Notification.module.css";
import jwt_decode from "jwt-decode";

const { Text, Title } = Typography;

const Notification = ({
  onClose,
  onViewAll,
  notifications: propNotifications,
  setNotifications: setParentNotifications,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(propNotifications || []);
  const [loading, setLoading] = useState(!propNotifications); // Only load if no props provided
  const [error, setError] = useState(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [markReadLoading, setMarkReadLoading] = useState(false);

  // Fetch notifications only if propNotifications is not provided
  useEffect(() => {
    if (!propNotifications) {
      fetchNotifications();
    }
  }, []);

  // Update local state when propNotifications changes
  useEffect(() => {
    if (propNotifications) {
      setNotifications(propNotifications);
    }
  }, [propNotifications]);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
      if (setParentNotifications) {
        setParentNotifications(data || []);
      }
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
      const token = sessionStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const { role, id } = decodedToken;

      await deleteAllNotifications(role, id);
      setNotifications([]);
      if (setParentNotifications) {
        setParentNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      setError("Không thể xoá thông báo. Vui lòng thử lại sau.");
    } finally {
      setClearLoading(false);
    }
  };

  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkReadLoading(true);
      const token = sessionStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const { role, id } = decodedToken;

      await markAllNotificationsAsRead(role, id);

      // Update notifications state to mark all as read
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      setNotifications(updatedNotifications);
      if (setParentNotifications) {
        setParentNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setError("Không thể đánh dấu đã đọc. Vui lòng thử lại sau.");
    } finally {
      setMarkReadLoading(false);
    }
  };

  // Format date for display in Asia/Ho_Chi_Minh timezone (UTC+7)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(
        new Date(dateString).toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        })
      );
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );

      const diffInMs = now - date; // Difference in milliseconds
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // Convert to minutes
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Convert to hours
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert to days

      if (diffInMinutes < 1) {
        return "Vừa xong";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else {
        return `${diffInDays} ngày trước`;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  // Check if a notification is unread
  const isNotificationUnread = (notification) => {
    return notification.read === false;
  };

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(isNotificationUnread);

  return (
    <div className={styles.notification_container}>
      <div className={styles.notification_header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Thông báo
          </Title>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* {hasUnreadNotifications && (
              <CheckOutlined
                onClick={handleMarkAllAsRead}
                style={{
                  color: "green",
                  cursor: "pointer",
                  opacity: markReadLoading ? 0.5 : 1,
                }}
                title="Đánh dấu tất cả đã đọc"
              />
            )} */}
            {notifications.length > 0 && (
              <DeleteOutlined
                onClick={handleClearAllNotifications}
                style={{
                  color: "red",
                  cursor: "pointer",
                  opacity: clearLoading ? 0.5 : 1,
                }}
                title="Xóa tất cả thông báo"
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={styles.notification_content}
        style={{
          maxHeight: "400px",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        {loading ? (
          <div className={styles.loading_container}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className={styles.error_container}>
            <Text type="danger">{error}</Text>
            <br />
            <Button
              type="primary"
              onClick={fetchNotifications}
              className={styles.retry_button}
            >
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
                className={`${styles.notification_item} ${
                  isNotificationUnread(item) ? styles.unread : ""
                }`}
              >
                <List.Item.Meta
                  title={
                    <div className={styles.notification_title}>
                      {isNotificationUnread(item) && (
                        <span className={styles.unread_indicator} />
                      )}
                    </div>
                  }
                  description={
                    <>
                      <div
                        className={styles.notification_message}
                        style={{
                          fontWeight: isNotificationUnread(item)
                            ? "bold"
                            : "normal",
                          color: isNotificationUnread(item)
                            ? "#313134"
                            : "normal",
                        }}
                      >
                        {item.message}
                      </div>
                      <div
                        className={`${styles.notification_time} ${styles.relative}`}
                        style={{
                          fontWeight: isNotificationUnread(item)
                            ? "bold"
                            : "normal",
                          color: isNotificationUnread(item)
                            ? "#313134"
                            : "normal",
                        }}
                      >
                        {formatDate(item.timestamp)}
                      </div>
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
