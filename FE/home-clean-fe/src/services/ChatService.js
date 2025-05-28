import axios from 'axios';
import { BASE_URL } from '../utils/config';
import { message } from 'antd';

export const getUnreadMessageCount = async () => {
    try {
        const userId = sessionStorage.getItem('customerId') || sessionStorage.getItem('cleanerId');
        const role = sessionStorage.getItem('role');

        if (!userId || !role) {
            console.error('User ID or role not found');
            return 0;
        }

        // Since there's no direct API for unread count, we'll need to implement
        // a different approach. For now, returning 0 as a placeholder
        // TODO: Implement logic to fetch or calculate unread messages
        
        return 0;
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        return 0;
    }
};

export const createConversation = async (customerId, cleanerId) => {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/conversations?customerId=${customerId}&cleanerId=${cleanerId}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Conversation API responded with status: ${response.status}`);
        }

        const conversationData = await response.json();
        message.success('Cuộc trò chuyện đã được tạo');
        return conversationData;
    } catch (error) {
        console.error("Error creating conversation:", error);
        message.error('Không thể tạo cuộc trò chuyện');
        throw error;
    }
};

export const handleConversationSelect = async (conversation, setSelectedConversation, setMessages) => {
    console.log("🔍 Chọn cuộc trò chuyện:", conversation);

    if (!conversation || !conversation.id) {
        console.error("Lỗi: Cuộc trò chuyện không hợp lệ!", conversation);
        return;
    }

    setSelectedConversation(conversation);

    const apiUrl = `${BASE_URL}/messages/${conversation.id}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data && Array.isArray(data.messages)) {
            // Transform messages if needed based on API response structure
            const formattedMessages = data.messages.map(msg => ({
                ...msg,
                // Ensure consistency in field names
                sentAt: msg.sent_at || msg.sentAt,
                // Add any other necessary transformations
            }));
            
            setMessages(formattedMessages);
        } else {
            console.error("API không trả về mảng tin nhắn hợp lệ:", data);
            setMessages([]);
        }
    } catch (error) {
        console.error("Lỗi khi tải tin nhắn cũ:", error);
        setMessages([]);
    }
};