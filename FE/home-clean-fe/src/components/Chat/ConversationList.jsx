import React, { useEffect, useState } from "react";
import styles from "../../assets/CSS/Notification/Notification.module.css";
import { BASE_URL } from "../../utils/config";

const ConversationList = ({ onSelect, userId, role }) => {
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

  return (
    <div className={styles.conversationList}>
      <h3>
        Danh sách chat ({role === "customer" ? "Khách hàng" : "Nhân viên"})
      </h3>

      {loading && <p>Đang tải danh sách cuộc trò chuyện...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      {!loading && !error && conversations.length === 0 ? (
        <p>Không có cuộc trò chuyện nào.</p>
      ) : (
        conversations.map((conversation) => (
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
            className={styles.conversationItem}
          >
            {role === "customer"
              ? `${conversation.cleaner_name}`
              : `${conversation.customer_name}`}
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationList;
