import React, { useEffect, useState } from "react";
import { Spin, Avatar, Badge, Empty } from "antd";
import {
  MessageOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import styles from "./Chat.module.css";
import { BASE_URL } from "../../utils/config";

const ConversationList = ({
  onSelect,
  userId,
  role,
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !role) return;
    console.log("Fetching conversations for userId:", userId, "role:", role);
    const apiUrl =
      role === "customer"
        ? `${BASE_URL}/conversations/${userId}/getConversationByCustomerId`
        : `${BASE_URL}/conversations/${userId}/getConversationByCleanerId`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        } else {
          setConversations([]);
        }
      })
      .catch((error) => {
        setError(error.message);
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, [userId, role]);

  // Get first letter of name for avatar placeholder
  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={styles.conversationList}>
      <div className={styles.conversationListHeader}>
        <h3 className={styles.listTitle}>
          <MessageOutlined className={styles.headerIcon} />
          {role === "customer" ? "Nhân viên hỗ trợ" : "Danh sách khách hàng"}
        </h3>
        {/* <Badge count={conversations.length} className={styles.countBadge} /> */}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip="Đang tải..."
          />
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <ExclamationCircleOutlined className={styles.errorIcon} />
          <p className={styles.errorText}>
            Không thể tải danh sách. Vui lòng thử lại.
          </p>
        </div>
      ) : conversations.length === 0 ? (
        <Empty
          description="Không có cuộc trò chuyện"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className={styles.emptyState}
        />
      ) : (
        <div className={styles.conversationItems}>
          {conversations.map((conversation) => {
            const isSelected =
              selectedConversationId === conversation.conversation_id;
            const displayName =
              role === "customer"
                ? conversation.cleaner_name
                : conversation.customer_name;

            return (
              <div
                key={conversation.conversation_id}
                onClick={() =>
                  onSelect({
                    id: conversation.conversation_id,
                    customerId: conversation.customer_id,
                    customerName: conversation.customer_name,
                    employeeId: conversation.cleaner_id,
                    employeeName: conversation.cleaner_name,
                  })
                }
                className={`${styles.conversationItem} ${
                  isSelected ? styles.selectedConversation : ""
                }`}
              >
                <Avatar
                  className={styles.conversationAvatar}
                  style={{
                    backgroundColor: isSelected ? "#4c84ff" : "#f56a00",
                    color: "white",
                  }}
                >
                  {getInitials(displayName)}
                </Avatar>
                <div className={styles.conversationDetails}>
                  <div className={styles.conversationName}>{displayName}</div>
                  <div className={styles.conversationPreview}>
                    {conversation.last_message || "Bắt đầu cuộc trò chuyện"}
                  </div>
                </div>
                {conversation.unread_count > 0 && (
                  <Badge
                    count={conversation.unread_count}
                    className={styles.unreadBadge}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
