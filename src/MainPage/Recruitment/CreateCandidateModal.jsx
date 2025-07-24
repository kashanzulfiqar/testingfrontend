import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  message,
} from "antd";
import { apiServices } from "../../Services/apiServices";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";

const CreateCandidateModal = ({
  visible,
  onCancel,
  onSuccess,
  activeJobs = [],
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);

  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      let resumeData = null;
      if (
        Array.isArray(uploadResult) &&
        uploadResult.length > 0 &&
        uploadResult[0].imageUrl
      ) {
        resumeData = [
          {
            url: uploadResult[0].imageUrl,
            fileName: uploadResult[0].fileName,
            asset_id: uploadResult[0].asset_id,
            public_id: uploadResult[0].public_id,
            resource_type: uploadResult[0].resource_type,
            uploadedAt: new Date().toISOString(),
          },
        ];
      } else {
        console.error("Invalid upload result:", uploadResult);
        message.error("Failed to upload resume");
        setSubmitting(false);
        return;
      }
      const formattedValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        appliedFor: values.appliedFor,
        appliedDate: values.appliedDate.format("YYYY-MM-DD"),
        experience: values.experience,
        currentSalary: values.currentSalary,
        expectedSalary: values.expectedSalary,
        noticePeriod: values.noticePeriod,
        source: values.source,
        resume: resumeData,
        skillSet: values.skillSet,
      };
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;
      const response = await apiServices(
        "POST",
        "candidate/create",
        formattedValues,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        message.success("Candidate created successfully");
        form.resetFields();
        setFileList([]);
        onSuccess();
      } else {
        throw new Error(
          response?.data?.message || "Failed to create candidate"
        );
      }
    } catch (error) {
      console.error("Error in submission:", error);
      message.error(error.response.data.message || "Error creating candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
  };
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Add New Candidate"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="custom-modal"
      style={{ zIndex: 2000 }}
      maskStyle={{ zIndex: 1999, background: "rgba(0, 0, 0, 0.5)" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          appliedDate: moment(),
        }}
      >
        <div className="upload-resume mb-4">
          <p>
            If you have a resume, upload the resume first. We will automatically
            pickup all the details.
          </p>
          <Upload
            name="resume"
            maxCount={1}
            beforeUpload={async (file) => {
              // Validate file size (5MB)
              if (file.size > 5 * 1024 * 1024) {
                message.error("Resume file size should not exceed 5MB");
                return Upload.LIST_IGNORE;
              }

              // Validate file type
              const allowedTypes = ["application/pdf"];
              if (!allowedTypes.includes(file.type)) {
                message.error("Only PDF files are allowed");
                return Upload.LIST_IGNORE;
              }

              const result = await uploadFunction([file]);
              setUploadResult(result);
              if (result && result[0]) {
                const { candidateName, candidateEmail, candidateContact } =
                  result[0];

                // Split candidateName into first and last name (if possible)
                let firstName = "";
                let lastName = "";
                if (candidateName) {
                  const nameParts = candidateName.split(" ");
                  firstName = nameParts[0] || "";
                  lastName = nameParts.slice(1).join(" ") || "";
                }

                form.setFieldsValue({
                  firstName,
                  lastName,
                  email: candidateEmail || "",
                  phoneNumber: candidateContact || "",
                });
              }
              return false;
            }}
            onRemove={() => {
              setFileList([]);
              return true;
            }}
            fileList={fileList}
            onChange={({ fileList: newFileList }) => {
              setFileList(newFileList.slice(-1));
            }}
          >
            <Button className="resume-upload-btn">Upload Resume</Button>
          </Upload>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="firstName"
              label={<>First Name</>}
              rules={[
                { required: true, message: "Please enter first name" },
                { min: 2, message: "First name must be at least 2 characters" },
                { max: 50, message: "First name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s-]+$/,
                  message:
                    "First name can only contain letters, spaces and hyphens",
                },
              ]}
            >
              <Input placeholder="Enter Name" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="lastName"
              label={<>Last Name</>}
              rules={[
                { required: true, message: "Please enter last name" },
                { min: 2, message: "Last name must be at least 2 characters" },
                { max: 50, message: "Last name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s-]+$/,
                  message:
                    "Last name can only contain letters, spaces and hyphens",
                },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="email"
              label={<>Email</>}
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter Email" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="phoneNumber"
              label={<>Phone Number</>}
              rules={[
                { required: true, message: "Please enter phone number" },
                { min: 10, message: "Phone number must be at least 10 digits" },
                { max: 15, message: "Phone number cannot exceed 15 digits" },
                {
                  pattern: /^[0-9+\-\s()]+$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input placeholder="Enter Number" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="appliedFor"
              label={<>Applied For</>}
              rules={[
                { required: true, message: "Please select job position" },
              ]}
            >
              <Select
                className="customized"
                placeholder="Select Job Position"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                notFoundContent={
                  activeJobs.length === 0 ? "No active jobs available" : null
                }
              >
                {Array.isArray(activeJobs) &&
                  activeJobs.map((job) => (
                    <Select.Option key={job._id} value={job._id}>
                      {job.title} {job.department ? `- ${job.department}` : ""}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="appliedDate"
              label={<>Applied Date</>}
              rules={[
                { required: true, message: "Please select date" },
                {
                  validator: (_, value) => {
                    if (value && value.isAfter(moment())) {
                      return Promise.reject(
                        "Applied date cannot be in the future"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select Date"
                disabledDate={(date) => date.isAfter(moment())}
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          {/*  */}
          <div className="col-md-6">
            <Form.Item
              name="status"
              label={<>Application Status</>}
              rules={[{ required: true, message: "Select Status" }]}
            >
              <Select className="customized" placeholder="Select Status">
                <Select.Option value="OPEN">Open</Select.Option>
                <Select.Option value="ON_HOLD">On-Hold</Select.Option>
                <Select.Option value="FILLED">Filled</Select.Option>
                <Select.Option value="CANCELLED">Cancelled</Select.Option>
              </Select>
            </Form.Item>
          </div>
          {/*  */}
          <div className="col-md-6">
            <Form.Item
              name="experience"
              label={<>Experience (Years)</>}
              rules={[
                { required: true, message: "Please enter experience" },
                {
                  type: "number",
                  min: 0,
                  message: "Experience cannot be negative",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter Experience"
                min={0}
                precision={1}
              />
            </Form.Item>
          </div>
          {/* <div className="col-md-6">
            <Form.Item
              name="currentSalary"
              label={
                <>
                  Current Salary <span className="text-danger">*</span>
                </>
              }
              rules={[
                { required: true, message: "Please enter current salary" },
                {
                  type: "number",
                  min: 0,
                  message: "Salary cannot be negative",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter Current Salary"
                min={0}
              />
            </Form.Item>
          </div> */}
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="currentSalary"
              label={<>Current Salary</>}
              rules={[
                { required: true, message: "Please enter current salary" },
                {
                  type: "number",
                  min: 0,
                  message: "Salary cannot be negative",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter Current Salary"
                min={0}
              />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="expectedSalary"
              label={<>Expected Salary</>}
              rules={[
                { required: true, message: "Please enter expected salary" },
                {
                  type: "number",
                  min: 0,
                  message: "Salary cannot be negative",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter Expected Salary"
                min={0}
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="noticePeriod"
              label={<>Notice Period</>}
              rules={[
                { required: true, message: "Please select notice period" },
              ]}
            >
              <Select className="customized" placeholder="Select Notice Period">
                <Select.Option value="IMMEDIATE">Immediate</Select.Option>
                <Select.Option value="15_DAYS">15 Days</Select.Option>
                <Select.Option value="30_DAYS">30 Days</Select.Option>
                <Select.Option value="60_DAYS">60 Days</Select.Option>
                <Select.Option value="90_DAYS">90 Days</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="source"
              label={<>Source</>}
              rules={[{ required: true, message: "Please select source" }]}
            >
              <Select className="customized" placeholder="Select source">
                <Select.Option value="LINKEDIN">LinkedIn</Select.Option>
                <Select.Option value="WEBSITE">Website</Select.Option>
                <Select.Option value="REFERRAL">Referral</Select.Option>
                <Select.Option value="OTHER">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="skillSet"
              label={"Skill Set"}
              rules={[
                { required: true, message: "Please enter atleast one skill" },
              ]}
            >
              <Select
                mode="tags"
                className="custom-select customselect-height"
                placeholder="Enter Your Skills"
                getPopupContainer={() => document.getElementById("area22")}
                onChange={(value) => {
                  // Filter out tags longer than 20 characters
                  const filtered = value.filter((tag) => tag.length <= 20);
                  if (filtered.length < value.length) {
                    message.error("Each skill can be at most 20 characters.");
                  }
                  // Set only valid tags in the form
                  form.setFieldsValue({ skillSet: filtered });
                }}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="text-end mt-3">
          <Button
            onClick={handleReset}
            style={{
              marginRight: 12,
              padding: "6px 24px",
              height: "50px",
              borderRadius: "32px",
              background: "#F7F7F8",
              border: "none",
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{
              fontSize: "16px",
              padding: "6px 24px",
              height: "50px",
              borderRadius: "32px",
              background: "#FF9244",
              border: "none",
            }}
          >
            Add Candidate
          </Button>
        </Form.Item>
      </Form>

      <style jsx>{`
        .custom-modal .ant-modal-content {
          border: 1px solid transparent;
          border-radius: 10px;
        }
        .customselect-height > div {
          height: auto !important;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0px 24px;
          border-radius: 10px;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
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
        .custom-modal .ant-form-item-label > label {
          font-weight: 500;
        }
        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-picker,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }
        .custom-modal .ant-select-selection-placeholder,
        .custom-modal .ant-input::placeholder {
          color: #6c757d;
        }

        .customized .ant-select-selector {
          height: 56px !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }

        .custom .ant-select-selector {
          border-radius: 8px !important;
          display: flex;
          align-items: flex-start !important;
          flex-wrap: wrap !important;
          height: auto !important;
          padding: 4px 10px !important;
          overflow: hidden !important;
        }

        .custom .ant-select-selection-item {
          max-width: 100% !important;
          white-space: normal !important;
          word-break: break-word !important;
        }

        .upload-resume {
          padding: 16px;
          padding-left: 3px;
          border-top: 1px solid #eef0f1;
          border-bottom: 1px solid #eef0f1;
        }
        .upload-resume p {
          margin-bottom: 12px;
        }

        .resume-upload-btn {
          border: 1px solid #ff9244;
          border-radius: 40px;
          color: #ff9244;
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

export default CreateCandidateModal;
