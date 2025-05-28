import "./ChatBot.css";
import { useEffect, useRef, useState } from "react";
import AskGpt from "../../services/chatbot-api";
import {
  OpenAIOutlined,
  SendOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

// Toast function cải tiến
const showToast = (message, type = "error") => {
  const existingToast = document.querySelector(".custom-toast");
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }, 100);
};

function ChatWindow({
  onClose,
  listMessage,
  setListMessage,
  messageContent,
  setMessageContent,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cải thiện các gợi ý
  const suggestions = [
    "Giới thiệu về dịch vụ của HouseClean",
    "Làm thế nào để liên hệ với đội hỗ trợ?",
    "Báo cáo sự cố đăng nhập",
  ];

  const handleUserSendMessage = async () => {
    if (!messageContent.trim()) return;

    if (listMessage) {
      // Add user message to the chat
      setListMessage((prev) => [
        ...prev,
        { isUser: true, chatContent: messageContent },
      ]);

      const question = messageContent;
      setMessageContent("");

      try {
        setIsLoading(true);

        // Call API with proper error handling
        const response = await AskGpt({ question });

        // Simulate typing effect from bot
        setIsTyping(true);

        setTimeout(() => {
          if (response && response.data) {
            setListMessage((prev) => [
              ...prev,
              { isUser: false, chatContent: response.data.answer },
            ]);
          } else {
            // Handle unexpected response format
            setListMessage((prev) => [
              ...prev,
              {
                isUser: false,
                chatContent:
                  "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
              },
            ]);
            console.error("Invalid response format:", response);
          }

          setIsTyping(false);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Chat error:", error);
        setIsLoading(false);
        setIsTyping(false);

        // Add error message from bot
        setListMessage((prev) => [
          ...prev,
          {
            isUser: false,
            chatContent:
              "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
          },
        ]);

        showToast(
          "Không thể kết nối với trợ lý ảo. Vui lòng thử lại sau!",
          "error"
        );
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessageContent(suggestion);
    // Focus vào input sau khi chọn gợi ý
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    // Cuộn xuống tin nhắn mới nhất
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [listMessage, isTyping]);

  // Focus vào input khi component được mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <h2 className="chat-title">
          <OpenAIOutlined />
          AI Assistant
        </h2>
        <button onClick={onClose} className="close-button" aria-label="Đóng">
          ✖
        </button>
      </div>

      {/* Suggestions */}
      {listMessage.length === 0 && (
        <div className="suggestions-container">
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="chat-area">
        {listMessage &&
          listMessage.map((item, index) => (
            <div
              key={index}
              className={item.isUser ? "message-row user" : "message-row bot"}
            >
              <div className={item.isUser ? "message user" : "message bot"}>
                {item.chatContent}
              </div>
            </div>
          ))}

        {/* Loading message */}
        {isTyping && (
          <div className="message-row bot">
            <div className="message bot loading">
              <span className="dot dot1">.</span>
              <span className="dot dot2">.</span>
              <span className="dot dot3">.</span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <div className="input-container">
        <input
          ref={inputRef}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && messageContent.trim()) {
              handleUserSendMessage();
            }
          }}
          type="text"
          placeholder="Nhập tin nhắn của bạn..."
          className="message-input"
          disabled={isLoading}
        />
        <button
          className={
            messageContent.trim() && !isLoading
              ? "send-button active"
              : "send-button disabled"
          }
          disabled={!messageContent.trim() || isLoading}
          onClick={handleUserSendMessage}
          aria-label="Gửi tin nhắn"
        >
          {isLoading ? <LoadingOutlined /> : <SendOutlined />}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
