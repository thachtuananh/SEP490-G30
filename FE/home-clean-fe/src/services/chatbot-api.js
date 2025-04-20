// Create a simple fetch-based API service instead of using axios-config

import { URL_CHAT_AI } from "../utils/config";

export default async function AskGpt({ question }) {
  try {
    const response = await fetch(`${URL_CHAT_AI}/consultation/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const rawData = await response.json();
    
    // Xử lý response từ OpenAI format
    const answer = rawData.choices && 
                   rawData.choices[0] && 
                   rawData.choices[0].message && 
                   rawData.choices[0].message.content 
                   ? rawData.choices[0].message.content 
                   : "Không thể nhận được câu trả lời.";

    return { 
      data: { 
        answer: answer 
      } 
    };
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}