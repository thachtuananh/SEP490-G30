// Create a simple fetch-based API service instead of using axios-config

export default async function AskGpt({ question }) {
  try {
    const response = await fetch("/Chat/AskGPT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}
