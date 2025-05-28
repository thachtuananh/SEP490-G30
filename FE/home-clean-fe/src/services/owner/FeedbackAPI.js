import { BASE_URL } from '../../utils/config';

// Fetch feedback for a job
export async function fetchFeedback(customerId, jobId) {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/customer/${customerId}/job/${jobId}/feedback`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch feedback');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching feedback:', error);
        throw error;
    }
}

// Create feedback for a job
export async function createFeedback(customerId, jobId, feedbackData) {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/customer/${customerId}/job/${jobId}/createfeedback`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
            throw new Error('Failed to create feedback');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating feedback:', error);
        throw error;
    }
}

// Update feedback for a job
export async function updateFeedback(customerId, jobId, feedbackData) {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/customer/${customerId}/job/${jobId}/updatefeedback`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
            throw new Error('Failed to update feedback');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating feedback:', error);
        throw error;
    }
}