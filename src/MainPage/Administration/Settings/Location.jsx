import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Dropdown,
  Menu,
  Select,
  Switch,
  Avatar,
  Space,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { apiServices } from "../../../Services/apiServices";
import more from "../../../assets/iconsRecruitment/vertical.svg";


export default function Location() {
  const user_state = useSelector((state) => state.user.loginvalue);

  // -------------------- STATE --------------------
  const [locations, setLocations] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [form] = Form.useForm();

  // -------------------- EFFECTS --------------------
  useEffect(() => {
    getLocations();
  }, []);

  const getLocations = async () => {
  try {
    setTableLoader(true);

    const res = await apiServices(
      "GET",
      "locations",
      null,
      user_state
    );
    console.log(res?.data,'meow')
    if(res?.data?.docs){
      console.log(res?.data?.docs, 'locations agayi jeeo')
      setLocations(res?.data?.docs || []);
    }
    // Backend returns { docs: [...] }
  } catch (err) {
    console.error("Failed to fetch locations:", err);
  } finally {
    setTableLoader(false);
  }
};


  const handleAdd = () => {
    setEditingLocation(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingLocation(record);
    form.setFieldsValue({
      name: record.name,
      latitude: record.latitude,
      longitude: record.longitude,
      radius_meter: record.radius_meter,
      isRemote: record.isRemote,
      assignedEmployees: record.assignedEmployees?.map((e) => e._id),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    // STEP 10
  };

  const handleSubmit = async (values) => {
    // STEP 9
  };

  // -------------------- TABLE COLUMNS --------------------
  const columns = [
    {
      title: "Location",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Assigned Employees",
      key: "assignedEmployees",
      render: (_, record) => (
        <Avatar.Group maxCount={4}>
          {record.assignedEmployees?.map((emp) => (
            <Avatar key={emp._id} src={emp.imageUrl}>
              {emp.fullName?.[0]}
            </Avatar>
          ))}
        </Avatar.Group>
      ),
    },
{
  title: "Actions",
  key: "actions",
  align: "center",
  render: (_, record) => {
    const menu = (
      <Menu
        items={[
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          {
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            label: "Delete",
            onClick: () => {
              Modal.confirm({
                title: "Delete Location",
                content: "Are you sure you want to delete this location?",
                okText: "Yes, Delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => handleDelete(record._id),
              });
            },
          },
        ]}
      />
    );

    return (
      <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
        <div
          style={{
            cursor: "pointer",
            height: "24px",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <img src={more} alt="More Options" style={{ height: "24px" }} />
        </div>
      </Dropdown>
    );
  },
}

  ];

  // -------------------- RENDER --------------------
  return (
    <div className="card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Locations</h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Location
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={locations}
        loading={tableLoader}
        rowKey="_id"
        pagination={false}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        title={editingLocation ? "Edit Location" : "Add Location"}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Location Name"
            name="name"
            rules={[{ required: true, message: "Location name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Latitude" name="latitude">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Longitude" name="longitude">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Radius (meters)" name="radius_meter">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Remote Location"
            name="isRemote"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Assigned Employees" name="assignedEmployees">
            <Select
              mode="multiple"
              placeholder="Select employees"
              options={[]} // STEP 9
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
