// // Create a simple fetch-based API service instead of using axios-config

// import { URL_CHAT_AI } from "../utils/config";

// export default async function AskGpt({ question }) {
//   try {
//     const response = await fetch(`${URL_CHAT_AI}/consultation/ask`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "accept": "application/json"
//       },
//       body: JSON.stringify(question),
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const rawData = await response.json();
    
//     // Xử lý response từ OpenAI format
//     const answer = rawData.choices && 
//                    rawData.choices[0] && 
//                    rawData.choices[0].message && 
//                    rawData.choices[0].message.content 
//                    ? rawData.choices[0].message.content 
//                    : "Không thể nhận được câu trả lời.";

//     return { 
//       data: { 
//         answer: answer 
//       } 
//     };
//   } catch (error) {
//     console.error("Error in API call:", error);
//     throw error;
//   }
// }

import { URL_CHAT_AI } from "../utils/config";

/**
 * Service for communicating with the AI chatbot API
 * @param {Object} params - Request parameters
 * @param {string} params.question - User's question text
 * @returns {Promise<Object>} Response with answer data
 */
export default async function AskGpt({ question }) {
  try {
    const requestBody = { question };

    const response = await fetch(`${URL_CHAT_AI}/consultation/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    let rawData;
    try {
      rawData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", responseText);
      throw new Error("Invalid JSON response from server");
    }

    let answer;
    if (rawData.text) {
      answer = rawData.text;
    } else if (rawData.choices?.length > 0) {
      answer = rawData.choices[0]?.message?.content || "Không thể nhận được câu trả lời.";
    } else if (rawData.answer) {
      answer = rawData.answer;
    } else if (rawData.data?.answer) {
      answer = rawData.data.answer;
    } else {
      console.warn("Unexpected API response format:", rawData);
      answer = "Không thể nhận được câu trả lời từ hệ thống.";
    }

    return {
      data: {
        answer,
      }
    };
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}
