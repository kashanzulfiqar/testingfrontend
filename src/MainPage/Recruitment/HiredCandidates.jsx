import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, Form, message, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';

const HiredCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const authState = useSelector((state) => state.authentication);

  useEffect(() => {
    fetchHiredCandidates();
  }, []);

  const fetchHiredCandidates = async () => {
    try {
      setLoading(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        setCandidates([]);
        return;
      }

      const response = await apiServices('GET', 'candidates/hired', null, {
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
      console.error('Error fetching hired candidates:', error);
      // Silently handle error and show empty state
      setCandidates([]);
    } finally {
      setLoading(false);
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
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="green">OFFERED</Tag>
      ),
    }
  ];

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Offered Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Offered Candidates</li>
            </ul>
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
            emptyText: <Empty description="No offered candidates found" />
          }}
        />
      </Card>
    </div>
  );
};

export default HiredCandidates; 