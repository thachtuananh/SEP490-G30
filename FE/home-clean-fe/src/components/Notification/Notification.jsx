import React from "react";
import { List, Avatar, Button, Space, Typography, Badge } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import anhdaidien from "../../assets/bgintroduce.png";

const { Text, Title } = Typography;

const Notification = ({ onClose }) => {
    // Sample data
    let data = [
        { id: 1, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư", name: "Nguyễn Văn A", phone: "0987654321" },
        { id: 2, tittle: "Hết hạn đăng tải công việc", time: "14:56", day: "Thứ 4" },
        { id: 3, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 4, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 5, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
        { id: 6, tittle: "Công việc bạn đăng đã có người nhận", time: "14:56", day: "Thứ tư" },
    ];

    // Sắp xếp data theo ID giảm dần (mới nhất lên trên)
    data = data.sort((a, b) => b.id - a.id);

    // ID lớn nhất (mới nhất)
    const latestId = data[0].id;

    // Check if running on mobile
    const isMobile = window.innerWidth < 768;

    return (
        <div style={{ width: isMobile ? '100%' : '320px', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{
                padding: '10px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
                {isMobile && (
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        size="small"
                    />
                )}
            </div>

            <List
                itemLayout="horizontal"
                dataSource={data.slice(0, 5)}
                renderItem={(item) => (
                    <List.Item
                        style={{ padding: '12px 16px' }}
                        extra={
                            item.id === latestId && (
                                <Button type="primary" size="small">
                                    Xem
                                </Button>
                            )
                        }
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar icon={<BellOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            }
                            title={<Text strong>{item.tittle}</Text>}
                            description={
                                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {item.day}: {item.time}
                                    </Text>

                                    {item.id === latestId && (
                                        <div style={{
                                            marginTop: '8px',
                                            padding: '8px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                                        }}>
                                            <Avatar
                                                src={anhdaidien}
                                                size={40}
                                                style={{ marginRight: '8px' }}
                                            />
                                            <div style={{ width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '8px' : '0' }}>
                                                <Text strong>{item.name}</Text>
                                                <div>Dọn phòng ngủ</div>
                                                <Text type="secondary">{item.phone}</Text>
                                            </div>
                                        </div>
                                    )}
                                </Space>
                            }
                        />
                    </List.Item>
                )}
                footer={
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                        <Button type="link">Xem thêm</Button>
                    </div>
                }
                locale={{ emptyText: 'Không có thông báo' }}
            />
        </div>
    );
};

export default Notification;