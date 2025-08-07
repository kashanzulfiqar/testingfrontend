import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, TimePicker, message, Switch, Empty } from 'antd';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';
import onCloseIcon from '../../assets/iconsRecruitment/x.svg';
import { CloseOutlined } from '@ant-design/icons';

const CreateInterviewModal = ({ isVisible, onCancel, onSubmit, candidate, authState, editingInterview}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [interviewDate, setInterviewDate] = useState(null);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
      if (editingInterview) {
        console.log("E D I T I N G I N T E R V I E W", editingInterview);
        
        // Prefill form with existing interview data
        const interviewDate = moment(editingInterview.interviewDate);
        const interviewTime = moment(editingInterview.interviewTime, "HH:mm");
        
        form.setFieldsValue({
          candidateName: editingInterview.candidateName || candidate?.fullName,
          candidateEmail: editingInterview.candidateEmail || candidate?.email,
          interviewType: editingInterview.interviewType,
          assignTo: editingInterview.assignedTo?.map(emp => emp._id) || [editingInterview.interviewerId?._id],
          interviewTitle: editingInterview.interviewTitle,
          interviewDate: interviewDate,
          interviewTime: interviewTime,
          sendEmail: editingInterview.sendEmail !== undefined ? editingInterview.sendEmail : true,
          interviewNotes: editingInterview.interviewNotes,
          meetingLink: editingInterview.interviewLink || ""
        });
        
        setInterviewDate(interviewDate);
        setSelectedInterviewers(editingInterview.assignedTo?.map(emp => emp._id) || [editingInterview.interviewerId?._id]);
      } else {
        // Reset form for new interview
        form.resetFields();
        setSelectedInterviewers([]);
        setInterviewDate(null);
      }
    }
  }, [isVisible, editingInterview]);

  useEffect(() => {
    if (!isVisible) {
      setSelectedInterviewers([]);
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

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Call the parent's onSubmit function (handleInterviewSubmit)
      await onSubmit(values);
      
      // If we reach here, the submission was successful
      form.resetFields();
      onCancel();
    } catch (error) {
      // Error handling is done in the parent component (handleInterviewSubmit)
      console.error('Error in modal form submission:', error);
      // Don't close modal on error - let user see the error message and try again
    } finally {
      setLoading(false);
    }
  };

  const getDisabledHours = () => {
    if (!interviewDate) return [];
    const today = moment();
    if (interviewDate.isSame(today, 'day')) {
      // Disable all hours up to and including the current hour
      const currentHour = today.hour();
      return Array.from({ length: currentHour + 1 }, (_, i) => i);
    }
    return [];
  };

  return (
    <Modal
      title={editingInterview ? "Reschedule Interview" : "Add New Interview"}
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
        onFinish={handleFormSubmit}
        initialValues={{
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
            mode='multiple'
            placeholder="Select interviewer"
            showSearch
            optionFilterProp="children"
            getPopupContainer={() => document.getElementById('area')}
            value={selectedInterviewers}
            onChange={(value) => {
              if (value.length <= 5) {
                setSelectedInterviewers(value);
                form.setFieldsValue({ assignTo: value });
              }
            }}
          >
            {employees.map((emp) => (
              <Select.Option
                key={emp._id}
                value={emp._id}
                disabled={selectedInterviewers.length >= 5 && !selectedInterviewers.includes(emp._id)}
              >
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
              onChange={(date) => setInterviewDate(date)}
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
                minuteStep={5}
                className='custom-timepicker'
                disabledHours={getDisabledHours}
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