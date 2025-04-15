import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { BASE_URL } from '../utils/config';

export const sendNotification = async (userId, message, type, role) => {
    try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }
        if (!role) {
            throw new Error('Role is required');
        }

        // Set up request headers with the token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Prepare request data
        const data = {
            message,
            type
        };

        // Make the API call
        const response = await axios.post(
            `${BASE_URL}/notification/send/${role}/${userId}`,
            data,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

// Track if notifications have been read locally
let notificationsReadLocally = false;

export const getNotifications = async () => {
    try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('token');
        // const role = sessionStorage.getItem('role');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Decode the JWT token to get user information
        const decodedToken = jwt_decode(token);
        const { role, id } = decodedToken; // Ép kiểu id thành userId
        if (!role || !id) {
            throw new Error('User information not found in token');
        }

        // Set up request headers with the token
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Make the API call based on the role (converting role to lowercase)
        const response = await axios.get(
            `${BASE_URL}/notification/${role}/${id}`,
            { headers }
        );

        // If notifications have been marked as read locally, modify the response
        if (notificationsReadLocally) {
            return response.data.map(notification => ({
                ...notification,
                isRead: true
            }));
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const deleteAllNotifications = async (role, userId) => {
    try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }
        if (!role) {
            throw new Error('Role is required');
        }
        if (!userId) {
            throw new Error('User ID is required');
        }

        // Set up request headers with the token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Make the API call to delete all notifications
        const response = await axios.delete(
            `${BASE_URL}/notification/${role}/${userId}`,
            { headers }
        );

        // Reset the local read state when deleting all notifications
        notificationsReadLocally = false;
        
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
};

export const getUnreadNotificationCount = async () => {
    try {
        // If notifications have been marked as read locally, return 0
        if (notificationsReadLocally) {
            return 0;
        }
        
        const notifications = await getNotifications();
        // Count notifications that have an isRead property that is false
        // If isRead property doesn't exist, assume it's unread
        return notifications.filter(notification =>
            notification.isRead === false || notification.isRead === undefined
        ).length;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
    }
};