import React, { useState, useEffect } from "react";
import { Modal, Rate, Input, Button, Empty, message, Form } from "antd";
import {
  fetchFeedback,
  createFeedback,
  updateFeedback,
} from "../../services/cleaner/FeedbackAPI";
import styles from "../../components/activity/FeedbackModal.module.css";

const { TextArea } = Input;

export const FeedbackModal = ({ visible, jobId, cleanerId, onClose }) => {
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
      const result = await fetchFeedback(cleanerId, jobId);
      // Check if response has a status field and it's "OK"
      if (result && result.status === "OK") {
        // Use the response directly as it already contains the feedback data
        setFeedback(result);
        form.setFieldsValue({
          rating: result.rating,
          comment: result.comment,
        });
        setEditing(false); // Ensure we display feedback if it exists
      } else {
        setFeedback(null);
        form.resetFields();
        setEditing(true); // Auto switch to form mode if no feedback exists
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
      setFeedback(null);
      setEditing(true); // Auto switch to form mode on error
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
        comment: values.comment || "",
      };

      if (feedback) {
        // Update existing feedback
        const updatedFeedback = await updateFeedback(
          cleanerId,
          jobId,
          feedbackData
        );
        message.success("Cập nhật đánh giá thành công!");

        // Update the local feedback state directly with the updated data
        if (updatedFeedback) {
          setFeedback(updatedFeedback);
        } else {
          // If API doesn't return the updated feedback, use our form values
          setFeedback({
            ...feedback,
            ...feedbackData,
          });
        }
      } else {
        // Create new feedback
        const newFeedback = await createFeedback(
          cleanerId,
          jobId,
          feedbackData
        );
        message.success("Tạo đánh giá thành công!");

        // Set the newly created feedback
        if (newFeedback) {
          setFeedback(newFeedback);
        } else {
          // If API doesn't return the created feedback, use our form values
          setFeedback({
            rating: values.rating,
            comment: values.comment || "",
            status: "OK", // Ensure status is set for consistency
          });
        }
      }

      // Exit editing mode to show the feedback display
      setEditing(false);

      // Re-fetch feedback data to ensure we have the latest data from server
      loadFeedback();
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
      message.error(
        "Bạn chỉ có thể cập nhật đánh giá trong 24h từ khi đánh giá lần đầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    if (feedback) {
      form.setFieldsValue({
        rating: feedback.rating,
        comment: feedback.comment,
      });
    } else {
      form.resetFields();
    }
  };

  const cancelEditing = () => {
    if (feedback) {
      setEditing(false);
      form.setFieldsValue({
        rating: feedback.rating,
        comment: feedback.comment,
      });
    } else {
      // If no feedback exists and user cancels, close modal
      // Or optionally stay in editing mode: setEditing(true);
      onClose();
    }
  };

  // Render feedback display
  const renderFeedbackDisplay = () => {
    if (!feedback) {
      return (
        // This condition should no longer happen as we auto-switch to form
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
          <div className={styles.commentText}>
            {feedback.comment || "Không có nhận xét"}
          </div>
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
          comment: feedback?.comment || "",
        }}
      >
        <Form.Item
          name="rating"
          label="Đánh giá"
          rules={[{ required: true, message: "Vui lòng chọn số sao đánh giá" }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item name="comment" label="Nhận xét">
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
        {loading ? (
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
