import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Upload, Button, Row, Col, Alert, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import moment from 'moment';
import uploadIcon from '../../assets/iconsRecruitment/cloud.svg';
import FormItem from 'antd/es/form/FormItem';
import deleteIcon from '../../assets/iconsRecruitment/deleteIcon.svg';

const SendOfferModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading,
  candidate,
  existingOffer 
}) => {
  const [form] = Form.useForm();
  const [uploadedContract, setUploadedContract] = useState(null);
  const [fileInfo ,setFileinfo] = useState(null);

  // Set initial values when existing offer is present
  // useEffect(() => {
  //   if (existingOffer && visible) {
  //     form.setFieldsValue({
  //       salary: existingOffer.title,
  //       currency: existingOffer.currency,
  //       joiningDate: moment(existingOffer.joiningDate)
  //     });
  //   }
  // }, [existingOffer, visible, form]);

  // const handleCancel = () => {
  //   form.resetFields();
  //   setUploadedContract(null);
  //   onCancel();
  // };

    // const handleSubmit = async (values) => {
  //   const formData = new FormData();
    
  //   // Append form fields to FormData
  //   formData.append('candidateId', candidate._id);
  //   formData.append('salary', Number(values.salary)); // Convert to number
  //   formData.append('currency', values.currency);
  //   formData.append('joiningDate', values.joiningDate.format('YYYY-MM-DD'));
    
  //   // Only append contract if one is uploaded
  //   if (uploadedContract) {
  //     formData.append('contract', uploadedContract);
  //   } else if (existingOffer?.contract) {
  //     // If no new contract uploaded but existing offer has one, keep the existing contract
  //     formData.append('contract', existingOffer.contract);
  //   }

  //   onSubmit(formData);
  // };

  // const handleContractUpload = ({ file }) => {
  //   if (file.status === 'done' || file.status === 'uploading') {
  //     setUploadedContract(file.originFileObj);
  //   }
  // };

    // Validate file size and type
  // const beforeUpload = (file) => {
  //   const isValidType = [
  //     'application/pdf',
  //     'application/msword',
  //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  //   ].includes(file.type);
    
  //   if (!isValidType) {
  //     message.error('You can only upload PDF or Word documents!');
  //     return false;
  //   }

  //   const isLt5M = file.size / 1024 / 1024 < 5;
  //   if (!isLt5M) {
  //     message.error('File must be smaller than 5MB!');
  //     return false;
  //   }

  //   return false; 
  // };



  useEffect(() => {
    if (existingOffer && visible) {
      form.setFieldsValue({
        title: existingOffer.title,
        description: existingOffer.description,
      });
    }
  }, [existingOffer, visible, form]);

  const handleCancel = () => {
    form.resetFields();
    setUploadedContract(null);
    onCancel();
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    
    // Append form fields to FormData
    formData.append('candidateId', candidate._id);
    formData.append('title', values.title);
    formData.append('description', values.description);
    
    // Only append contract if one is uploaded
    if (uploadedContract) {
      formData.append('contract', uploadedContract);
    } else if (existingOffer?.contract) {
      // If no new contract uploaded but existing offer has one, keep the existing contract
      formData.append('contract', existingOffer.contract);
    }

    onSubmit(formData);
  };

  const handleContractUpload = ({ file }) => {
    if (file.status !== 'removed') {
      setUploadedContract(file.originFileObj);
      setFileinfo({name: file.name, size:(file.size/1024).toFixed(2)+'KB'})
    }
  };

  const beforeUpload = (file) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);
    
    if (!isValidType) {
      message.error('You can only upload PDF or Word documents!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }

    return false; 
  };

  return (
    <Modal
      title={existingOffer ? "Update Offer" : "Send Offer"}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="custom-modal"
    >
      {existingOffer && (
        <Alert
          message="Updating Existing Offer"
          description="You are updating an existing offer. The candidate will be notified of these changes and their status will be reset to 'OFFERED'."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="salary"
              label="Salary"
              rules={[
                { required: true, message: 'Please enter salary' },
                { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject('Salary must be greater than 0') }
              ]}
            >
              <Input type="number" placeholder="Enter salary amount" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true, message: 'Please select currency' }]}
              initialValue="PKR"
            >
              <Select>
                <Select.Option value="PKR">PKR</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
                <Select.Option value="EUR">EUR</Select.Option>
                <Select.Option value="GBP">GBP</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row> */}

        {/* <Form.Item
          name="joiningDate"
          label="Joining Date"
          rules={[{ required: true, message: 'Please select joining date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD-MM-YYYY"
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item> */}

        

        <div style={{height:"20px", width:"100%", display:"flex", justifyContent:"center", borderTop:"1px solid #E2E8F0"}}></div>
        <Form.Item
          name="title"
          label="Title"
          rules={[{required: true, message: 'Please enter the Title'}]}
        >
          <Input type="text" placeholder="Enter Title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{required: true, message: 'Please enter the Description'}]}
        >
          <Input.TextArea 
            placeholder="Enter Description"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="attachment"
          label={
            <span>
              Attachment
            </span>
          }
          // extra="Supported formats: PDF, DOC, DOCX. Max file size: 5MB"
        >
          <Upload.Dragger
            name="attachment"
            maxCount={1}
            accept=".pdf,.doc,.docx"
            onChange={handleContractUpload}
            beforeUpload={beforeUpload}
            showUploadList={false}
          >
            <div style={{display:"flex", justifyContent:"center" ,alignItems:"center"}}>
              <img src={uploadIcon} style={{height:"25px", width:"25px", marginRight:"10px"}}></img>
              <p>
                {existingOffer ? 'Upload new contract or keep existing' : 'Drag and Drop your Files'}
              </p>
            </div>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name='uploadedfiles' label='Uploaded files'>
            {fileInfo &&(
              <div className='pt-2 pb-2 ps-3 pe-3' style={{display:"flex", justifyContent:"space-between" ,alignItems:"center", background:"#cfd4d8", borderRadius:"8px"}}>
                <div style={{display:"flex" , flexDirection:'column'}}>
                  <span>{fileInfo.name}</span>
                  <span  style={{marginTop:"6px"}}>{fileInfo.size}</span>
                </div>
                <img src={deleteIcon} style={{height:'20px' ,width:"20px"}}></img>
              </div>
            )}
        </Form.Item>  

        <div className="text-end mt-4 pt-2 pb-4">
          <Button 
            onClick={handleCancel}
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
            style={{ 
              padding: '6px 24px',
              height: '40px',
              borderRadius: '20px',
              background: '#F4A261',
              border: 'none'
            }}
            onClick={()=>{handleSubmit}}
          >
            Send Offer
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

      `}</style>
    </Modal>
  );
};

export default SendOfferModal; 