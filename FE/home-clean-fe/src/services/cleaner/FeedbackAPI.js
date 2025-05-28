import { BASE_URL } from "../../utils/config";

// Fetch feedback for a job
export async function fetchFeedback(cleanerId, jobId) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/customer/cleaners/${cleanerId}/job/${jobId}/feedback`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch feedback");
    }

    const data = await response.json();
    // Transform the response to match what the FeedbackModal component expects
    return {
      status: data.status,
      rating: data.rating,
      comment: data.comment,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
}

// Create feedback for a job
export async function createFeedback(cleanerId, jobId, feedbackData) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/customer/${cleanerId}/job/${jobId}/feedback`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create feedback");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw error;
  }
}

// Update feedback for a job
export async function updateFeedback(cleanerId, jobId, feedbackData) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/customer/${cleanerId}/job/${jobId}/cleaner/updatefeedback`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update feedback");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
}
