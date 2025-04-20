import React, { useState, useRef, useEffect } from "react";
import { Button, Input } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import styles from "./Chat.module.css";

const ChatWindow = ({ messages, onSendMessage, conversation, userId }) => {
  const [messageContent, setMessageContent] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent);
      setMessageContent("");
    } else if (locationLink) {
      onSendMessage(locationLink);
      setLocationLink("");
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
        setLocationLink(url);
        onSendMessage(url); // Gửi link vị trí trực tiếp
        setError("");
        console.log(url);
      },
      (err) => {
        setError(
          "Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí."
        );
        console.error(err);
      }
    );
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get first character safely (handles both string and number types)
  const getFirstChar = (value) => {
    if (value === undefined || value === null) return "?";
    return String(value).charAt(0);
  };

  // Hàm để chuyển URL thành thẻ anchor có thể click
  const renderMessageWithLinks = (content, isSentByMe) => {
    // Kiểm tra xem nội dung có phải là URL không
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Style cho link dựa vào người gửi (để phù hợp với background của bubble)
    const linkStyle = {
      color: isSentByMe ? "#fff" : "#1890ff", // Màu trắng nếu là tin nhắn của mình, màu xanh nếu là tin nhắn nhận
      textDecoration: "underline",
      fontWeight: "500",
      cursor: "pointer",
      display: "inline-block",
      maxWidth: "100%",
      wordBreak: "break-word",
    };

    if (urlRegex.test(content)) {
      // Nếu toàn bộ nội dung là URL
      if (content.match(urlRegex)[0] === content) {
        return (
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.messageLink}
            style={linkStyle}
          >
            {content.includes("openstreetmap") ? "📍 Xem vị trí" : content}
          </a>
        );
      } else {
        // Nếu nội dung chứa URL và các text khác
        const parts = content.split(urlRegex);
        const matches = content.match(urlRegex);

        return parts.reduce((acc, part, i) => {
          acc.push(part);
          if (matches && i < matches.length) {
            acc.push(
              <a
                key={i}
                href={matches[i]}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.messageLink}
                style={linkStyle}
              >
                {matches[i].includes("openstreetmap")
                  ? "📍 Xem vị trí"
                  : matches[i]}
              </a>
            );
          }
          return acc;
        }, []);
      }
    }

    return content;
  };

  return (
    <div className={styles.chatWindow}>
      {conversation ? (
        <>
          <div className={styles.chatBody}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <p>Bắt đầu cuộc trò chuyện mới</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSentByMe =
                    parseInt(msg.senderId) === parseInt(userId);

                  return (
                    <React.Fragment key={index}>
                      <div
                        className={`${styles.messageContainer} ${
                          isSentByMe
                            ? styles.sentContainer
                            : styles.receivedContainer
                        }`}
                      >
                        <div
                          className={`${styles.messageBubble} ${
                            isSentByMe
                              ? styles.messageSent
                              : styles.messageReceived
                          }`}
                        >
                          <div className={styles.messageContent}>
                            {renderMessageWithLinks(msg.content, isSentByMe)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.chatInput}>
            <div className={styles.chatInputWrapper}>
              <Button
                type="text"
                icon={<EnvironmentOutlined />}
                onClick={handleGetLocation}
                className={styles.attachButton}
                title="Gửi vị trí hiện tại"
              />
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Nhập tin nhắn..."
                className={styles.inputField}
                bordered={false}
              />

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                className={styles.sendButton}
              />
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
        </>
      ) : (
        <div className={styles.emptyConversation}>
          <div className={styles.emptyConversationContent}>
            <div className={styles.emptyIcon}>💬</div>
            <h2>Hệ thống tin nhắn</h2>
            <p>Chọn một cuộc trò chuyện để bắt đầu chat</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
