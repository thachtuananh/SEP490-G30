import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';


ReactDOM.createRoot(document.getElementById("root")).render(
    <ConfigProvider locale={viVN}
        theme={{
            token: {
                "colorPrimary": '#039855',
                "colorLink": '#039855',
                "colorInfo": "#039855",
                "colorSuccess": '#039855',
                "fontFamily": '"Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                "colorPrimaryHover": '#039855',
            },
            components: {
                "Button": {
                    "background": '#039855',
                },
                "Typography": {
                    "fontSize": 16
                }
            }
        }}
    >
        <App />
    </ConfigProvider>
);

