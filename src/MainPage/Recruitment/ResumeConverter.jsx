// ✅ ResumeConverter.jsx — Final version (with AntD Dragger + uploadFunction)

import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";

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

  const authState = useSelector((state) => state.user.loginvalue);
  const token =
    localStorage.getItem("token") || authState?.access_token?.accessToken;

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
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  // ----------------------------
  // Upload & Parse Resume (using uploadFunction)
  // ----------------------------
  const handleUpload = async () => {
    if (!fileList || fileList.length === 0) {
      message.warning("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the centralized upload function
      const uploadedFiles = await uploadFunction(fileList, authState);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error("File upload returned no data.");
      }

      const uploaded = uploadedFiles[0];
      console.log("Uploaded file metadata:", uploaded);

      const parsed = {
        full_name: uploaded.candidateName || "",
        email: uploaded.candidateEmail || "",
        phone: uploaded.candidateContact || "",
      };

      const s3Link = uploaded.imageUrl || uploaded.secure_url;

      if (s3Link) setPdfUrl(s3Link);
      if (parsed) setParsedData(parsed);

      message.success("Resume uploaded and parsed successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
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
  const handleSave = async () => {
    if (!parsedData) return;
    setError(null);
    setLoading(true);

    try {
      const res = await apiServices(
        "POST",
        "resume/preview-from-json",
        parsedData,
        {
          access_token: { accessToken: token },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      message.success("Preview updated successfully!");
    } catch (err) {
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Field Management Helpers
  // ----------------------------
  const handleFieldChange = (field, value) => {
    setParsedData((prev) =>
      prev ? { ...prev, [field]: value } : { [field]: value }
    );
  };

  // ----------------------------
  // UI Rendering
  // ----------------------------
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Resume Converter</h3>
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
          </div>
        </div>

        <div className="row">
          {/* LEFT COLUMN: Upload + Form */}
          <div
            className="col-xl-7 col-lg-5"
            style={{ paddingRight: "0.75rem" }}
          >
            <div className="card">
              <div className="card-body" style={{ padding: "1rem 1.25rem" }}>
                {/* Upload Section */}
                <div
                  className="card"
                  style={{ marginBottom: 20, backgroundColor: "#f8f9fa" }}
                >
                  <div className="card-body">
                    <h6
                      className="card-title mb-3"
                      style={{ color: "#042F40" }}
                    >
                      📄 Resume Upload & Processing
                    </h6>

                    {/* 🔶 Ant Design Dragger */}
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ color: "#042F40" }} />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag a resume file to this area to upload
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
                      <Button
                        type="default"
                        onClick={handleSave}
                        disabled={!parsedData || loading}
                        block
                      >
                        💾 Save & Update Preview
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Parsed Resume Data */}
                {parsedData ? (
                  <div
                    className="border rounded"
                    style={{
                      maxHeight: "70vh",
                      overflow: "auto",
                      padding: 20,
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <h5
                      className="mb-3"
                      style={{
                        color: "#042F40",
                        borderBottom: "2px solid #A1CA73",
                        paddingBottom: "8px",
                      }}
                    >
                      Basic Information
                    </h5>

                    <div className="form-group mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={parsedData.full_name || ""}
                        onChange={(e) =>
                          handleFieldChange("full_name", e.target.value)
                        }
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        value={parsedData.email || ""}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={parsedData.phone || ""}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted mt-3">No resume parsed yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PDF Preview */}
          <div
            className="col-xl-4 col-lg-5"
            style={{ paddingLeft: "0.75rem", marginBottom: "2rem" }}
          >
            <div className="card" style={{ height: "fit-content" }}>
              <div
                className="card-header"
                style={{ backgroundColor: "#042F40", color: "white" }}
              >
                <h5 className="card-title mb-0">📑 Resume Preview</h5>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {pdfUrl ? (
                  <iframe
                    title="Resume Preview"
                    src={pdfUrl}
                    style={{
                      width: "100%",
                      height: "70vh",
                      border: "none",
                      borderRadius: "0 0 4px 4px",
                    }}
                  />
                ) : (
                  <div
                    className="text-muted d-flex flex-column align-items-center justify-content-center"
                    style={{
                      height: "70vh",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "0 0 4px 4px",
                    }}
                  >
                    <div className="text-center">
                      <i
                        className="fas fa-file-pdf fa-3x mb-3"
                        style={{ color: "#6c757d" }}
                      ></i>
                      <p className="mb-0">No preview available</p>
                      <small>Upload and parse a resume to see preview</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
