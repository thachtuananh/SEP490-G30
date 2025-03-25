import React from 'react';
import { Card, Statistic } from 'antd';
import { WalletOutlined } from '@ant-design/icons';

export const WalletBalance = () => {
    const walletBalance = 19819000;

    return (
        <Card
            title="Wallet Balance"
            extra={<WalletOutlined />}
            style={{
                width: 300,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
        >
            <Statistic
                title="Total Balance"
                value={walletBalance}
                precision={0}
                prefix="₫"
                valueStyle={{
                    color: '#3f8600',
                    fontWeight: 'bold'
                }}
            />
        </Card>
    );
};

