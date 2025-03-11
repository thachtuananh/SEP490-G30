import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ConfigProvider } from 'antd';


ReactDOM.createRoot(document.getElementById("root")).render(
    <ConfigProvider
        theme={{
            token: {
                colorPrimary: '#039855',
                colorLink: '#039855',
                colorSuccess: '#039855',
            },
            components: {
                Button: {
                    colorPrimary: '#039855',
                    // Tùy chỉnh riêng cho Button
                },
            }
        }}
    >
        <App />
    </ConfigProvider>
);

