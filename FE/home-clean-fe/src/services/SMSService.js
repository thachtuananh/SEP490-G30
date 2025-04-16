import { BASE_URL } from "../utils/config";

// Main SMS API service class
export async function sendSms(phoneNumber, message) {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in session storage");
      }
      const response = await fetch(`https://pike-armor-ms-hampton.trycloudflare.com/api/sms/send?to=${phoneNumber}`, {

      // const response = await fetch(`${BASE_URL}/sms/send?to=${phoneNumber}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
