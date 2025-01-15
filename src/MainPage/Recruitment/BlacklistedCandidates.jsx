import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, Form, message, Empty } from 'antd';
import { SearchOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';

const BlacklistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.authentication);

  useEffect(() => {
    fetchBlacklistedCandidates();
  }, []);

  const fetchBlacklistedCandidates = async () => {
    try {
      setLoading(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        setCandidates([]);
        return;
      }

      const response = await apiServices('GET', 'candidates/blacklisted', null, {
        access_token: {
          accessToken: token
        },
        user: authState?.user
      });
      
      if (response?.data?.status) {
        setCandidates(response.data.data || []);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching blacklisted candidates:', error);
      // Silently handle error and show empty state
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBlacklist = async (values) => {
    try {
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      const response = await apiServices('POST', 'candidates/blacklist', values, {
        access_token: {
          accessToken: token
        },
        user: authState?.user
      });
      
      if (response?.data?.status) {
        message.success('Candidate added to blacklist successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchBlacklistedCandidates();
      }
    } catch (error) {
      console.error('Error adding candidate to blacklist:', error);
      message.error('Failed to add candidate to blacklist');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Blacklisted Date',
      dataIndex: 'blacklistedDate',
      key: 'blacklistedDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <Tag color="red">BLACKLISTED</Tag>
      ),
    }
  ];

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Blacklisted Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Blacklisted Candidates</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Add to Blacklist
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3">
            <Input
              placeholder="Search Candidates"
              prefix={<SearchOutlined />}
              onChange={(e) => console.log(e.target.value)}
            />
          </div>
        </div>

        <Table
          className="mt-4"
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="No blacklisted candidates found" />
          }}
        />
      </Card>

      <Modal
        title="Add Candidate to Blacklist"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddToBlacklist}
        >
          <Form.Item
            name="name"
            label="Candidate Name"
            rules={[{ required: true, message: 'Please enter candidate name' }]}
          >
            <Input placeholder="Enter candidate name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Blacklisting"
            rules={[{ required: true, message: 'Please enter reason for blacklisting' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter reason for blacklisting" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add to Blacklist
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlacklistedCandidates; 