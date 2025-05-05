import React, { useState } from "react";
import { Input, Button, Space } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";

const SearchBar = ({ onSearch, onClear }) => {
  const [searchText, setSearchText] = useState("");

  const handleClear = () => {
    setSearchText("");
    onClear();
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText.trim());
    } else {
      onClear(); // Có thể gọi onClear nếu người dùng bấm "Tìm kiếm" khi không nhập gì
    }
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
          onClick={handleSearch}
          size="large"
        >
          Tìm kiếm
        </Button>
      </Space.Compact>
    </div>
  );
};

export default SearchBar;
