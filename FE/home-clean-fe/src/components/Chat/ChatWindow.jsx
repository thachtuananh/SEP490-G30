import React, { useState, useRef, useEffect } from "react";
import { Button, Input } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import styles from "./Chat.module.css";

const ChatWindow = ({ messages, onSendMessage, conversation, userId }) => {
  const [messageContent, setMessageContent] = useState("");
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
    }
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

  return (
    <div className={styles.chatWindow}>
      {conversation ? (
        <>
          {/* <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt="avatar"
                  className={styles.chatAvatar}
                />
              ) : (
                <div className={styles.chatAvatarPlaceholder}>
                  {parseInt(conversation.customerId) === parseInt(userId)
                    ? `E${getFirstChar(conversation.employeeId)}`
                    : `C${getFirstChar(conversation.customerId)}`}
                </div>
              )}
              <div>
                <h3 className={styles.chatName}>
                  {parseInt(conversation.customerId) === parseInt(userId)
                    ? `Employee ${conversation.employeeId}`
                    : `Customer ${conversation.customerId}`}
                </h3>
                <p className={styles.chatStatus}>
                  {conversation.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div> */}

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
                  // const showTimestamp =
                  //   index === 0 ||
                  //   new Date(msg.sent_at).getTime() -
                  //     new Date(messages[index - 1]?.sent_at).getTime() >
                  //     300000;

                  return (
                    <React.Fragment key={index}>
                      {/* {showTimestamp && (
                        <div className={styles.timestampDivider}>
                          <span>
                            {new Date(msg.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                      )} */}
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
                          <p className={styles.messageContent}>{msg.content}</p>
                          {/* <span className={styles.timestamp}>
                            {formatTime(msg.sent_at)}
                          </span> */}
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
                icon={<PaperClipOutlined />}
                className={styles.attachButton}
              />
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Nhập tin nhắn..."
                className={styles.inputField}
                bordered={false}
              />
              {/* <Button
                type="text"
                icon={<SmileOutlined />}
                className={styles.emojiButton}
              /> */}
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                className={styles.sendButton}
              />
            </div>
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
