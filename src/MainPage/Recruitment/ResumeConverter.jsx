// ✅ ResumeConverter.jsx — Full refactor with Ant Design Dragger + uploadFunction + full form

import React, { useState, useEffect } from "react";
import { Upload, Button, message, Modal, Spin, Collapse } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";
import { BASE_URL } from '../../config/apiConfig';
import { FileTextOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import axios from "axios";


const { Dragger } = Upload;
const { Panel } = Collapse;


export default function ResumeConverter() {
  // ----------------------------
  // State
  // ----------------------------
  const location = useLocation();
  const { parsedData: stateData, autoPreview } = location.state || {};
  const [parsedData, setParsedData] = useState(stateData || null);  
  const [fileList, setFileList] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);


  // ----------------------------
  // Resume History State
  // ----------------------------
  const [resumeHistory, setResumeHistory] = useState([]);

  //Resume History load
  // ----------------------------
// Auto-generate PDF preview if navigated from ResumeHistory
// ----------------------------
useEffect(() => {
  const autoGeneratePreview = async () => {
    if (autoPreview && stateData) {
      console.log("Auto preview triggered for:", stateData.full_name);
      setParsedData(stateData);
      setLoading(true);
      try {
        const blobRes = await axiosInstance.post(
          "resume/preview-from-json",
          { parsed: stateData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
          }
        );

        const blob = new Blob([blobRes.data], { type: "application/pdf" });
        const pdfBlobUrl = URL.createObjectURL(blob);
        setPdfUrl(pdfBlobUrl);
      } catch (err) {
        console.error("❌ Auto PDF preview failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  autoGeneratePreview();
}, [autoPreview, stateData]);


  
  // ----------------------------
  // Placeholder maps
  // ----------------------------
  const educationPlaceholders = {
    degree: "Enter Degree",
    institution: "Enter Institution",
    start_year: "Start Year",
    end_year: "End Year",
  };
  const experiencePlaceholders = {
    company: "Enter Company",
    title: "Enter Title",
    start_year: "Start Year",
    end_year: "End Year",
  };
  const projectPlaceholders = {
    project_name: "Enter Name of the Project",
    start_year: "Start Year",
    end_year: "End Year",
  };

  const authState = useSelector((state) => state.user.loginvalue);
  const token =
    localStorage.getItem("token") || authState?.access_token?.accessToken;
  const axiosInstance = axios.create({
      baseURL: BASE_URL
    });

  // ----------------------------
  // Upload Configuration (AntD)
  // ----------------------------
  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.doc,.docx",
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // prevent AntD auto upload
    },
    onRemove: () => {
      setFileList([]);
      setParsedData(null);
      setPdfUrl(null);
    },
    fileList,
    showUploadList: { showRemoveIcon: true },
  };
// ----------------------------
  // Fetch resumes from Mongo
  // ----------------------------
  const fetchHistory = async () => {
    try {
      const res = await apiServices("GET", "resumes");
      if (res?.data) setResumeHistory(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  // ----------------------------
  // Upload & Parse Resume
  // ----------------------------
  const handleUpload = async () => {
    if (!fileList || fileList.length === 0) {
      message.warning("Please select a resume file first.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      // Step 1️⃣: Upload to S3 (Cloudinary)
      const uploadedFiles = await uploadFunction(fileList, authState);
      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error("Upload failed or returned no data.");
      }
  
      const uploaded = uploadedFiles[0];
      const fileUrl = uploaded.imageUrl;
      console.log("File uploaded to S3:", fileUrl);
  
      // Step 2️⃣: Send the file URL to backend for parsing
      const res = await apiServices("POST", "resume/parse-url", { fileUrl });
      const parsed = res?.data?.parsed;
  
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsing failed — invalid response from server.");
      }
  
      // Step 3️⃣: Display parsed data + preview
      setParsedData(parsed);
      setPdfUrl(fileUrl);
      message.success("Resume uploaded and parsed successfully!");
    } catch (err) {
      console.error("❌ Upload or parse error:", err);
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          err.message ||
          "Upload failed"
      );
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // ----------------------------
  // JSON → PDF Preview (Save)
  // ----------------------------
// ----------------------------
// Generate PDF Preview
// ----------------------------
  const handleSave = async () => {
    if (!parsedData) return;
    setError(null);
    setLoading(true);

    try {
      console.log("🚀 Generating PDF preview:", parsedData);

      // 1️⃣ Confirm backend can generate PDF
      await apiServices(
        "POST",
        "resume/preview-from-json",
        { parsed: parsedData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 2️⃣ Fetch binary PDF
      const blobRes = await axiosInstance.post(
        "resume/preview-from-json",
        { parsed: parsedData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([blobRes.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      message.success("Preview updated successfully!");
    } catch (err) {
      console.error("❌ PDF Preview generation failed:", err);
      message.error("Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMongo = async () => {
    if (!parsedData) return message.warning("No parsed data to save.");
    setLoading(true);
  
    try {
      // ✅ Use the backend’s expected query param: ?name=
      const existingRes = await apiServices(
        "GET",
        `resumes?name=${encodeURIComponent(parsedData.full_name || "")}`
      );
    
      // existingRes.data can be an array OR a paginated object; handle both
      const list = Array.isArray(existingRes?.data)
        ? existingRes.data
        : Array.isArray(existingRes?.data?.docs)
        ? existingRes.data.docs
        : [];
    
      // normalize and check
      const target = (parsedData.full_name || "").trim().toLowerCase();
      const existing = list.find(
        (r) => (r?.full_name || "").trim().toLowerCase() === target
      );
    
      if (existing) {
        console.log("existing", existing);
        console.log("name", existing.full_name);
        message.info(
          `⚠️ A record for "${parsedData.full_name}" already exists. Skipping MongoDB save.`
        );
      } else {
        try {
          await apiServices("POST", "resumes", parsedData);
          message.success("✅ Resume saved to MongoDB!");
        } catch (err) {
          if (err.response?.status === 409) {
            message.info(err.response.data.message || "Duplicate record. Skipping save.");
          } else {
            message.error("❌ Failed to save resume.");
          }
        }
        
      }
    } catch (err) {
      console.error("❌ Duplicate check / save failed:", err);
      message.error("Failed to save or check existing resumes.");
    }
  
      // 3️⃣ Always download the PDF
      try {
        const blobRes = await axiosInstance.post(
          "resume/preview-from-json",
          { parsed: parsedData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
          }
        );
  
        const blob = new Blob([blobRes.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${parsedData.full_name || "resume"}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
  
        message.success("📄 PDF download started!");
      } catch (err) {
        console.error("❌ PDF generation failed:", err);
        message.error("Failed to generate or download PDF.");
      }
    
  };
  

  // ----------------------------
  // Helpers
  // ----------------------------
  const handleFieldChange = (field, value) => {
    setParsedData((prev) =>
      prev ? { ...prev, [field]: value } : { [field]: value }
    );
  };

  const addItem = (key, newItem, prepend = false) => {
    const updated = parsedData?.[key] ? [...parsedData[key]] : [];
    if (prepend) {
      updated.unshift(newItem); // insert at top
    } else {
      updated.push(newItem); // default: add to bottom
    }
    handleFieldChange(key, updated);
  };
  

  const removeItem = (key, index) => {
    const updated = [...(parsedData?.[key] || [])];
    updated.splice(index, 1);
    handleFieldChange(key, updated);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <>
      <div
        className="resume-converter-page"
        style={{ backgroundColor: "#fff", minHeight: "100vh" }}
      >
        <div className="p-4">
          {/* ----------------------------- PAGE HEADER ----------------------------- */}
          <div className="page-header mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h3 className="page-title mb-1">Resume Converter</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <a
                    href="/recruitment/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="breadcrumb-item active">Resume Converter</li>
              </ul>
            </div>
  
            {parsedData && (
              
              <Button
              type="primary"
              icon={<UploadOutlined style={{ color: "#fff" }} />}
              onClick={() => setIsUploadModalVisible(true)}
              className="upload-header-btn"
              style={{
                borderRadius: "30px",
                borderColor: "#FF9B44",
                backgroundColor: "#FF9B44",
              }}
            >
              <span style={{ color: "#fff" }}>Upload</span>
            </Button>
            )}
          </div>
  
          {/* ----------------------------- MAIN GRID ----------------------------- */}
          <div
            className="converter-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* ----------------------------- LEFT SECTION ----------------------------- */}
            <div className="left-section">
              <div className="card shadow-sm" style={{ height: "720px" }}>
                <div className="card-body" style={{ height: "100%", overflowY: "auto" }}>
                  {loading ? (
                    <>
                      {/* Loading Spinner */}
                      <div
                        className="d-flex flex-column align-items-center justify-content-center"
                        style={{
                          height: "400px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <Spin size="large" />
                        <p className="mt-3 mb-0" style={{ color: "#6c757d", fontSize: "16px" }}>
                          Uploading and parsing resume...
                        </p>
                        <p className="mt-1 mb-0" style={{ color: "#adb5bd", fontSize: "14px" }}>
                          Please wait while we process your file
                        </p>
                      </div>
                    </>
                  ) : !parsedData ? (
                    <>
                      {/* Upload Box */}
                      <div
                        className="upload-card border rounded mb-4"
                        style={{
                          backgroundColor: "#fff",
                          border: "1.5px dashed #d9d9d9",
                          textAlign: "center",
                          padding: "40px 20px",
                        }}
                      >
                        <Upload.Dragger
                          {...uploadProps}
                          style={{ background: "transparent" }}
                        >
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined
                              style={{ color: "#FF9B44", fontSize: 32 }}
                            />
                          </p>
                          <p
                            className="ant-upload-text"
                            style={{ fontSize: "16px", fontWeight: 500 }}
                          >
                            Drag & Drop or{" "}
                            <span style={{ color: "#FF9B44" }}>Choose file</span>{" "}
                            to upload
                          </p>
                          <p
                            className="ant-upload-hint text-muted mb-0"
                            style={{ fontSize: "13px" }}
                          >
                            Supported file types: <strong>PDF, DOC, DOCX</strong>
                          </p>
                        </Upload.Dragger>
  
                        <div className="mt-4">
                          <Button
                            type="primary"
                            onClick={handleUpload}
                            loading={loading}
                            disabled={fileList.length === 0}
                            block
                            style={{
                              backgroundColor: "#FFF1E5",
                              borderColor: "#FFF1E5",
                              height: 44,
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ color: "#FF9B44" }}>
                              Upload & Parse
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Error */}
                      {error && <div className="alert alert-danger">{error}</div>}
  
                      {/* Parsed Resume Form */}
                      <div
                        className="parsed-form border rounded p-3"
                        style={{
                          height: "calc(100% - 80px)",
                          overflowY: "auto",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {/* ---------- Candidate Info ---------- */}
                        <section>
                          <h5 className="mb-3" style={{ color: "#042F40" }}>
                            Candidate Details
                          </h5>
                          {["full_name", "title", "email", "phone", "location"].map(
                            (field) => (
                              <div className="form-group" key={field}>
                                <label className="form-label text-capitalize">
                                  {field.replace("_", " ")}
                                </label>
                                <input
                                  className="form-control"
                                  value={parsedData[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                />
                              </div>
                            )
                          )}
                          <div className="form-group">
                            <label className="form-label">Summary</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={parsedData.summary || ""}
                              onChange={(e) =>
                                handleFieldChange("summary", e.target.value)
                              }
                            />
                          </div>
                        </section>
  
                        {/* ----------------- Education ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <h5 style={{ color: "#042F40" }}>Education</h5>
                          {(parsedData.education || []).map((edu, i) => (
                            <div
                              key={i}
                              className="card p-3 mb-2"
                              style={{ backgroundColor: "#fff" }}
                            >
                              {[
                                "degree",
                                "institution",
                                "start_year",
                                "end_year",
                              ].map((field) => (
                                <input
                                  key={field}
                                  className="form-control mb-2"
                                  placeholder={educationPlaceholders[field] || field}
                                  value={edu[field] || ""}
                                  onChange={(e) => {
                                    const list = [...parsedData.education];
                                    list[i][field] = e.target.value;
                                    handleFieldChange("education", list);
                                  }}
                                />
                              ))}
                              <textarea
                                className="form-control mb-2"
                                placeholder="Enter Education Details"
                                value={edu.description || ""}
                                onChange={(e) => {
                                  const list = [...parsedData.education];
                                  list[i].description = e.target.value;
                                  handleFieldChange("education", list);
                                }}
                              />
                              <Button
                                danger
                                size="small"
                                onClick={() => removeItem("education", i)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            block
                            onClick={() =>
                              addItem("education", {
                                degree: "",
                                institution: "",
                                start_year: "",
                                end_year: "",
                                description: "",
                              })
                            }
                          >
                            + Add Education
                          </Button>
                        </section>
  
                        {/* ----------------- Experience ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <h5 style={{ color: "#042F40" }}>Experience</h5>
                          {(parsedData.experience || []).map((exp, i) => (
                            <div key={i} className="card p-3 mb-2 bg-white">
                              {[
                                "company",
                                "title",
                                "start_year",
                                "end_year",
                              ].map((field) => (
                                <input
                                  key={field}
                                  className="form-control mb-2"
                                  placeholder={experiencePlaceholders[field] || field}
                                  value={exp[field] || ""}
                                  onChange={(e) => {
                                    const list = [...parsedData.experience];
                                    list[i][field] = e.target.value;
                                    handleFieldChange("experience", list);
                                  }}
                                />
                              ))}
                              <textarea
                                className="form-control mb-2"
                                placeholder="Enter Experience Details"
                                value={(exp.description || []).join("\n")}
                                onChange={(e) => {
                                  const list = [...parsedData.experience];
                                  list[i].description = e.target.value
                                    .split("\n")
                                    .filter(Boolean);
                                  handleFieldChange("experience", list);
                                }}
                              />
                              <Button
                                danger
                                size="small"
                                onClick={() => removeItem("experience", i)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            block
                            onClick={() =>
                              addItem(
                                "experience",
                                {
                                  company: "",
                                  title: "",
                                  start_year: "",
                                  end_year: "",
                                  description: [""],
                                },
                                true // add to top
                              )
                            }
                          >
                            + Add Latest Experience
                          </Button>
                        </section>
  
                        {/* ----------------- Projects ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <h5 style={{ color: "#042F40" }}>Projects</h5>
                          {(parsedData.projects || []).map((proj, i) => (
                            <div key={i} className="card p-3 mb-2 bg-white">
                              {["project_name", "start_year", "end_year"].map(
                                (field) => (
                                  <input
                                    key={field}
                                    className="form-control mb-2"
                                    placeholder={projectPlaceholders[field] || field}
                                    value={proj[field] || ""}
                                    onChange={(e) => {
                                      const list = [...parsedData.projects];
                                      list[i][field] = e.target.value;
                                      handleFieldChange("projects", list);
                                    }}
                                  />
                                )
                              )}
                              <textarea
                                className="form-control mb-2"
                                placeholder="Enter Project Details"
                                value={(proj.description || []).join("\n")}
                                onChange={(e) => {
                                  const list = [...parsedData.projects];
                                  list[i].description = e.target.value
                                    .split("\n")
                                    .filter(Boolean);
                                  handleFieldChange("projects", list);
                                }}
                              />
                              <Button
                                danger
                                size="small"
                                onClick={() => removeItem("projects", i)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            block
                            onClick={() =>
                              addItem("projects", {
                                project_name: "",
                                start_year: "",
                                end_year: "",
                                description: [""],
                              })
                            }
                          >
                            + Add Project
                          </Button>
                        </section>
  
                        {/* ----------------- Skills ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <h5 style={{ color: "#042F40" }}>Technical Skills</h5>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={(parsedData.technical_skills || []).join(", ")}
                            onChange={(e) =>
                              handleFieldChange(
                                "technical_skills",
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        </section>
  
                        {/* ----------------- Certifications ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <Collapse
                            defaultActiveKey={[]}
                            expandIconPosition="end"
                            style={{ backgroundColor: "#fff", borderRadius: "8px" }}
                          >
                            <Panel
                              header={<h5 style={{ color: "#042F40", margin: 0 }}>Certifications</h5>}
                              key="1"
                            >
                              <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Enter certifications separated by commas"
                                value={(parsedData.certifications || []).join(", ")}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "certifications",
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </Panel>
                          </Collapse>
                        </section>
  
                        {/* ----------------- Languages ----------------- */}
                        <section style={{ marginTop: 24 }}>
                          <h5 style={{ color: "#042F40" }}>Languages</h5>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={(parsedData.languages || []).join(", ")}
                            onChange={(e) =>
                              handleFieldChange(
                                "languages",
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        </section>
                      </div>
                      {/* Buttons: PDF & Save */}
                      <div className="d-flex gap-2 mb-4 mt-4">
                        <Button
                          type="default"
                          onClick={handleSave}
                          disabled={!parsedData || loading}
                          loading={loading}
                          block
                        >
                          Update Preview  
                        </Button>
                        <Button
                          type="default"
                          onClick={handleSaveMongo}
                          disabled={!parsedData}
                          block
                        >
                          Export Resume
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
  
            {/* ----------------------------- RIGHT SECTION ----------------------------- */}
            <div className="right-section">
              <div className="card shadow-sm" style={{ height: "720px" }}>
                <div
                  className="card-header d-flex align-items-center"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "white",
                    borderColor: "white",
                    height: "60px",
                  }}
                >
                  <h5
                    className="card-title mb-0 d-flex align-items-center"
                    style={{ fontSize: "16px", gap: "8px" }}
                  >
                    <span
                      style={{
                        backgroundColor: "#FFF1E5",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileTextOutlined
                        style={{
                          color: "#FF9B44",
                          fontSize: "18px",
                          marginTop: "1px",
                        }}
                      />
                    </span>
                    <span>Resume Preview</span>
                  </h5>
                </div>
  
                <div
                  className="card-body d-flex align-items-center justify-content-center"
                  style={{
                    height: "calc(100% - 60px)",
                    background: "#FFFFFF",
                    padding: 0,
                  }}
                >
                  {pdfUrl ? (
                    <iframe
                      key={pdfUrl}
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      width="100%"
                      height="100%"
                      title="Resume Preview"
                      style={{
                        border: "none",
                        backgroundColor: "#FFF1E5",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <div
                        style={{
                          fontSize: "40px",
                          color: "#ccc",
                          marginBottom: "10px",
                        }}
                      >
                        <i className="fas fa-folder-open"></i>
                      </div>
                      <p style={{ color: "#777" }}>
                        Upload the resume to view the preview.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
  open={isUploadModalVisible}
  title={
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <UploadOutlined style={{ color: "#FF9B44", fontSize: 20 }} />
      <span style={{ fontWeight: 600 }}>Upload Resume</span>
    </div>
  }
  onCancel={() => setIsUploadModalVisible(false)}
  footer={null}
  centered
  width={520}
>
  <div
    className="upload-card border rounded"
    style={{
      backgroundColor: "#fff",
      border: "1.5px dashed #d9d9d9",
      textAlign: "center",
      padding: "40px 20px",
    }}
  >
    <Upload.Dragger
      {...uploadProps}
      style={{ background: "transparent" }}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined style={{ color: "#FF9B44", fontSize: 32 }} />
      </p>
      <p
        className="ant-upload-text"
        style={{ fontSize: "16px", fontWeight: 500 }}
      >
        Drag & Drop or{" "}
        <span style={{ color: "#FF9B44" }}>Choose file</span> to upload
      </p>
      <p
        className="ant-upload-hint text-muted mb-0"
        style={{ fontSize: "13px" }}
      >
        Supported file types: <strong>PDF</strong>
      </p>
    </Upload.Dragger>

    <div className="mt-4">
      <Button
        type="primary"
        onClick={() => {
          handleUpload();
          setIsUploadModalVisible(false);
        }}
        loading={loading}
        disabled={fileList.length === 0}
        block
        style={{
          backgroundColor: "#FFF1E5",
          borderColor: "#FFF1E5",
          height: 44,
          fontWeight: 500,
        }}
      >
        <span style={{ color: "#FF9B44" }}>Upload & Parse</span>
      </Button>
    </div>
  </div>
</Modal>

      <style jsx>{`
        .resume-converter-page .content.container-fluid {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .resume-converter-page .page-header {
          padding-left: 30px;
          padding-right: 30px;
        }
        .resume-converter-page {
          background-color: #fff;
        }
      `}</style>
    </>
    
  );
}  