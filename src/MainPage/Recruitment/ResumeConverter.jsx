// ✅ ResumeConverter.jsx — Full refactor with Ant Design Dragger + uploadFunction + full form

import React, { useState, useEffect } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";
import { BASE_URL } from '../../config/apiConfig';
import axios from "axios";


const { Dragger } = Upload;

export default function ResumeConverter() {
  // ----------------------------
  // State
  // ----------------------------
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false); 
    // ----------------------------
  // Local Backup System
  // ----------------------------
  const [resumeHistory, setResumeHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("resumeHistory");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = (resume) => {
    if (!resume?.full_name) return;

    const newEntry = {
      id: Date.now(),
      name: resume.full_name,
      data: resume,
      fileUrl: pdfUrl,
      savedAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...resumeHistory].slice(0, 20);
    setResumeHistory(updated);
    localStorage.setItem("resumeHistory", JSON.stringify(updated));
    message.success(`Saved ${resume.full_name} to history.`);
  };

  const deleteFromHistory = (id) => {
    const updated = resumeHistory.filter((r) => r.id !== id);
    setResumeHistory(updated);
    localStorage.setItem("resumeHistory", JSON.stringify(updated));
    message.success("Deleted resume from history.");
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

  // ----------------------------
  // Save Resume Locally
  // ----------------------------
  const handleSaveLocal = () => {
    if (!parsedData) {
      message.warning("No parsed data to save.");
      return;
    }

    saveToHistory(parsedData);
    message.success("Resume saved locally!");
  };
    // ----------------------------
  // Save Resume to MongoDB
  // ----------------------------
  const handleSaveMongo = async () => {
    if (!parsedData) return message.warning("No parsed data to save.");
    setLoading(true);
    try {
      await apiServices("POST", "resumes", parsedData);
      message.success("Resume saved to MongoDB!");
      fetchHistory();
    } catch (err) {
      console.error("❌ Failed to save resume:", err);
      message.error("Failed to save resume.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Delete from Mongo
  // ----------------------------
  const deleteResume = async (id) => {
    try {
      await apiServices("DELETE", `resumes/${id}`);
      message.success("Deleted resume from MongoDB.");
      fetchHistory();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      message.error("Failed to delete resume.");
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
    <><div className="resume-converter-page" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <div className="p-4">
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

      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setShowUploader(true)}
        className="upload-header-btn"
      >
        Upload 
      </Button>
    </div>

  
        <div className="row" style={{ margin: 0 }}>
          {/* LEFT COLUMN */}
          <div className="col-xl-7 col-lg-7" style={{ paddingRight: "1rem" }}>
            <div className="card">
              <div className="card-body">
                {/* Upload Section */}
                <div className="card mb-4" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="card-body">
                    <h6 className="card-title mb-3" style={{ color: "#042F40" }}>
                      📄 Resume Upload & Processing
                    </h6>
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ color: "#042F40" }} />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag resume file to this area
                      </p>
                      <p className="ant-upload-hint text-muted">
                        Supports single PDF or DOC/DOCX resume files.
                      </p>
                    </Dragger>
  
                    <div className="d-grid gap-2 mt-3">
                      <Button
                        type="primary"
                        onClick={handleUpload}
                        loading={loading}
                        disabled={fileList.length === 0}
                        block
                      >
                        📤 Upload & Parse Resume
                      </Button>
  
                      <div className="d-flex gap-2 mt-2">
                        <Button
                          type="primary"
                          onClick={handleSave}
                          disabled={!parsedData || loading}
                          loading={loading}
                          style={{ flex: 1 }}
                        >
                          🖨️ Generate PDF Preview
                        </Button>
  
                        <Button
                          type="default"
                          onClick={handleSaveMongo}
                          disabled={!parsedData}
                          style={{ flex: 1 }}
                        >
                          💾 Save Resume Locally
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Parsed Resume Form */}
                {parsedData ? (
                  <div
                    className="border rounded p-3"
                    style={{
                      maxHeight: "70vh",
                      overflowY: "auto",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {/* ----------------- Basic Info ----------------- */}
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
                              onChange={(e) => handleFieldChange(field, e.target.value)} />
                          </div>
                        )
                      )}
                      <div className="form-group">
                        <label className="form-label">Summary</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={parsedData.summary || ""}
                          onChange={(e) => handleFieldChange("summary", e.target.value)} />
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
                          {["degree", "institution", "start_year", "end_year"].map(
                            (field) => (
                              <input
                                key={field}
                                className="form-control mb-2"
                                placeholder={field}
                                value={edu[field] || ""}
                                onChange={(e) => {
                                  const list = [...parsedData.education];
                                  list[i][field] = e.target.value;
                                  handleFieldChange("education", list);
                                } } />
                            )
                          )}
                          <textarea
                            className="form-control mb-2"
                            placeholder="description"
                            value={edu.description || ""}
                            onChange={(e) => {
                              const list = [...parsedData.education];
                              list[i].description = e.target.value;
                              handleFieldChange("education", list);
                            } } />
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
                        onClick={() => addItem("education", {
                          degree: "",
                          institution: "",
                          start_year: "",
                          end_year: "",
                          description: "",
                        })}
                      >
                        + Add Education
                      </Button>
                    </section>

                    {/* ----------------- Experience ----------------- */}
                    <section style={{ marginTop: 24 }}>
                      <h5 style={{ color: "#042F40" }}>Experience</h5>
                      {(parsedData.experience || []).map((exp, i) => (
                        <div key={i} className="card p-3 mb-2 bg-white">
                          {["company", "title", "start_year", "end_year"].map(
                            (field) => (
                              <input
                                key={field}
                                className="form-control mb-2"
                                placeholder={field}
                                value={exp[field] || ""}
                                onChange={(e) => {
                                  const list = [...parsedData.experience];
                                  list[i][field] = e.target.value;
                                  handleFieldChange("experience", list);
                                } } />
                            )
                          )}
                          <textarea
                            className="form-control mb-2"
                            placeholder="description"
                            value={(exp.description || []).join("\n")}
                            onChange={(e) => {
                              const list = [...parsedData.experience];
                              list[i].description = e.target.value
                                .split("\n")
                                .filter(Boolean);
                              handleFieldChange("experience", list);
                            } } />
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
                        onClick={() => addItem(
                          "experience",
                          {
                            company: "",
                            title: "",
                            start_year: "",
                            end_year: "",
                            description: [""],
                          },
                          true // 👈 add to top
                        )}
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
                                placeholder={field}
                                value={proj[field] || ""}
                                onChange={(e) => {
                                  const list = [...parsedData.projects];
                                  list[i][field] = e.target.value;
                                  handleFieldChange("projects", list);
                                } } />
                            )
                          )}
                          <textarea
                            className="form-control mb-2"
                            placeholder="description"
                            value={(proj.description || []).join("\n")}
                            onChange={(e) => {
                              const list = [...parsedData.projects];
                              list[i].description = e.target.value
                                .split("\n")
                                .filter(Boolean);
                              handleFieldChange("projects", list);
                            } } />
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
                        onClick={() => addItem("projects", {
                          project_name: "",
                          start_year: "",
                          end_year: "",
                          description: [""],
                        })}
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
                        onChange={(e) => handleFieldChange(
                          "technical_skills",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )} />
                    </section>

                    {/* ----------------- Certifications ----------------- */}
                    <section style={{ marginTop: 24 }}>
                      <h5 style={{ color: "#042F40" }}>Certifications</h5>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={(parsedData.certifications || []).join(", ")}
                        onChange={(e) => handleFieldChange(
                          "certifications",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )} />
                    </section>

                    {/* ----------------- Languages ----------------- */}
                    <section style={{ marginTop: 24 }}>
                      <h5 style={{ color: "#042F40" }}>Languages</h5>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={(parsedData.languages || []).join(", ")}
                        onChange={(e) => handleFieldChange(
                          "languages",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )} />
                    </section>
                  </div>
                ) : (
                  <div className="text-muted">No resume parsed yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview */}
          {/* RIGHT COLUMN */}
          <div className="col-xl-4 col-lg-5" style={{ paddingLeft: "0.5rem" }}>
            {/* PDF Preview */}
            <div className="card mb-4">
              <div className="card-header" style={{ backgroundColor: "#042F40", color: "white" }}>
                <h5 className="card-title mb-0">📑 Resume Preview</h5>
              </div>
              <div className="card-body p-0">
                {pdfUrl && (
                  <>
                    <iframe
                      key={pdfUrl}
                      src={pdfUrl}
                      width="100%"
                      height="800px"
                      title="Resume Preview"
                      style={{
                        border: "none",
                        display: "block",
                        backgroundColor: "#f9f9f9",
                      }}
                    />
                    <div className="p-2 text-center">
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        Open PDF in new tab
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resume History */}
            <div className="card">
              <div className="card-header" style={{ backgroundColor: "#042F40", color: "white" }}>
                <h5 className="card-title mb-0">🕒 Resume History (Mongo)</h5>
              </div>
              <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {resumeHistory.length === 0 ? (
                  <p className="text-muted">No resumes saved yet.</p>
                ) : (
                  <ul className="list-group">
                    {resumeHistory.map((r) => (
                      <li
                        key={r._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          onClick={() => {
                            setParsedData(r);
                            setPdfUrl(null);
                            message.info(`Loaded ${r.full_name}`);
                          }}
                          style={{ flex: 1 }}
                        >
                          <strong>{r.full_name}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(r.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <Button
                          size="small"
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteResume(r._id);
                          }}
                        >
                          🗑
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
    
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
