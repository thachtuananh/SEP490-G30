import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { BASE_URL } from '../utils/config';

/**
 * Send a notification to a specific user
 * @param {string} userId - The ID of the user to send the notification to
 * @param {string} message - The notification message content
 * @param {string} type - The type of notification
 * @returns {Promise} - The axios response promise
 */
export const sendNotification = async (userId, message, type) => {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Decode the JWT token to get the role
        const decodedToken = jwt_decode(token);
        const { role } = decodedToken;
        if (!role) {
            throw new Error('Role not found in token');
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

/**
 * Get all notifications for the current user
 * @returns {Promise} - The axios response promise containing all notifications
 */
export const getNotifications = async () => {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Decode the JWT token to get user information
        const decodedToken = jwt_decode(token);
        const { role, id } = decodedToken; // Ép kiểu id thành userId
        console.log('Role', role)
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

        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Get unread notification count for the current user
 * @returns {Promise<number>} - The number of unread notifications
 */
export const getUnreadNotificationCount = async () => {
    try {
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