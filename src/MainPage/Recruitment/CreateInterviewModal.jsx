import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, TimePicker, message, Switch } from 'antd';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';

const CreateInterviewModal = ({ isVisible, onCancel, candidate, authState }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
    }
  }, [isVisible]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
      const roles = ['employee', 'interviewer', 'admin'];

      const response = await apiServices(
        'GET',
        `user/all-employees?roles=${JSON.stringify(roles)}`,
        null,
        {
          access_token: { accessToken: token },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response?.data?.success) {
        const sortedData = response.data.data
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(sortedData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Format date and time for backend
      const formattedDate = moment(values.interviewDate).format('YYYY-MM-DD');
      const formattedTime = moment(values.interviewTime).format('HH:mm');

      // Prepare interview data
      const interviewData = {
        candidateId: candidate._id,
        interviewerId: values.assignedTo,
        interviewTitle: values.interviewTitle,
        interviewType: values.interviewType,
        assignTo: values.assignTo || [],
        interviewDate: formattedDate,
        interviewTime: formattedTime,
        meetingLink: values.meetingLink || '',
        shouldSendEmail: sendEmail // Flag for backend to handle email sending
      };

      // Create interview
      const response = await apiServices(
        'POST',
        'interview/create',
        interviewData,
        {
          access_token: { accessToken: authState?.access_token?.accessToken },
          headers: { Authorization: `Bearer ${authState?.access_token?.accessToken}` }
        }
      );

      if (response?.data?.success) {
        message.success(
          sendEmail 
            ? 'Interview scheduled and email notification sent'
            : 'Interview scheduled successfully'
        );
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to schedule interview');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Schedule Interview"
      visible={isVisible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          interviewDate: moment(),
          interviewTime: moment(),
          sendEmail: true
        }}
      >
        <Form.Item
          name="interviewTitle"
          label="Interview Title"
          rules={[{ required: true, message: 'Please select interview title' }]}
        >
          <Select placeholder="Select interview title">
            <Select.Option value="Initial Interview">Initial Interview</Select.Option>
            <Select.Option value="Technical Interview">Technical Interview</Select.Option>
            <Select.Option value="HR Interview">HR Interview</Select.Option>
            <Select.Option value="Final Interview">Final Interview</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="interviewType"
          label="Interview Type"
          rules={[{ required: true, message: 'Please select interview type' }]}
        >
          <Select placeholder="Select interview type">
            <Select.Option value="ONLINE">Online</Select.Option>
            <Select.Option value="IN_PERSON">In Person</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.interviewType !== currentValues.interviewType}
        >
          {({ getFieldValue }) =>
            getFieldValue('interviewType') === 'ONLINE' && (
              <Form.Item
                name="meetingLink"
                label="Meeting Link"
                rules={[
                  { required: true, message: 'Please enter meeting link' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="Enter meeting link (e.g., Zoom, Google Meet)" />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Primary Interviewer"
          rules={[{ required: true, message: 'Please select an interviewer' }]}
        >
          <Select
            placeholder="Select interviewer"
            showSearch
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignTo"
          label="Additional Interviewers"
        >
          <Select
            mode="multiple"
            placeholder="Select additional interviewers"
            showSearch
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="interviewDate"
          label="Interview Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="interviewTime"
          label="Interview Time"
          rules={[{ required: true, message: 'Please select time' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={15}
          />
        </Form.Item>

        <Form.Item 
          label="Send Email Notification" 
          tooltip="An email with interview details and meeting link will be sent to the candidate"
        >
          <Switch
            checked={sendEmail}
            onChange={setSendEmail}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </Form.Item>

        <Form.Item className="text-right mb-0">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Schedule Interview
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateInterviewModal; 