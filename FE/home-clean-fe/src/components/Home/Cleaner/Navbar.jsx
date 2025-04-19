import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import houseCleanLogo from "../../../assets/HouseClean_logo.png";
import Notification from "../../Notification/Notification";
import styles from "../../../assets/CSS/Notification/Notification.module.css";
import { message, Button, Dropdown, Avatar, Badge, Popover } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import ChatWindow from "../../Chat/ChatWindow";
import ConversationList from "../../Chat/ConversationList";
import { getUnreadNotificationCount } from "../../../services/NotificationService";
import {
  getUnreadMessageCount,
  handleConversationSelect as serviceHandleConversationSelect,
} from "../../../services/ChatService";
import { URL_WEB_SOCKET } from "../../../utils/config";

function Navbar() {
  const { cleaner, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupNotification, setIsPopupNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);

  const [isPopupMessage, setIsPopupMessage] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  //Them phan khai báo Chat
  const roleStr = sessionStorage.getItem("role");
  const role = roleStr ? roleStr.toLowerCase() : null;
  const userId = sessionStorage.getItem("cleanerId");

  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  //Kết thúc phần khai báo cho Chat

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch notification count when component mounts and when user changes
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (cleaner) {
        try {
          setIsLoading(true);
          const count = await getUnreadNotificationCount();
          setNotificationCount(count);
        } catch (error) {
          console.error("Failed to fetch notification count:", error);
          message.error(
            "Không thể tải số lượng thông báo. Vui lòng thử lại sau!"
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();

    // Set up polling to refresh notification count every minute
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => clearInterval(intervalId);
  }, [cleaner]);

  // Fetch message count when component mounts and when user changes
  useEffect(() => {
    const fetchMessageCount = async () => {
      if (cleaner) {
        try {
          setIsMessageLoading(true);
          const count = await getUnreadMessageCount();
          setMessageCount(count);
        } catch (error) {
          console.error("Failed to fetch message count:", error);
        } finally {
          setIsMessageLoading(false);
        }
      } else {
        setMessageCount(0);
      }
    };

    fetchMessageCount();

    // Set up polling to refresh message count every minute
    const intervalId = setInterval(fetchMessageCount, 120000);

    return () => clearInterval(intervalId);
  }, [cleaner]);

  // Close the menu when notification popup is opened on mobile
  useEffect(() => {
    if (isPopupNotification && isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isPopupNotification, isMobile, isMenuOpen]);

  const toggleMenu = () => {
    // Close notification popup when opening menu on mobile
    if (isMobile && isPopupNotification) {
      setIsPopupNotification(false);
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    if (stompClient && stompClient.connected) {
      const cleanerData = JSON.parse(sessionStorage.getItem("cleaner"));
      if (cleanerData?.cleanerId) {
        stompClient.publish({
          destination: "/app/cleaner-offline",
          body: JSON.stringify({
            cleanerId: cleanerData.cleanerId,
            status: "offline",
          }),
        });
      }
    }
    if (stompClient) {
      stompClient.deactivate();
    }
    dispatch({ type: "LOGOUT" });
    message.success("Đăng xuất thành công!");
    navigate("/homeclean");
  };

  const toggleNotification = () => {
    setIsPopupNotification(!isPopupNotification);
    // Reset notification count when opening the notification panel
    if (!isPopupNotification) {
      setNotificationCount(0);
    }
    // Close menu when toggling notification on mobile
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Refresh notifications manually
  const refreshNotifications = async () => {
    if (cleaner) {
      try {
        setIsLoading(true);
        // const count = await getUnreadNotificationCount();
        setNotificationCount(0);
      } catch (error) {
        console.error("Failed to refresh notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Lấy tên user từ sessionStorage nếu chưa có trong context
  const getCleanerName = () => {
    if (cleaner && cleaner.cleanerName) {
      return cleaner.cleanerName;
    }
    // Fallback to sessionStorage for compatibility
    const storedName = sessionStorage.getItem("name");
    return storedName ? storedName : "";
  };

  // Dropdown menu cho cleaner
  const cleanerMenu = {
    items: [
      {
        key: "1",
        label: (
          <Link to="/homeclean/infomationcleaner">Thông tin tài khoản</Link>
        ),
        icon: <UserOutlined />,
      },
      {
        key: "2",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  // Notification icon với animation khi có thông báo mới
  const notificationIcon = (
    <Badge
      count={notificationCount}
      size="small"
      offset={[-2, 6]}
      className={styles.notification_badge}
    >
      <div
        className={styles.notification_icon_wrapper}
        onClick={isMobile ? toggleNotification : undefined}
      >
        <BellOutlined
          className={`${styles.notification_icon} ${
            notificationCount > 0 ? styles.notification_active : ""
          }`}
          style={{ fontSize: "20px" }}
          spin={isLoading}
        />
      </div>
    </Badge>
  );

  // Mobile notification content
  const mobileNotificationContent =
    isPopupNotification && isMobile && cleaner ? (
      <div
        className={styles.mobile_notification_overlay}
        onClick={() => setIsPopupNotification(false)}
      >
        <div
          className={styles.mobile_notification_container}
          onClick={(e) => e.stopPropagation()}
        >
          <Notification
            onClose={() => setIsPopupNotification(false)}
            onViewAll={() => {
              setIsPopupNotification(false);
              // Navigate to full notification page if you have one
              // navigate("/notifications");
            }}
          />
        </div>
      </div>
    ) : null;

  // Notification popover component (for desktop)
  const notificationPopover = isMobile ? (
    cleaner ? (
      notificationIcon
    ) : null
  ) : cleaner ? (
    <Popover
      content={
        <Notification
          onClose={() => setIsPopupNotification(false)}
          onViewAll={() => {
            setIsPopupNotification(false);
            // Navigate to full notification page if you have one
            // navigate("/notifications");
          }}
        />
      }
      trigger="click"
      open={isPopupNotification}
      onOpenChange={(visible) => {
        setIsPopupNotification(visible);
        if (visible) {
          // Reset notification count when opening the popover
          setNotificationCount(0);
          // Refresh notification count when opening the popover
          refreshNotifications();
        }
      }}
      placement="bottomRight"
      overlayClassName={styles.notification_popover}
    >
      {notificationIcon}
    </Popover>
  ) : null;

  // User profile component
  const cleanerProfile = (
    <Dropdown menu={cleanerMenu} placement="bottomRight">
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: "8px" }} />
        <span>{getCleanerName()}</span>
      </div>
    </Dropdown>
  );
  // Login and Register buttons
  const authButtons = (
    <div style={{ display: "flex", gap: "10px" }}>
      <Link
        to="/homeclean/login/cleaner"
        className="login-btn"
        style={{ width: "110px" }}
      >
        Đăng nhập
      </Link>
      <Link
        to="/homeclean/register/cleaner"
        className="login-btn"
        style={{
          width: "110px",
          textAlign: "center",
          background: "white",
          border: "2px solid #00a651",
          color: "black",
        }}
      >
        Đăng ký
      </Link>
    </div>
  );

  const toggleMessage = () => {
    setIsPopupMessage(!isPopupMessage);
    // Close menu when toggling message on mobile
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Message icon with loading and count
  const messageIcon = (
    <Badge
      count={messageCount}
      size="small"
      offset={[-2, 6]}
      className={styles.message_badge}
    >
      <div
        className={styles.message_icon_wrapper}
        onClick={isMobile ? toggleMessage : undefined}
      >
        <MessageOutlined
          className={`${styles.message_icon} ${
            messageCount > 0 ? styles.message_active : ""
          }`}
          style={{ fontSize: "20px" }}
          spin={isMessageLoading}
        />
      </div>
    </Badge>
  );

  // WebSocket connection for real-time message updates
  useEffect(() => {
    if (!role || !userId) {
      console.error("Missing role or userId in URL!");
      return;
    }

    const socket = new SockJS(`${URL_WEB_SOCKET}/websocket-chat`);
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log(`User ${userId} (${role}) connected to WebSocket`);
      setStompClient(client);

      const queueName = `/queue/messages-${userId}`;
      client.subscribe(queueName, (message) => {
        const msg = JSON.parse(message.body);

        // Update messages
        setMessages((prev) => [...prev, msg]);

        // Increment message count for new unread message
        setMessageCount((prevCount) => prevCount + 1);
      });
    });

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [role, userId]);

  // Refresh messages manually
  const refreshMessages = async () => {
    if (cleaner) {
      try {
        setIsMessageLoading(true);
        const count = await getUnreadMessageCount();
        setMessageCount(count);
      } catch (error) {
        console.error("Failed to refresh message count:", error);
      } finally {
        setIsMessageLoading(false);
      }
    }
  };

  const handleConversationSelect = (conversation) => {
    serviceHandleConversationSelect(
      conversation,
      setSelectedConversation,
      setMessages
    );
    // Reset message count when a conversation is selected
    setMessageCount(0);
  };

  const sendMessage = (messageContent) => {
    if (stompClient && selectedConversation) {
      const message = {
        content: messageContent,
        senderId: userId,
        conversationId: selectedConversation.id,
      };

      const headers = {
        customerId: selectedConversation.customerId.toString(),
        employeeId: selectedConversation.employeeId.toString(),
      };

      stompClient.send("/app/chat", headers, JSON.stringify(message));
      setMessages((prev) => [
        ...prev,
        { ...message, sentAt: new Date().toISOString() },
      ]);
    }
  };

  // Message popover component (for desktop)
  const messagePopover = isMobile ? (
    cleaner ? (
      messageIcon
    ) : null
  ) : cleaner ? (
    <Popover
      content={
        <div className={styles.message_container}>
          <div className={styles.message__title}>
            <h2>Tin nhắn</h2>
          </div>
          <div className={styles.message__main}>
            <div className={styles.message_sidebar}>
              <div className={styles.message_user_list}>
                <ConversationList
                  onSelect={(conversation) => {
                    handleConversationSelect(conversation);
                  }}
                  userId={userId}
                  role={role}
                />
              </div>
            </div>
            <div className={styles.message_outlet}>
              <ChatWindow
                messages={messages}
                onSendMessage={sendMessage}
                conversation={selectedConversation}
                userId={userId}
              />
            </div>
          </div>
        </div>
      }
      trigger="click"
      open={isPopupMessage}
      onOpenChange={(visible) => {
        setIsPopupMessage(visible);
        if (visible) {
          // Refresh message count when opening the popover
          refreshMessages();
        }
      }}
      placement="top"
      overlayClassName={styles.message_popover}
      getPopupContainer={() =>
        document.querySelector(`.${styles.message_icon_wrapper}`)
      }
    >
      {messageIcon}
    </Popover>
  ) : null;

  // Mobile message content
  const mobileMessageContent =
    isPopupMessage && isMobile && cleaner ? (
      <div
        className={styles.mobile_notification_overlay}
        onClick={() => setIsPopupMessage(false)}
      >
        <div
          className={styles.mobile_notification_container}
          style={{ maxWidth: "95%", width: "350px", maxHeight: "80vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={styles.message_container}
            style={{ width: "100%", height: "100%" }}
          >
            <div className={styles.message__title}>
              <h2>Tin nhắn</h2>
            </div>
            <div className={styles.message__main}>
              <div className={styles.message_sidebar}>
                <div className={styles.message_user_list}>
                  <ConversationList
                    onSelect={(conversation) => {
                      handleConversationSelect(conversation);
                    }}
                    userId={userId}
                    role={role}
                  />
                </div>
              </div>
              <div className={styles.message_outlet}>
                <ChatWindow
                  messages={messages}
                  onSendMessage={sendMessage}
                  conversation={selectedConversation}
                  userId={userId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="Container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/homeclean">
            <img
              src={houseCleanLogo}
              alt="House Clean Logo"
              className="logo-img"
            />
          </Link>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`nav-content ${isMenuOpen ? "active" : ""}`}>
          <ul className="menu">
            {/* <li><Link to="/homeclean" className="nav-link"></Link></li> */}
            <li>
              <Link to="/homeclean/activityjob" className="nav-link">
                Công việc
              </Link>
            </li>
            {/* <li>
              <Link to="/homeclean" className="nav-link">
                Tin tức
              </Link>
            </li> */}
            <li>
              <Link to="/cleaner-pricing" className="nav-link">
                Bảng tiền công
              </Link>
            </li>

            {/* Only show these elements on mobile */}
            <li className="mobile-login">
              {isMobile && (
                <>
                  {cleaner && (
                    <li className="mobile-notification">
                      {notificationPopover}
                      {messagePopover}
                    </li>
                  )}
                  {cleaner ? cleanerProfile : authButtons}
                </>
              )}
            </li>
          </ul>
        </div>

        {/* Only show these elements on desktop */}
        <div className="desktop-login">
          {!isMobile && (
            <>
              {cleaner && (
                <div
                  className="desktop-notification"
                  style={{
                    marginRight: "12px",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {notificationPopover}
                  {messagePopover}
                </div>
              )}
              {cleaner ? cleanerProfile : authButtons}
            </>
          )}
        </div>
      </nav>

      {/* Render mobile notification panel outside navbar structure */}
      {mobileNotificationContent}
      {mobileMessageContent}
    </div>
  );
}

export default Navbar;
