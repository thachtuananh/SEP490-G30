import React, { useState, useEffect } from "react";
import { Modal, Rate, Input, Button, Empty, message, Form } from "antd";
import { fetchFeedback, createFeedback, updateFeedback } from "../../services/owner/FeedbackAPI";
import styles from "./FeedbackModal.module.css";

const { TextArea } = Input;

export const FeedbackModal = ({ visible, jobId, customerId, onClose }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);

    // Fetch feedback when modal is opened
    useEffect(() => {
        if (visible && jobId) {
            loadFeedback();
        }
    }, [visible, jobId]);

    // Load feedback data
    const loadFeedback = async () => {
        setLoading(true);
        try {
            const result = await fetchFeedback(customerId, jobId);
            if (result.status === "OK" && result.feedback) {
                setFeedback(result.feedback);
                form.setFieldsValue({
                    rating: result.feedback.rating,
                    comment: result.feedback.comment
                });
            } else {
                setFeedback(null);
                form.resetFields();
            }
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
            setFeedback(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const feedbackData = {
                rating: values.rating,
                comment: values.comment || ""
            };

            if (feedback) {
                // Update existing feedback
                await updateFeedback(customerId, jobId, feedbackData);
                message.success("✅ Cập nhật đánh giá thành công!");
            } else {
                // Create new feedback
                await createFeedback(customerId, jobId, feedbackData);
                message.success("✅ Tạo đánh giá thành công!");
            }

            // Reload feedback to show updated data
            await loadFeedback();
            setEditing(false);
        } catch (error) {
            console.error("Lỗi khi lưu đánh giá:", error);
            message.error("❌ Không thể lưu đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = () => {
        setEditing(true);
        if (feedback) {
            form.setFieldsValue({
                rating: feedback.rating,
                comment: feedback.comment
            });
        } else {
            form.resetFields();
        }
    };

    const cancelEditing = () => {
        setEditing(false);
        form.setFieldsValue({
            rating: feedback?.rating || 0,
            comment: feedback?.comment || ""
        });
    };

    // Render feedback display
    const renderFeedbackDisplay = () => {
        if (!feedback) {
            return (
                <Empty
                    description="Chưa có đánh giá nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <div className={styles.feedbackDisplay}>
                <div className={styles.ratingDisplay}>
                    <span className={styles.ratingLabel}>Đánh giá:</span>
                    <Rate disabled value={feedback.rating} />
                </div>
                <div className={styles.commentDisplay}>
                    <div className={styles.commentLabel}>Nhận xét:</div>
                    <div className={styles.commentText}>{feedback.comment || "Không có nhận xét"}</div>
                </div>
            </div>
        );
    };

    // Render feedback form
    const renderFeedbackForm = () => {
        return (
            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                initialValues={{
                    rating: feedback?.rating || 0,
                    comment: feedback?.comment || ""
                }}
            >
                <Form.Item
                    name="rating"
                    label="Đánh giá"
                    rules={[{ required: true, message: "Vui lòng chọn số sao đánh giá" }]}
                >
                    <Rate />
                </Form.Item>

                <Form.Item
                    name="comment"
                    label="Nhận xét"
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập nhận xét của bạn..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <div className={styles.formButtons}>
                    <Button onClick={cancelEditing} style={{ marginRight: 8 }}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {feedback ? "Cập nhật" : "Gửi đánh giá"}
                    </Button>
                </div>
            </Form>
        );
    };

    return (
        <Modal
            title="Đánh giá dịch vụ"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <div className={styles.modalContent}>
                {loading && !editing ? (
                    <div className={styles.loadingContainer}>Đang tải...</div>
                ) : editing ? (
                    renderFeedbackForm()
                ) : (
                    <>
                        {renderFeedbackDisplay()}
                        <div className={styles.actionButtons}>
                            <Button type="primary" onClick={startEditing}>
                                {feedback ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};