import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "../context/AuthContext";
import { URL_WEB_SOCKET } from "../utils/config"

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [stompClient, setStompClient] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        const socket = new SockJS(`${URL_WEB_SOCKET}/websocket-chat`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log("WebSocket Debug:", str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                console.log("✅ WebSocket connected (global)");
                setStompClient(client);

                // Send cleaner online status
                const cleanerData = JSON.parse(sessionStorage.getItem("cleaner"));
                if (cleanerData?.cleanerId) {
                    client.publish({
                        destination: "/app/cleaner-online",
                        body: JSON.stringify({
                            cleanerId: cleanerData.cleanerId,
                            status: "online" // Add status field
                        }),
                    });
                }
            },
            
            beforeDisconnect: () => {
                // Send offline status before disconnection
                const cleanerData = JSON.parse(sessionStorage.getItem("cleaner"));
                if (cleanerData?.cleanerId && client.connected) {
                    client.publish({
                        destination: "/app/cleaner-offline",
                        body: JSON.stringify({
                            cleanerId: cleanerData.cleanerId,
                            status: "offline"
                        }),
                    });
                    console.log("📡 Sent cleaner-offline message");
                }
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame);
            },
        });

        client.activate();
        clientRef.current = client;

        // Thêm xử lý sự kiện beforeunload ở đây
        const handleBeforeUnload = () => {
            const cleanerData = JSON.parse(sessionStorage.getItem("cleaner"));
            if (cleanerData?.cleanerId && client.connected) {
                client.publish({
                    destination: "/app/cleaner-offline",
                    body: JSON.stringify({
                        cleanerId: cleanerData.cleanerId,
                        status: "offline"
                    }),
                });
                console.log("📡 Sent cleaner-offline message from beforeunload");
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            client.deactivate();
            console.log("🛑 WebSocket disconnected (global)");
        };
    }, [token]);

    return (
        <WebSocketContext.Provider value={stompClient}>
            {children}
        </WebSocketContext.Provider>
    );
};