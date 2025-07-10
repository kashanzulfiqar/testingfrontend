import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, TimePicker, message, Switch, Empty } from 'antd';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';
import onCloseIcon from '../../assets/iconsRecruitment/x.svg';
import { CloseOutlined } from '@ant-design/icons';

const CreateInterviewModal = ({ isVisible, onCancel, candidate, authState, interview }) => {
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
        const sortedData = response.data.User
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(sortedData);
        console.log("sorted data od all employees", employees)
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    }
  };

  const onReset = () => {
    form.resetFields();
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
        candidateName: values?.candidateName,
        // interviewerId: values?.assignedTo,
        interviewTitle: values?.interviewTitle,
        interviewType: values?.interviewType,
        assignTo: values.assignTo,
        interviewDate: formattedDate,
        interviewTime: formattedTime,
        meetingLink: values.meetingLink || '',
        shouldSendEmail: sendEmail // Flag for backend to handle email sending
      };

      console.log('interview' , interviewData);
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
      title="Add New Interview"
      visible={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="custom-modal"
      style={{ zIndex: 2000 }}
      maskStyle={{ zIndex: 1999, background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          interviewDate: moment(),
          interviewTime: moment(),
          sendEmail: true,
          candidateName: `${candidate?.firstName} ${candidate?.lastName}`,
          candidateEmail: candidate.email,
        }}
      >
        <div className="row">
        <div style={{height:"20px", width:"100%", display:"flex", justifyContent:"center", borderTop:"1px solid #E2E8F0"}}></div>
          <div className="col-md-6">
          <Form.Item
              name="candidateName"
              label={<>Candidate Name</>}
              rules={[{ required: true, message: 'Please enter candidate name' }]}
            >
              <Input placeholder="Enter Name"  />
            </Form.Item>
          </div>
          <div className="col-md-6">
          <Form.Item
              name="candidateEmail"
              label={<>Candidate Email</>}
              rules={[{ required: true, message: 'Please enter candidate email' }]}
            >
              <Input placeholder="Enter Email"/>
            </Form.Item>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
          <div style={{ position: 'relative' }} id='area'>
            <Form.Item
            name="interviewType"
            label="Interview Type"
            rules={[{ required: true, message: 'Please select interview type' }]}
            >
            <Select placeholder="Select interview type" getPopupContainer={() => document.getElementById('area')} className='customized'>
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="IN_PERSON">In Person</Select.Option>
            </Select>
            </Form.Item>
            </div>
          </div>
          <div className="col-md-6">
          <div style={{ position: 'relative' }} id='area'>
        <Form.Item
          name="assignTo"
          label="Primary Interviewer"
          rules={[{ required: true, message: 'Please select an interviewer' }]}
        >
          <Select
            className='customselect-height'
            mode= 'multiple'
            placeholder="Select interviewer"
            showSearch
            optionFilterProp="children"
            getPopupContainer={() => document.getElementById('area')}
          >
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        </div>
          </div>
        </div>

        <div className='row'>
          <div class='col-md-6'>
          <div style={{ position: 'relative' }} id='area'>
            <Form.Item
            name="interviewTitle"
            label="Interview Title"
            rules={[{ required: true, message: 'Please select interview title' }]}
            >
              <Select placeholder="Select interview title" getPopupContainer={() => document.getElementById('area')} className='customized'>
                <Select.Option value="Initial Interview">Initial Interview</Select.Option>
                <Select.Option value="Technical Interview">Technical Interview</Select.Option>
                <Select.Option value="HR Interview">HR Interview</Select.Option>
                <Select.Option value="Final Interview">Final Interview</Select.Option>
              </Select>
            </Form.Item>
            </div>  
          </div> 
          <div className='col-md-6'>
            <Form.Item
            name="interviewDate"
            label="Interview Date"
            rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
              className='custom-datepicker'
              />
            </Form.Item>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <Form.Item
              name="interviewTime"
              label="Interview Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                minuteStep={15}
                className='custom-timepicker'
              />
            </Form.Item>
          </div>
          <div className='col-md-6'>
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
                    <Input placeholder="Enter meeting link" />
                  </Form.Item>
                )
              }
            </Form.Item>
          </div>
        </div>

        {/* <Form.Item className="text-right mb-0">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Schedule Interview
          </Button>
        </Form.Item>  */}
        <Form.Item className="text-end mt-3" style={{backgroundColor:'transparent', height:"70px"}}>
            <Button 
              onClick={onReset} 
              style={{ 
                marginRight: '12px',
                padding: '6px 24px',
                height: '40px',
                borderRadius: '40px',
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
                borderRadius: '40px',
                background: '#ff9244',
                border: 'none',
                color:"white"
              }}
            >
              Schedule Interview
            </Button>
          </Form.Item>
        {/* <Form.Item
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
        </Form.Item>*/}
      </Form>
      <style jsx>{`
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-modal-close {
          background-color: #F8F9FA;
          border-radius: 50%;
          border:"1px solid #F8F9FA";
          margin:16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }
        .custom-timepicker, .custom-datepicker{
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }

        // .search-form {
        //   background: transparent;
        //   margin-bottom: 16px;
        // }

        // .search-btn {
        //   background: #1f1f1f;
        //   border: 1px solid #1f1f1f;
        //   height: 40px;
        //   border-radius: 8px;
        //   width: 80% !important;
        //   font-weight: 500;
        //   font-size: 16px;
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   justify-self: end;
        // }
        // .search-btn:hover {
        //   background: #333 !important;
        //   border: none
        // }

        .customized .ant-select-selector{
        height: 56px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
        }
        
        .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
        }

        
        .ant-modal, 
        .ant-modal-wrap,
        .ant-modal-mask {
          z-index: 2000 !important;
        }
        
        body.modal-open {
          overflow: hidden;
        }


        
  
      `}</style>
    </Modal>
  );
};

export default CreateInterviewModal; 