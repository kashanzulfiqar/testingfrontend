import React, { useState } from 'react';
import { Modal, Form, Input, Rate, Row, Col, Button } from 'antd';

const { TextArea } = Input;

const RECOMMENDATIONS = ['Strong Yes', 'Yes', 'No', 'Strong No'];

const InterviewFeedback = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const handleSubmit = async (values) => {
    await onSubmit({
      ...values,
      recommendation: selectedRecommendation
    });
    form.resetFields();
    setSelectedRecommendation(null);
  };

  return (
    <Modal
      title="Add Feedback"
      open={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setSelectedRecommendation(null);
      }}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea
            placeholder="Enter Description"
            autoSize={{ minRows: 4 }}
          />
        </Form.Item>

        <Form.Item label="Rating" required>
          <div className="rating-item">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Technical skills</span>
              <Form.Item
                name="technicalSkills1"
                className="mb-0"
                rules={[{ required: true, message: 'Please rate technical skills' }]}
              >
                <Rate />
              </Form.Item>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Behavior</span>
              <Form.Item
                name="behavior"
                className="mb-0"
                rules={[{ required: true, message: 'Please rate behavior' }]}
              >
                <Rate />
              </Form.Item>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Soft skills</span>
              <Form.Item
                name="softSkills"
                className="mb-0"
                rules={[{ required: true, message: 'Please rate soft skills' }]}
              >
                <Rate />
              </Form.Item>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Technical skills</span>
              <Form.Item
                name="technicalSkills2"
                className="mb-0"
                rules={[{ required: true, message: 'Please rate technical skills' }]}
              >
                <Rate />
              </Form.Item>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Technical skills</span>
              <Form.Item
                name="technicalSkills3"
                className="mb-0"
                rules={[{ required: true, message: 'Please rate technical skills' }]}
              >
                <Rate />
              </Form.Item>
            </div>
          </div>
        </Form.Item>

        <Form.Item
          label="Recommendation"
          required
          help={!selectedRecommendation && 'Please select a recommendation'}
          validateStatus={!selectedRecommendation ? 'error' : 'success'}
        >
          <Row gutter={16}>
            {RECOMMENDATIONS.map((rec) => (
              <Col span={6} key={rec}>
                <Button 
                  block
                  type={selectedRecommendation === rec ? 'primary' : 'default'}
                  onClick={() => setSelectedRecommendation(rec)}
                  style={selectedRecommendation === rec ? { background: '#FF9B44', borderColor: '#FF9B44' } : {}}
                >
                  {rec}
                </Button>
              </Col>
            ))}
          </Row>
        </Form.Item>

        <div className="d-flex justify-content-end gap-2">
          <Button onClick={() => {
            onCancel();
            form.resetFields();
            setSelectedRecommendation(null);
          }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ background: '#FF9B44', borderColor: '#FF9B44' }}
            disabled={!selectedRecommendation}
          >
            Submit Feedback
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .rating-item .ant-form-item {
          margin-bottom: 0;
        }
        .rating-item .ant-rate {
          font-size: 16px;
        }
      `}</style>
    </Modal>
  );
};

export default InterviewFeedback; 