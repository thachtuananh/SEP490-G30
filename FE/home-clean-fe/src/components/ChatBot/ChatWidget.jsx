import { useState, useEffect, useRef } from "react";
import ChatWindow from "../ChatBot/ChatWindow";
import Lottie from "lottie-react";
import chatbotAnimation from "../../assets/chatbotAnimation.json";
import "./ChatBot.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [listMessage, setListMessage] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const chatContainerRef = useRef(null);

  // Cải thiện danh sách tin nhắn chào mừng
  const messages = [
    "Chào mừng bạn đến với HouseClean!",
    "Tôi là trợ lý AI, tôi có thể giúp gì cho bạn?",
    "Hãy hỏi tôi về dịch vụ của chúng tôi",
  ];

  useEffect(() => {
    const typingSpeed = 70;
    const deletingSpeed = 90;
    const pauseTime = 2000;

    const handleTyping = setInterval(
      () => {
        const currentMessage = messages[index];

        if (!deleting) {
          // Typing effect
          setText((prev) => currentMessage.substring(0, prev.length + 1));
          if (text === currentMessage) {
            setTimeout(() => setDeleting(true), pauseTime);
            clearInterval(handleTyping);
          }
        } else {
          // Deletion effect
          setText((prev) => currentMessage.substring(0, prev.length - 1));
          if (text === "") {
            setDeleting(false);
            setIndex((prev) => (prev + 1) % messages.length);
          }
        }
      },
      deleting ? deletingSpeed : typingSpeed
    );

    return () => clearInterval(handleTyping);
  }, [text, deleting, index, messages]);

  // Xử lý click bên ngoài để đóng chatbot
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Ẩn tooltip khi chatbot mở
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    } else {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Thêm tin nhắn chào mừng khi lần đầu mở chatbot
  useEffect(() => {
    if (isOpen && listMessage.length === 0) {
      setListMessage([
        {
          isUser: false,
          chatContent:
            "Xin chào! Tôi là trợ lý ảo của HouseClean. Tôi có thể giúp gì cho bạn hôm nay?",
        },
      ]);
    }
  }, [isOpen, listMessage.length]);

  return (
    <div className="chat-widget-container" ref={chatContainerRef}>
      {!isOpen && showTooltip && <div className="chat-tooltip">{text}</div>}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-button"
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        <Lottie className="lottie-animation" animationData={chatbotAnimation} />
      </button>

      <div
        className={`chat-window-container ${
          isOpen ? "chat-window-open" : "chat-window-closed"
        }`}
      >
        {isOpen && (
          <ChatWindow
            onClose={() => setIsOpen(false)}
            listMessage={listMessage}
            setListMessage={setListMessage}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
          />
        )}
      </div>
    </div>
  );
}
