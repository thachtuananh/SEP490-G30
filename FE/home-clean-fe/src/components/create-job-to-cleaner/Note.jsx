import React from "react";
import styles from "../../assets/CSS/createjob/Note.module.css";
import { Input, Typography } from "antd";

const { TextArea } = Input;
const { Title } = Typography;
const Note = ({ onNoteChange }) => {
  const handleChange = (e) => {
    if (onNoteChange) {
      onNoteChange(e.target.value);
    }
  };

  return (
    <div className={styles.noteContainer}>
      <Title level={5}>Ghi chú cho Cleaner</Title>
      <TextArea
        placeholder="Nhập ghi chú cho Người dọn dẹp..."
        autoSize={{ minRows: 4 }}
        style={{ width: "100%" }}
        onChange={handleChange}
      />
    </div>
  );
};

export default Note;
