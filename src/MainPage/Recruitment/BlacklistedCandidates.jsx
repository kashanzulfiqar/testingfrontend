import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, Form, message, Empty } from 'antd';
import { SearchOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const BlacklistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchBlacklistedCandidates();
  }, []);

  const fetchBlacklistedCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        console.log('No token found');
        setCandidates([]);
        return;
      }

      const url = `candidate/list?status=BLACKLISTED&page=${page}&limit=${limit}`;
      console.log('Making API call to:', url);
      console.log('Request headers:', {
        Authorization: `Bearer ${token}`,
      });

      const response = await apiServices(
        'GET', 
        url, 
        null, 
        {
          access_token: {
            accessToken: token
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('API Response:', {
        status: response?.data?.status,
        message: response?.data?.message,
        data: response?.data?.data,
        pagination: response?.data?.pagination
      });
      
      if (response?.data?.status) {
        const blacklistedCandidates = response.data.data || [];
        console.log('Setting candidates:', blacklistedCandidates);
        setCandidates(blacklistedCandidates);
        setPagination({
          ...pagination,
          current: response.data.pagination?.page || 1,
          total: response.data.pagination?.total || 0,
          pageSize: limit
        });
      } else {
        console.log('No candidates found or error in response');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Failed to fetch blacklisted candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchBlacklistedCandidates(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (value) => {
    // Reset pagination when searching
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    // TODO: Implement search functionality
    console.log('Search value:', value);
  };

  const handleAddToBlacklist = async (values) => {
    try {
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      // Format the request body according to the API requirements
      const requestBody = {
        candidateName: values.name,
        email: values.email,
        blacklistReason: values.reason
      };

      const response = await apiServices(
        'POST', 
        'candidate/blacklist', 
        requestBody,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response?.data?.status) {
        message.success('Candidate added to blacklist successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchBlacklistedCandidates();
      } else {
        throw new Error(response?.data?.message || 'Failed to add candidate to blacklist');
      }
    } catch (error) {
      console.error('Error adding candidate to blacklist:', error);
      message.error(error.message || 'Failed to add candidate to blacklist');
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          {`${record.firstName} ${record.lastName}`}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Position',
      key: 'position',
      render: (_, record) => record.appliedFor?.title || 'N/A',
    },
    {
      title: 'Blacklist Reason',
      key: 'reason',
      render: (_, record) => record.blacklistReason || record.reason || 'N/A',
    },
    {
      title: 'Blacklisted Date',
      key: 'blacklistedDate',
      render: (_, record) => moment(record.updatedAt).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
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
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Table
          className="mt-4"
          columns={columns}
          dataSource={candidates}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={handleTableChange}
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
            <Input.TextArea 
              rows={4} 
              placeholder="Enter reason for blacklisting"
              maxLength={500}
              showCount
            />
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