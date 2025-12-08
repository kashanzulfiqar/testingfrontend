import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, DatePicker, Upload, Button, Select, Empty, message, InputNumber, Spin } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed'
];

const CreateTaskModal = ({ isVisible, onCancel, onSubmit, candidate, authState, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploadingTaskFile, setUploadingTaskFile] = useState(false);
  const [uploadedTaskResult, setUploadedTaskResult] = useState(null);
  const [employees, setEmployees] = useState([]);
  const reviewersSelectRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
    }
  }, [isVisible]);

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
        console.log("response employee");
        const emps = response?.data?.User || [];
        console.log("emps", emps);
        const sortedData = emps
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        console.log("sortedData employee", sortedData);
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

  const handleReset = () => {
    form.resetFields();
  }; 

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error('File size should not exceed 10MB');
      return false;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      message.error('Only PDF, DOC, DOCX, and ZIP files are allowed');
      return false;
    }

    return true;
  };

  const handleFinish = (values) => {
    // Use uploaded URL if available; else fall back to raw file (shouldn't happen if upload succeeded)
    const uploaded = Array.isArray(uploadedTaskResult) ? uploadedTaskResult[0] : null;
    const uploadedUrl = uploaded?.imageUrl || null;
    const rawFile = fileList && fileList.length > 0 ? fileList[0].originFileObj : null;
    const submitValues = {
      ...values,
      taskFile: uploadedUrl || rawFile,
      // also pass through metadata so backend can store/display original info
      asset_id: uploaded?.asset_id,
      public_id: uploaded?.public_id,
      fileName: uploaded?.fileName,
    };
    onSubmit(submitValues); // Call the onSubmit function passed as a prop
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const handleReviewersFocus = () => {
    setTimeout(() => {
      const searchInput = reviewersSelectRef.current?.querySelector('.ant-select-selection-search-input');
      if (searchInput) {
        searchInput.setSelectionRange(0, 0);
        searchInput.focus();
      }
    }, 0);
  };

  const handleReviewersClick = () => {
    setTimeout(() => {
      const searchInput = reviewersSelectRef.current?.querySelector('.ant-select-selection-search-input');
      if (searchInput) {
        searchInput.setSelectionRange(0, 0);
        searchInput.focus();
      }
    }, 10);
  };

  return (
    <Modal
      title="Create a Task"
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="custom-modal"
      style={{ zIndex: 2000 }}
      maskStyle={{ zIndex: 1999, background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          candidateName: candidate ? `${candidate?.firstName} ${candidate?.lastName}` : '',
          candidateEmail: candidate ? candidate.email : '',
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
              <Input placeholder="Enter Name" />
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

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="taskName"
              label={<>Task Name</>}
              rules={[
                { required: true, message: 'Please enter task name' },
                { max: 25, message: 'Task name cannot exceed 25 characters' },
              ]}
              normalize={(value) => (typeof value === 'string' ? value.slice(0, 25) : value)}
            >
              <Input
                placeholder="Enter Task Name"
                maxLength={25}
                showCount
                onPaste={(e) => {
                  const pasted = (e.clipboardData || window.clipboardData).getData('text');
                  if (pasted && pasted.length > 25) {
                    e.preventDefault();
                    const truncated = pasted.slice(0, 25);
                    const current = (e.target.value || '').toString();
                    const selectionStart = e.target.selectionStart || current.length;
                    const selectionEnd = e.target.selectionEnd || current.length;
                    const nextValue = current.slice(0, selectionStart) + truncated + current.slice(selectionEnd);
                    // Use form to update field value with truncated paste
                    form.setFieldsValue({ taskName: nextValue.slice(0, 25) });
                  }
                }}
              />
            </Form.Item>
          </div>

          <div className="col-md-6">
            <Form.Item
            name="taskFile"
            label="Task File"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
            >
              <Upload
                maxCount={1}
                fileList={fileList}
                beforeUpload={async (file) => {
                  if (!validateFile(file)) {
                    return Upload.LIST_IGNORE;
                  }
                  setUploadingTaskFile(true);
                  try {
                    const result = await uploadFunction([file]);
                    setUploadedTaskResult(result);
                    // Replace any previous file with the new one visually
                    setFileList([{ uid: file.uid, name: file.name, status: 'done', originFileObj: file }]);
                    return false; // prevent AntD auto upload
                  } catch (err) {
                    message.error('Failed to upload file');
                    return Upload.LIST_IGNORE;
                  } finally {
                    setUploadingTaskFile(false);
                  }
                }}
                onChange={({ fileList: newList }) => {
                  // Always keep only the latest single file
                  const latest = newList.slice(-1);
                  setFileList(latest);
                }}
                showUploadList={false}
              >
                <div className="custom-upload">
                  <button type="button" className="upload-button" disabled={uploadingTaskFile}>
                    {uploadingTaskFile ? <Spin size="small" style={{ marginRight: 8 }} /> : null}
                    {uploadingTaskFile ? 'Uploading...' : 'Choose File'}
                  </button>
                  <input
                    type="text"
                    value={fileList[0]?.name || ""}
                    placeholder="No file choosen"
                    readOnly
                    className="file-input"
                  />
                </div>
              </Upload>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
          <div style={{ position: 'relative' }} id='area' ref={reviewersSelectRef} onClick={handleReviewersClick}>
            <Form.Item
              name="taskReviewers"
              label={<>Task Reviewer</>}
              rules={[{ required: true, message: 'Please select task reviewer' }]}
            >
              <Select
                getPopupContainer={() => document.getElementById('area')} 
                mode="multiple"
                showSearch
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children"
                notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                placeholder="Select Reviewer"
                className="customselect-height custom-select"
                onFocus={handleReviewersFocus}
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
            </div>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="lastDateOfSubmission"
              label={<>Last Date of Submission</>}
              rules={[{ required: true, message: 'Please select submission date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Select Date"
                format="DD-MM-YYYY"
                className='custom-datepicker'
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="taskDuration"
              label={<>Task Duration</>}
              rules={[
                { required: true, message: 'Please enter task duration' },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === '') {
                      return Promise.resolve();
                    }
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                      return Promise.reject(new Error('Please enter a valid number'));
                    }
                    if (!Number.isInteger(Number(value))) {
                      return Promise.reject(new Error('Duration must be a whole number'));
                    }
                    if (numValue < 1) {
                      return Promise.reject(new Error('Duration must be at least 1 day'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Number of Days"
                min={1}
                onKeyDown={(e) => {
                  // Allow: backspace, delete, tab, escape, enter, and navigation keys
                  if (
                    [8, 9, 27, 13, 46, 37, 39].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)
                  ) {
                    return;
                  }

                  // Allow only numbers
                  const allowedChars = /[0-9]/;
                  if (!allowedChars.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* <Form.Item
          name="interviewLink"
          label={<>Interview Link <span className="text-danger">*</span></>}
          rules={[{ required: true, message: 'Please enter interview link' }]}
        >
          <Input.TextArea 
            placeholder="Enter Description"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item> */}

        <div className="text-end mt-4 pt-2 pb-4">
          <Button 
            onClick={handleReset}
            style={{ 
              marginRight: '12px',
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
            disabled={loading}
            style={{ 
              padding: '6px 24px',
              height: '40px',
              borderRadius: '20px',
              background: '#F4A261',
              border: 'none'
            }}
          >
            Create Task
          </Button>
        </div>
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

        .customized .ant-select-selector{
        height: 56px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .custom-tag{
        height: 35px !important;
        display: flex;
        align-items: center;
        width: 110px !important;
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

        .custom-upload {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 5px;
          overflow: hidden;
          height: 55px;
          width: 364px;
        }

        .file-input {
          flex-grow: 1;
          padding: 8px;
          border: none;
          outline: none;
          background: white;
          height: 100%;
        }

        .upload-button {
          padding: 8px 12px;
          background: #f7f7f8;
          color: #a5adb6;
          border: none;
          cursor: pointer;
          height: 100%;
        }

        .ant-modal, 
        .ant-modal-wrap,
        .ant-modal-mask {
          z-index: 2000 !important;
        }
        
        body.modal-open {
          overflow: hidden;
        }

        /* Caret-at-start normalization for Task Reviewer select */
        .custom-select .ant-select-selection-search {
          width: 100% !important;
          position: relative !important;
        }
        .custom-select .ant-select-selection-search-input {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          min-width: 1px !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          caret-color: inherit !important;
        }
        .custom-select .ant-select-selection-search-mirror {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          visibility: hidden !important;
        }
        .custom-select .ant-select-selector {
          display: flex !important;
          align-items: center !important;
          flex-wrap: wrap !important;
        }
        .custom-select.ant-select-multiple .ant-select-selection-overflow {
          padding-left: 0 !important;
        }
        .custom-select.ant-select-multiple .ant-select-selection-overflow-item,
        .custom-select .ant-select-selection-overflow-item-suffix {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .custom-select.ant-select-multiple .ant-select-selection-search {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .custom-select .ant-select-selection-search-input:focus {
          text-align: left !important;
          text-indent: 0 !important;
        }

      `}</style>
    </Modal>
  );
};

export default CreateTaskModal; 