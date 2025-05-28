import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./WebSocketContext";

const CleanerWebSocket = () => {
    const stompClient = useContext(WebSocketContext);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        // Only proceed if stompClient exists and is connected
        if (!stompClient || !stompClient.connected) {
            return;
        }

        const cleanerData = JSON.parse(sessionStorage.getItem("cleaner"));
        const cleanerId = cleanerData?.cleanerId;

        if (cleanerId) {
            // Send cleaner online status
            stompClient.publish({
                destination: "/app/cleaner-online",
                body: JSON.stringify({ cleanerId: cleanerId, status: "online" })
            });
            console.log("📡 Sent cleaner-online with cleanerId:", cleanerId);
        }

        // Subscribe to messages
        try {
            const newSubscription = stompClient.subscribe("/topic/cleaner-status", (message) => {
                console.log("📩 Received message from BE:", message.body);
            });
            setSubscription(newSubscription);
            console.log("✅ Successfully subscribed to /topic/cleaner-status");
        } catch (error) {
            console.error("❌ Failed to subscribe:", error);
        }

        // Cleanup function
        return () => {
            if (subscription && typeof subscription.unsubscribe === "function") {
                subscription.unsubscribe();
                console.log("🚫 Unsubscribed from /topic/cleaner-status");
            }
        };
    }, [stompClient, stompClient?.connected]);

    return null;
};

export default CleanerWebSocket;