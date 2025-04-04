import React from "react";
import { Card, Button, Dropdown, Menu, Table, Space, Avatar, Tag } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";

const DealsTable = () => {
  const monthMenuItems = [{ key: "1", label: "October" }];

  // Columns definition
  const dealsColumns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.image} shape="square" size="small" />
          {text}
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Date - Time",
      dataIndex: "dateTime",
      key: "dateTime",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Delivered" ? "success" : "processing"}
          key={status}
        >
          {status}
        </Tag>
      ),
    },
  ];

  // Sample data
  const dealsData = [
    {
      key: "1",
      productName: "Apple Watch",
      image: "https://via.placeholder.com/40",
      location: "6096 Margolaine Landing",
      dateTime: "12.09.2019 - 12.53 PM",
      price: "423",
      amount: "$34,295",
      status: "Delivered",
    },
  ];

  return (
    <Card
      title="Deals Details"
      extra={
        <Dropdown overlay={<Menu items={monthMenuItems} />}>
          <Button>
            October <CaretDownOutlined />
          </Button>
        </Dropdown>
      }
    >
      <Table columns={dealsColumns} dataSource={dealsData} pagination={false} />
    </Card>
  );
};

export default DealsTable;
