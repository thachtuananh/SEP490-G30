import React, { useState } from "react";
import { Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import styles from "../../assets/CSS/Notification/Notification.module.css";

const ChatWindow = ({ messages, onSendMessage, conversation, userId }) => {
    const [messageContent, setMessageContent] = useState("");

    const handleSend = () => {
        if (messageContent.trim()) {
            onSendMessage(messageContent);
            setMessageContent("");
        }
    };

    return (
        <div className={styles.chatWindow}>
            {conversation ? (
                <>
                    <div className={styles.chatHeader}>
                        <h3>
                            Chat với{" "}
                            {parseInt(conversation.customerId) === parseInt(userId)
                                ? `Employee ${conversation.employeeId}`
                                : `Customer ${conversation.customerId}`}
                        </h3>
                    </div>
                    <div className={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={
                                    parseInt(msg.senderId) === parseInt(userId)
                                        ? styles.messageSent
                                        : styles.messageReceived
                                }
                            >
                                <span>{msg.content}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.chatInput}>
                        <div className={styles.chatInputWrapper}>
                            <Input
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                onPressEnter={handleSend}
                                placeholder="Nhập tin nhắn"
                                className={styles.inputField}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                className={styles.sendButton}
                                style={{
                                    width: 50,
                                }}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: "100%"
                }}>
                    <h1 style={{ textAlign: 'center', opacity: '0.5' }}>Chọn một cuộc trò chuyện để bắt đầu chat</h1>
                </div>

            )}
        </div>
    );
};

export default ChatWindow;
