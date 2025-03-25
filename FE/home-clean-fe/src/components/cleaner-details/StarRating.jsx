import React from 'react';
import { Rate } from 'antd';

export const StarRating = ({ rating }) => {
    // Convert rating string to number and ensure it's between 0-5
    const numericRating = Math.min(5, Math.max(0, parseFloat(rating) || 0));

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <span style={{ fontSize: '16px', color: '', fontWeight: 'bold', marginRight: '8px' }}>
                Đánh giá trung bình:
            </span>
            <Rate
                disabled
                defaultValue={numericRating}
                allowHalf={true}
            />
            <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>
                ({rating})
            </span>
        </div>
    );
};