import React from "react";
import styles from "../../assets/CSS/createjob/Note.module.css";

const Note = () => {
    return (
        <div className={styles.noteContainer}>
            <h4 className={styles.noteTitle}>Ghi chú cho Cleaner</h4>
            <textarea
                className={styles.noteTextarea}
                placeholder="Nhập ghi chú cho người giúp việc..."
            >
            </textarea>
        </div>
    )
}

export default Note;