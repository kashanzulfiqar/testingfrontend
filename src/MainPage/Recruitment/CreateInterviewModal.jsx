import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, Row, Col, Button, Empty, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';

// Interview title options
const INTERVIEW_TITLES = [
  { value: 'Initial Interview', label: 'Initial Interview' },
  { value: 'Technical Interview', label: 'Technical Interview' },
  { value: 'HR Interview', label: 'HR Interview' },
  { value: 'Live Coding Test', label: 'Live Coding Test' },
  { value: 'Final Interview', label: 'Final Interview' }
];

const CreateInterviewModal = ({ 
  isVisible, 
  onCancel, 
  onSubmit, 
  candidate,
  authState
}) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
      form.setFieldsValue({
        candidateName: `${candidate?.firstName} ${candidate?.lastName}`,
        candidateEmail: candidate?.email
      });
    }
  }, [isVisible, candidate]);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      return;
    }

    const roles = ["employee", "interviewer", "admin"];

    try {
      const response = await apiServices(
        "GET", 
        `user/all-employees?roles=${JSON.stringify(roles)}`, 
        null, 
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response?.data?.success === true) {
        const emps = response?.data?.data || [];
        const sortedData = emps
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(sortedData);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error(
        error?.response?.data?.message || 
        error?.message || 
        'Error getting employees'
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      handleCancel();
    } catch (error) {
      console.error('Error submitting interview:', error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '500',
          marginBottom: '20px'
        }}>
          Add New Interview
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={handleCancel}
            style={{ 
              position: 'absolute',
              right: 20,
              top: 20,
              color: '#333'
            }}
          />
        </div>
      }
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="interview-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Candidate Name <span style={{ color: 'red' }}>*</span></span>}
              name="candidateName"
              rules={[{ required: true, message: 'Please enter candidate name' }]}
            >
              <Input 
                placeholder="Enter Name" 
                disabled 
                style={{ backgroundColor: '#f9f9f9' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Candidate Email <span style={{ color: 'red' }}>*</span></span>}
              name="candidateEmail"
              rules={[{ required: true, message: 'Please enter candidate email' }]}
            >
              <Input 
                placeholder="Enter Email" 
                disabled
                style={{ backgroundColor: '#f9f9f9' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="interviewTitle"
              label="Interview Title"
              rules={[{ required: true, message: 'Please select interview title' }]}
            >
              <Select
                placeholder="Select Interview Title"
                options={INTERVIEW_TITLES}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Interview Type <span style={{ color: 'red' }}>*</span></span>}
              name="interviewType"
              rules={[{ required: true, message: 'Please select interview type' }]}
            >
              <Select placeholder="Select interview type">
                <Select.Option value="ONLINE">Online</Select.Option>
                <Select.Option value="IN_PERSON">In Person</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Interviewer <span style={{ color: 'red' }}>*</span></span>}
              name="assignedTo"
              rules={[{ required: true, message: 'Please assign interviewer' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children"
                notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                placeholder="Select interviewer"
                className="customselect-height custom-select"
              >
                {employees?.map((employee) => (
                  <Select.Option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Assign to <span style={{ color: 'red' }}>*</span></span>}
              name="assignTo"
              rules={[{ required: true, message: 'Please assign team members' }]}
            >
              <Select
                showSearch
                mode="multiple"
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children"
                notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                placeholder="Select team members"
                className="customselect-height custom-select"
              >
                {employees?.map((employee) => (
                  <Select.Option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Interview Date <span style={{ color: 'red' }}>*</span></span>}
              name="interviewDate"
              rules={[
                { required: true, message: 'Please select date' },
                {
                  validator: (_, value) => {
                    if (value && value.isBefore(moment().startOf('day'))) {
                      return Promise.reject('Interview date cannot be in the past');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Select Date"
                disabledDate={(current) => {
                  return current && current < moment().startOf('day');
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Interview Time <span style={{ color: 'red' }}>*</span></span>}
              name="interviewTime"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <TimePicker 
                style={{ width: '100%' }} 
                format="HH:mm"
                placeholder="Select Time"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span style={{ color: '#333' }}>Meeting Link</span>}
              name="meetingLink"
            >
              <Input placeholder="Enter meeting link" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Interview
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateInterviewModal; 