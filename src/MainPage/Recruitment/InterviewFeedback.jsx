import React, { useState } from "react";
import { Modal, Form, Input, Rate, Row, Col, Button, Spin } from "antd";

const { TextArea } = Input;

const RECOMMENDATIONS = ["Strong Yes", "Yes", "No", "Strong No"];

const InterviewFeedback = ({ visible, onCancel, onSubmit, initialValues, title = "Add Feedback", loading = false }) => {
  const [form] = Form.useForm();
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Watch the form field value to keep visual state in sync
  const recommendationValue = Form.useWatch("recommendation", form);

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        description: initialValues.description,
        recommendation: initialValues.recommendation,
        technicalRating: initialValues.ratings?.technicalRating,
        behaviorRating: initialValues.ratings?.behaviorRating,
        softSkillRating: initialValues.ratings?.softSkillRating,
        leadershipRating: initialValues.ratings?.leadershipRating,
        teamworkRating: initialValues.ratings?.teamworkRating,
      });
      setSelectedRecommendation(initialValues.recommendation);
    } else if (visible && !initialValues) {
      form.resetFields();
      setSelectedRecommendation(null);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    // Structure the data according to API requirements
    
    const payload = {
      description: values.description,
      recommendation: values.recommendation,
      ratings: {
        technicalRating: values.technicalRating,
        behaviorRating: values.behaviorRating,
        softSkillRating: values.softSkillRating,
        leadershipRating: values.leadershipRating,
        teamworkRating: values.teamworkRating
      }
    };
    
    await onSubmit(payload);
    form.resetFields();
    setSelectedRecommendation(null);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setSelectedRecommendation(null);
      }}
      footer={null}
      width={450}
      className="custom-modal"
      style={{ zIndex: 2000 }}
      maskStyle={{ zIndex: 1999, background: "rgba(0, 0, 0, 0.5)" }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please provide feedback description" },
          ]}
        >
          <TextArea
            rows={5}
            placeholder="Enter Description"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <div style={{ background: "#f7f7f8", borderRadius: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e0e3e6",
              padding: "12px 12px 8px 12px",
              fontWeight: "450",
              color: "black",
            }}
          >
            <span>Rating</span>
            <div
              style={{
                display: "flex",
                gap: "23px",
                fontSize: "10px",
                fontWeight: "450",
                color: "#6f7d8a",
                paddingLeft: "5px",
                paddingRight: "5px",
              }}
            >
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
            </div>
          </div>
          <div style={{ padding: "6px 12px 12px 12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #eef0f1",
                alignItems: "center",
                height: "45px",
              }}
            >
              <label>Technical Skill:</label>
              <Form.Item
                name="technicalRating"
                rules={[
                  {
                    required: true,
                    message: "Please provide technical rating",
                  },
                ]}
                style={{ marginTop: "22px" }}
              >
                <Rate />
              </Form.Item>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #eef0f1",
                alignItems: "center",
                height: "45px",
              }}
            >
              <label>Behavior</label>
              <Form.Item
                name="behaviorRating"
                rules={[
                  {
                    required: true,
                    message: "Please provide a behavior rating",
                  },
                ]}
                style={{ marginTop: "22px" }}
              >
                <Rate />
              </Form.Item>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #eef0f1",
                alignItems: "center",
                height: "45px",
              }}
            >
              <label>Soft Skills</label>
              <Form.Item
                name="softSkillRating"
                rules={[
                  {
                    required: true,
                    message: "Please provide soft skill rating",
                  },
                ]}
                style={{ marginTop: "22px" }}
              >
                <Rate />
              </Form.Item>
            </div>

                         <div
               style={{
                 display: "flex",
                 justifyContent: "space-between",
                 borderBottom: "1px solid #eef0f1",
                 alignItems: "center",
                 height: "45px",
               }}
             >
               <label>Leadership Skills</label>
               <Form.Item
                 name="leadershipRating"
                 rules={[
                   {
                     required: true,
                     message: "Please provide leadership skill rating",
                   },
                 ]}
                 style={{ marginTop: "22px" }}
               >
                 <Rate />
               </Form.Item>
             </div>

             <div
               style={{
                 display: "flex",
                 justifyContent: "space-between",
                 borderBottom: "1px solid #eef0f1",
                 alignItems: "center",
                 height: "45px",
               }}
             >
               <label>Teamwork Skills</label>
               <Form.Item
                 name="teamworkRating"
                 rules={[
                   {
                     required: true,
                     message: "Please provide teamwork skill rating",
                   },
                 ]}
                 style={{ marginTop: "22px" }}
               >
                 <Rate />
               </Form.Item>
             </div>
          </div>
        </div>

        <Form.Item
          label="Recommendation"
          style={{ marginTop: "10px" }}
          required
          name="recommendation"
          rules={[
            { required: true, message: "Please select a recommendation" },
          ]}
        >
          <div
            style={{
              border: "1px solid transparent",
              background: "#f7f7f8",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {RECOMMENDATIONS.map((rec) => (
              <Button
                key={rec}
                type={recommendationValue === rec ? "primary" : "default"}
                onClick={() => {
                  setSelectedRecommendation(rec);
                  form.setFieldsValue({ recommendation: rec });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: recommendationValue === rec ? "#1890ff" : "black",
                }}
              >
                {rec}
              </Button>
            ))}
          </div>
        </Form.Item>

        <Form.Item
          style={{ display: "flex", justifyContent: "flex-end" }}
          className="pt-3 pb-3"
        >
          <Button
            onClick={() => {
              onCancel();
              form.resetFields();
              setSelectedRecommendation(null);
            }}
            style={{
              marginRight: "8px",
              borderRadius: "32px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#a5adb6",
              background: "#f7f7f8",
              border: "1px solid transparent",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              borderRadius: "32px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#white",
              background: "#ff9244",
              border: "1px solid transparent",
            }}
          >
            Submit Feedback
          </Button>
        </Form.Item>
      </Form>
      </Spin>

      <style jsx>{`
        .custom-modal .ant-modal-close {
          background-color: #f8f9fa;
          border-radius: 50%;
          border: "1px solid #F8F9FA";
          margin: 16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Z-index overrides to ensure modal appears above sidebar */
        .ant-modal,
        .ant-modal-wrap,
        .ant-modal-mask {
          z-index: 2000 !important;
        }

        /* Additional styles to prevent scrolling when modal is open */
        body.modal-open {
          overflow: hidden;
        }
      `}</style>
    </Modal>
  );
};

export default InterviewFeedback;
