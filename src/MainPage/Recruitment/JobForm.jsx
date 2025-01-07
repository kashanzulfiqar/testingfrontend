import React from 'react';
import { Form, Input, Select, InputNumber, Button, Checkbox } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const JobForm = ({ 
  form, 
  initialValues, 
  onFinish, 
  onCancel, 
  loading, 
  isEdit = false 
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        positions: 1,
        postingPlatforms: ['WEBSITE'],
        status: 'ACTIVE',
        ...initialValues
      }}
    >
      <div className="row">
        <div className="col-md-6">
          <Form.Item
            name="department"
            label={<>Department <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Enter Department">
              <Select.Option value="Engineering">Engineering</Select.Option>
              <Select.Option value="Marketing">Marketing</Select.Option>
              <Select.Option value="Sales">Sales</Select.Option>
              <Select.Option value="HR">HR</Select.Option>
              <Select.Option value="Finance">Finance</Select.Option>
              <Select.Option value="Operations">Operations</Select.Option>
              <Select.Option value="Design">Design</Select.Option>
              <Select.Option value="Product">Product</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <div className="col-md-6">
          <Form.Item
            name="title"
            label={<>Job Title <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please enter job title' }]}
          >
            <Input placeholder="Enter Job" />
          </Form.Item>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Item
            name="jobType"
            label={<>Job Type <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please select job type' }]}
          >
            <Select placeholder="Full Time">
              <Select.Option value="FULL_TIME">Full Time</Select.Option>
              <Select.Option value="PART_TIME">Part Time</Select.Option>
              <Select.Option value="CONTRACT">Contract</Select.Option>
              <Select.Option value="INTERNSHIP">Internship</Select.Option>
              <Select.Option value="FREELANCE">Freelance</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <div className="col-md-6">
          <Form.Item
            name="workSetup"
            label={<>Work Setup <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please select work setup' }]}
          >
            <Select placeholder="On-site">
              <Select.Option value="ONSITE">On-site</Select.Option>
              <Select.Option value="REMOTE">Remote</Select.Option>
              <Select.Option value="HYBRID">Hybrid</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Item
            name="salaryRange"
            label={<>Salary Range <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please enter salary range' }]}
          >
            <Input placeholder="e.g. 10,000 - 20,000 USD" />
          </Form.Item>
        </div>
        <div className="col-md-6">
          <Form.Item
            name="positions"
            label={<>No of . Positions <span className="text-danger">*</span></>}
            rules={[
              { required: true, message: 'Please enter number of positions' },
              { type: 'number', min: 1, message: 'Must be at least 1 position' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
          </Form.Item>
        </div>
      </div>

      <Form.Item
        name="description"
        label={<>Job Description <span className="text-danger">*</span></>}
        rules={[{ required: true, message: 'Please enter job description' }]}
      >
        <TextArea rows={6} placeholder="Add Description" />
      </Form.Item>

      <Form.Item
        name="postingPlatforms"
        label="Post this Job on"
        initialValue={['WEBSITE']}
      >
        <Checkbox.Group>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Checkbox value="FACEBOOK">Facebook</Checkbox>
            <Checkbox value="LINKEDIN">LinkedIn</Checkbox>
            <Checkbox value="WEBSITE">Website</Checkbox>
          </div>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item className="text-end mt-3">
        <Button 
          onClick={onCancel} 
          style={{ 
            marginRight: 12,
            padding: '6px 24px',
            height: '40px',
            borderRadius: '20px',
            background: '#F8F9FA',
            border: 'none'
          }}
        >
          Reset
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          style={{ 
            padding: '6px 24px',
            height: '40px',
            borderRadius: '20px',
            background: '#F4A261',
            border: 'none'
          }}
        >
          {isEdit ? 'Update Job' : 'Create Job'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default JobForm; 