import React, { useState, useEffect } from "react";
import { Input, Button, Row, Col, Space } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";

const SearchBar = ({ onSearch, onClear }) => {
  const [searchText, setSearchText] = useState("");

  // Tự động tìm kiếm khi text thay đổi
  useEffect(() => {
    // Thêm một khoảng trễ nhỏ để tránh gọi hàm search quá nhiều lần
    const delaySearch = setTimeout(() => {
      if (searchText.trim()) {
        onSearch(searchText.trim());
      } else if (searchText === "") {
        // Nếu xóa hết text thì gọi onClear
        onClear();
      }
    }, 300); // 300ms độ trễ

    return () => clearTimeout(delaySearch);
  }, [searchText, onSearch, onClear]);

  const handleClear = () => {
    setSearchText("");
    onClear();
  };

  return (
    <div
      style={{
        padding: "20px 24px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Space.Compact style={{ width: "100%", maxWidth: "800px" }}>
        <Input
          placeholder="Nhập mã giao hàng tìm kiếm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          suffix={
            searchText ? (
              <CloseOutlined
                onClick={handleClear}
                style={{ cursor: "pointer", color: "rgba(0, 0, 0, 0.45)" }}
              />
            ) : null
          }
          size="large"
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => onSearch(searchText.trim())}
          size="large"
        >
          Tìm kiếm
        </Button>
      </Space.Compact>
    </div>
  );
};

export default SearchBar;
