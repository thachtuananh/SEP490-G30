import axios from 'axios';
import { BASE_URL } from '../utils/config';
import { message } from 'antd';

export const getUnreadMessageCount = async () => {
    try {
        const userId = localStorage.getItem('customerId');
        const role = localStorage.getItem('role');

        if (!userId || !role) {
            throw new Error('User ID or role not found');
        }

        // const response = await axios.get(`${BASE_URL}/chat/unread-count`, {
        //     params: {
        //         userId: userId,
        //         role: role.toLowerCase()
        //     }
        // });

        // return response.data.unreadCount || 0;
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        return 0;
    }
};

export const createConversation = async (customerId, cleanerId) => {
    try {
        const token = localStorage.getItem("token");
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