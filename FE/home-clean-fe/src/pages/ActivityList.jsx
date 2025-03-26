import React, { useContext, useEffect, useState } from "react";
import { ActivityCard } from "../components/activity/ActivityCard";
import styles from "../components/activity/ActivityList.module.css";
import { AuthContext } from "../context/AuthContext";
import { Modal } from "antd";
import { BASE_URL } from "../utils/config";

export const ActivityList = () => {
    const [data, setData] = useState([]);
    const { token, customerId } = useContext(AuthContext);
    const [reloadTrigger, setReloadTrigger] = useState(false);

    //API GET
    useEffect(() => {
        fetch(`${BASE_URL}/customer/${customerId}/listjobsbook`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(res => setData(res.sort((a, b) => b.jobId - a.jobId)))
            .catch(error => console.error("Lỗi:", error));
    }, [customerId, token, reloadTrigger]);

    // API DELETE
    const handleDelete = (jobId) => {
        Modal.confirm({
            title: "Xác nhận xóa bài đăng",
            content: "Bạn có chắc chắn muốn xóa bài đăng này?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: () => {
                fetch(`${BASE_URL}/customer/${customerId}/cancel-job/${jobId}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
                    .then(response => {
                        if (!response.ok) throw new Error(`Lỗi: ${response.status}`);
                        return response.json();
                    })
                    .then(() => {
                        console.log("Xóa thành công!");
                        setReloadTrigger(prev => !prev);
                    })
                    .catch(error => console.error("Lỗi khi xóa:", error));
            },
        });
    };

    return (
        <div className={styles.actlist}>
            <div className={styles.container}>
                <h2 className={styles.title}>Hoạt động gần đây</h2>
                <p className={styles.subtitle}>Quản lý các hoạt động đăng bài</p>
                <ActivityCard data={data} onDelete={handleDelete} />
            </div>
        </div>
    );
};