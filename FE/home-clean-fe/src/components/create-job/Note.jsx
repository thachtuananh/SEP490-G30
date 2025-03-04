import React from "react";

const Note = () => {
    return (
        <div
            style={{
                padding: '15px',
                border: '1px solid rgb(225, 225, 225)',
                borderRadius: '5px',
                marginTop: '15px'
            }}
        >
            <h4>Ghi chú cho Cleaner</h4>
            <textarea name="" id=""
                style={{
                    minWidth: 665,
                    padding: '15px',
                    border: '1px solid rgb(225, 225, 225)',
                    borderRadius: '5px',
                    marginTop: 15,
                    maxWidth: 665,
                    minHeight: 100
                }}
            >

            </textarea>
        </div>
    )
}

export default Note;