import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  message,
  Select,
  DatePicker,
  Upload,
  InputNumber,
} from "antd";
import { LeftOutlined, UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import moment from "moment";
import backBtn from "../../assets/iconsRecruitment/arrow-left.svg";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";

const EditCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchCandidateDetails();
    fetchActiveJobs();
  }, [id]);

  const fetchCandidateDetails = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices("GET", `candidate/${id}`, null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.status) {
        const candidate = response.data.data;
        const formattedCandidate = {
          ...candidate,
          appliedFor: candidate.appliedFor?._id || candidate.appliedFor,
          appliedDate: moment(candidate.appliedDate),
        };
        form.setFieldsValue(formattedCandidate);
      } else {
        if (response?.data?.message === "Invalid token") {
          message.error("Session expired. Please login again");
          navigate("/login");
        } else if (response?.data?.message === "Candidate not found") {
          message.error("Candidate not found");
          navigate("/recruitment/candidates");
        } else {
          message.error(
            response?.data?.message || "Failed to fetch candidate details"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again");
        navigate("/login");
      } else if (error.response?.status === 404) {
        message.error("Candidate not found");
        navigate("/recruitment/candidates");
      } else {
        message.error("Error fetching candidate details");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) return;

    try {
      const response = await apiServices("GET", "job/active", null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Active Jobs API Response:", response);

      if (response?.data?.status) {
        // Access the docs array from the response data
        const jobs = response.data.data.docs || [];
        console.log("Jobs data before setting:", jobs);

        if (Array.isArray(jobs)) {
          setActiveJobs(jobs);
          console.log("Active jobs set successfully:", jobs.length, "jobs");
        } else {
          console.error("Jobs data is not an array:", jobs);
          setActiveJobs([]);
        }
      } else {
        console.error("Failed to fetch active jobs:", response?.data);
        setActiveJobs([]);
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      setActiveJobs([]);
    }
  };

  const handleSubmit = async (values) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      let resumeData = null;

      if (uploadResult !== null) {
        console.log("N O T  N U L L  R E S U M E");

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
          console.log("Resume uploaded successfully:", resumeData);
        } else {
          console.error("Invalid upload result:", uploadResult);
          message.error("Failed to upload resume");
          setSubmitting(false);
          return;
        }
      }
      // Step 2: Create candidate with resume data
      console.log("Step 2: Creating candidate with resume data:", resumeData);
      const formattedValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        appliedFor: values.appliedFor,
        appliedDate: values.appliedDate.format("YYYY-MM-DD"),
        status: values.status,
        experience: values.experience,
        currentSalary:
          typeof values.currentSalary === "string"
            ? Number(values.currentSalary.replace(/,/g, ""))
            : values.currentSalary,
        expectedSalary:
          typeof values.expectedSalary === "string"
            ? Number(values.expectedSalary.replace(/,/g, ""))
            : values.expectedSalary,
        noticePeriod: values.noticePeriod,
        source: values.source,
        resume: resumeData,
        skillSet: values.skillSet,
      };

      console.log("Creating candidate with payload:", formattedValues);

      const response = await apiServices(
        "PUT",
        `candidate/${id}`,
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
        message.success("Candidate updated successfully");
        navigate(`/recruitment/candidates/${id}`);
        setFileList([]);
      } else {
        // Handle specific error cases
        if (response?.data?.message === "Email already exists") {
          message.error("A candidate with this email already exists");
        } else if (response?.data?.errors) {
          // Display validation errors
          const errors = response.data.errors;
          const errorMessages = Object.values(errors).join(", ");
          message.error(`Validation failed: ${errorMessages}`);
        } else {
          message.error(
            response?.data?.message || "Failed to update candidate"
          );
        }
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again");
        navigate("/login");
      } else if (error.response?.status === 409) {
        message.error("A candidate with this email already exists");
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.message || "Invalid input data");
      } else {
        message.error("Error updating candidate. Please try again");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Edit Candidate</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/recruitment/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/recruitment/candidates">Candidates</Link>
                </li>
                <li className="breadcrumb-item active">Edit Candidate</li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Edit Candidate</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/recruitment/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/recruitment/candidates">Candidates</Link>
              </li>
              <li className="breadcrumb-item active">Edit</li>
            </ul>
            {/* <div style={{height:'20px' , width:"20px"}} onClick={()=>{navigate(`/recruitment/candidates/${id}`)}}>
              <img src={backBtn} style={{height:"100%" ,width:"100%"}}></img>
            </div> */}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <div className="upload-resume mb-4">
                <p>
                  If you have a resume, upload the resume first. We will
                  automatically pickup all the details.
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
                      console.log("::RESULTS::", result);
                      const {
                        candidateName,
                        candidateEmail,
                        candidateContact,
                      } = result[0];

                      // Split candidateName into first and last name (if possible)
                      let firstName = "";
                      let lastName = "";
                      if (candidateName) {
                        const nameParts = candidateName.split(" ");
                        firstName = nameParts[0] || "";
                        lastName = nameParts.slice(1).join(" ") || "";
                      }
                      console.log(
                        "::TS::",
                        firstName,
                        lastName,
                        candidateEmail,
                        candidateContact
                      );
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
                    label={
                      <>
                        First Name <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please enter first name" },
                      {
                        min: 2,
                        message: "First name must be at least 2 characters",
                      },
                      {
                        max: 50,
                        message: "First name cannot exceed 50 characters",
                      },
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
                    label={
                      <>
                        Last Name <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please enter last name" },
                      {
                        min: 2,
                        message: "Last name must be at least 2 characters",
                      },
                      {
                        max: 50,
                        message: "Last name cannot exceed 50 characters",
                      },
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
                    label={
                      <>
                        Email <span className="text-danger">*</span>
                      </>
                    }
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
                    label={
                      <>
                        Phone Number <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please enter phone number" },
                      {
                        min: 10,
                        message: "Phone number must be at least 10 digits",
                      },
                      {
                        max: 15,
                        message: "Phone number cannot exceed 15 digits",
                      },
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
                    label={
                      <>
                        Applied For <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please enter position" },
                    ]}
                  >
                    <Select
                      className="customized"
                      placeholder="Select Job Position"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={
                        activeJobs.length === 0
                          ? "No active jobs available"
                          : null
                      }
                    >
                      {Array.isArray(activeJobs) &&
                        activeJobs.map((job) => (
                          <Select.Option key={job._id} value={job._id}>
                            {job.title}{" "}
                            {job.department ? `- ${job.department}` : ""}
                          </Select.Option>
                        ))}
                    </Select>
                    {/* <Input placeholder="Enter Position" /> */}
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="appliedDate"
                    label={
                      <>
                        Applied Date <span className="text-danger">*</span>
                      </>
                    }
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
                <div className="col-md-6">
                  <Form.Item
                    name="status"
                    label={
                      <>
                        Application Status{" "}
                        <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please select status" },
                    ]}
                  >
                    <Select className="customized" placeholder="Select Status">
                      <Select.Option value="NEW">New</Select.Option>
                      <Select.Option value="SCREENING">Screening</Select.Option>
                      <Select.Option value="SHORTLISTED">
                        Shortlisted
                      </Select.Option>
                      <Select.Option value="REJECTED">Rejected</Select.Option>
                      <Select.Option value="HIRED">Hired</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="experience"
                    label={
                      <>
                        Experience <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please enter experience" },
                      {
                        type: "number",
                        transform: (value) => Number(value),
                        message: "Please enter a valid number",
                      },
                      {
                        validator: (_, value) => {
                          const numValue = Number(value);
                          if (isNaN(numValue) || numValue < 0) {
                            return Promise.reject(
                              "Experience cannot be negative"
                            );
                          }
                          if (numValue > 50) {
                            return Promise.reject(
                              "Experience cannot exceed 50 years"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter years of experience"
                      step={0.5}
                      min={0}
                      max={50}
                      precision={1}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="currentSalary"
                    label={
                      <>
                        Current Salary <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter current salary",
                      },
                      {
                        type: "number",
                        transform: (value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          )
                            return null;
                          const num = Number(value);
                          return isNaN(num) ? null : num;
                        },
                        message: "Please enter a valid number",
                      },
                      {
                        validator: (_, value) => {
                          if (value === null || value === undefined)
                            return Promise.resolve();
                          const num = Number(value);
                          if (num < 0) {
                            return Promise.reject("Salary cannot be negative");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="e.g. 20000"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="expectedSalary"
                    label={
                      <>
                        Expected Salary <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter expected salary",
                      },
                      {
                        type: "number",
                        transform: (value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          )
                            return null;
                          const num = Number(value);
                          return isNaN(num) ? null : num;
                        },
                        message: "Please enter a valid number",
                      },
                      {
                        validator: (_, value) => {
                          if (value === null || value === undefined)
                            return Promise.resolve();
                          const num = Number(value);
                          if (num < 0) {
                            return Promise.reject("Salary cannot be negative");
                          }
                          const currentSalary =
                            form.getFieldValue("currentSalary");
                          if (
                            currentSalary !== null &&
                            currentSalary !== undefined
                          ) {
                            const currentNum = Number(currentSalary);
                            if (num < currentNum) {
                              return Promise.reject(
                                "Expected salary must be greater than or equal to current salary"
                              );
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="e.g. 30000"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="noticePeriod"
                    label={
                      <>
                        Notice Period <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select notice period",
                      },
                    ]}
                  >
                    <Select
                      className="customized"
                      placeholder="Select Notice Period"
                    >
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
                    label={
                      <>
                        Source <span className="text-danger">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: "Please select source" },
                    ]}
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

              <Form.Item className="text-end mt-3">
                <Button
                  onClick={() => navigate(`/recruitment/candidates/${id}`)}
                  style={{
                    marginRight: 12,
                    padding: "6px 24px",
                    height: "40px",
                    borderRadius: "20px",
                    background: "#F8F9FA",
                    border: "none",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  style={{
                    padding: "6px 24px",
                    height: "40px",
                    borderRadius: "20px",
                    background: "#F4A261",
                    border: "none",
                  }}
                >
                  Update Candidate
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .ant-form-item-label > label {
          font-weight: 500;
        }
        .ant-input,
        .ant-picker,
        .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }

        .ant-select-selection-placeholder,
        .ant-input::placeholder {
          color: #6c757d;
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

        .ant-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .customized .ant-select-selector {
          height: 56px !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default EditCandidate;
