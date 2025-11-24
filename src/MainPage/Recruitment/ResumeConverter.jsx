import React, { useState, useEffect } from "react";
import { Upload, Button, message, Modal, Spin, Collapse, notification, Checkbox } from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { apiUploadToS3 } from "../../Services/uploadImage";
import { useSelector } from "react-redux";
import { uploadFunction } from "../Employees/Projects/UploadAndDeleteFunc";
import { BASE_URL } from '../../config/apiConfig';
import { FileTextOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const { Dragger } = Upload;
const { Panel } = Collapse;
const { Confirm } = Modal;

export default function ResumeConverter() {

  // State
  const location = useLocation();
  const navigate = useNavigate();
  const { parsedData: stateData, autoPreview: initialAutoPreview } = location.state || {};
  const [autoPreview, setAutoPreview] = useState(initialAutoPreview || false);
  const [parsedData, setParsedData] = useState(stateData || null);
  const [fileList, setFileList] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false);
  const [duplicateRecord, setDuplicateRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [pdfFocusUrl, setPdfFocusUrl] = useState(null);
  const [loadingFocusPdf, setLoadingFocusPdf] = useState(false);
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const userState = useSelector((state) => state.user.loginvalue);
  const test = userState?.user?.companyImageUrl;
  const companyLogo = userState?.user?.companyImageUrl || "";
  const [isTwoColumnSkills, setIsTwoColumnSkills] = useState(false);
  const selectedPresetId = useSelector((state) => state.resumePreset.selectedPresetId) || "";
  const aiModel = useSelector((state) => state.aiConfig.selectedModel || "deepSeek")


  //Resume History load
  // ----------------------------
  // Auto-generate PDF preview if navigated from ResumeHistory
  // ----------------------------

  // 1️⃣ Load saved resume data if opened from "View Existing"
  useEffect(() => {
    // 🧠 Restore state from session storage (if available)
    console.log("selected model", aiModel)
    const savedState = sessionStorage.getItem("resume_preview_data");
    if (savedState && !stateData) {
      const { parsedData, autoPreview: shouldPreview } = JSON.parse(savedState);
      setParsedData(parsedData);
      if (shouldPreview) setAutoPreview(true);
      sessionStorage.removeItem("resume_preview_data"); // cleanup
    }

    console.log("🖼️ Company logo from DB:", companyLogo);

    // 🧩 Safely check if logo field exists or is true
    const compLogoIncluded =
      parsedData?.is_company_logo_included === true ||
      parsedData?.is_company_logo_included === "true" ||
      (parsedData?.company_logo && parsedData?.company_logo !== "");

    if (compLogoIncluded) {
      console.log("✅ Using existing company logo in resume");
      setIncludeCompanyLogo(true);
      setLogoUrl(parsedData?.company_logo || companyLogo || null);
    } else {
      console.log("⚪ No company logo included in record");
      setIncludeCompanyLogo(false);
      setLogoUrl(null);
    }

    console.log("🔍 Field value:", parsedData?.is_company_logo_included);
  }, []);


  // 2️⃣ Generate PDF preview automatically when autoPreview is enabled
  useEffect(() => {
    const autoGeneratePreview = async () => {
      // ✅ Use parsedData instead of stateData so it works for both new-tab and navigation
      if (autoPreview && parsedData) {
        console.log("🚀 Auto preview triggered for:", parsedData.full_name);
        setLoading(true);
        const payload = {
          ...parsedData,
          presetId: selectedPresetId,
        }
        try {
          const blobRes = await axiosInstance.post(
            "resume/preview-from-json",
            { parsed: payload },
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
          message.success("✅ PDF preview generated!");
        } catch (err) {
          console.error("❌ Auto PDF preview failed:", err);
          message.error("Failed to generate PDF preview.");
        } finally {
          setLoading(false);
        }
      }
    };

    autoGeneratePreview();
    setAutoPreview(false);
  }, [autoPreview, parsedData]); // 👈 changed from stateData


  //automatically check for company logo





  //placeholders
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
    accept: ".pdf",
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
      const res = await apiServices("POST", "resume/parse-url", {
        fileUrl,
        aiModel: aiModel,
      });
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
  //Logo uploading
  const handleLogoUpload = async (file) => {
    console.log("🟢 Starting company logo upload...", file);

    setUploadingLogo(true);
    try {
      const response = await apiUploadToS3(file);
      console.log("🟣 Raw upload response:", response);
      console.log('image file ', response.data.result);
      const uploadedUrl = response?.data?.result?.secure_url || response?.data?.fileUrl;
      if (uploadedUrl) {
        console.log("✅ Logo uploaded successfully:", uploadedUrl);
        setLogoUrl(uploadedUrl);
        message.success("Company logo uploaded successfully!");
      } else {
        console.warn("⚠️ Upload succeeded but no URL returned.");
        message.warning("Upload completed, but no URL found in response.");
      }
    } catch (error) {
      console.error("❌ Logo upload failed:", error);
      message.error("Failed to upload company logo.");
    } finally {
      setUploadingLogo(false);
    }

    // Returning false prevents AntD from auto-uploading
    return false;
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

      // ✅ Smart logo merge logic (same as Mongo save)
      const payload = {
        ...parsedData,
        company_logo: logoUrl || parsedData.company_logo || null,
        isTwoColumnSkills,
        presetId: selectedPresetId || null,
        createdAt: new Date().toISOString(),
      };
      console.log('selected presetid, ', payload.presetId)

      console.log("🖼️ Using company logo for preview:", payload.company_logo);

      // 🧠 Step 1: Ensure backend can generate the PDF
      await apiServices(
        "POST",
        "resume/preview-from-json",
        { parsed: payload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 🧾 Step 2: Retrieve binary PDF data
      const blobRes = await axiosInstance.post(
        "resume/preview-from-json",
        { parsed: payload },
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

      message.success("✅ PDF preview updated successfully!");
    } catch (err) {
      console.error("❌ PDF Preview generation failed:", err);
      message.error("Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const buildFinalPayload = () => ({
    ...parsedData,
    company_logo: logoUrl || parsedData.company_logo || null,
    createdAt: new Date().toISOString(),
    presetId: selectedPresetId || null,
    isTwoColumnSkills,
  });

  const handleSaveMongo = async () => {
    console.log('meow', selectedPresetId);
    if (!parsedData) return message.warning("No parsed data to save.");
    setSaving(true);

    try {
      console.log("🟢 Preparing to save resume...");
      console.log(parsedData);

      // -----------------------------------------
      // 1️⃣ Build FINAL, unified resume payload ONCE
      // -----------------------------------------
      const finalPayload = buildFinalPayload();

      console.log("📦 FINAL PAYLOAD SENT TO BACKEND:", finalPayload);

      // -----------------------------------------
      // 2️⃣ Correct Duplicate Detection
      // -----------------------------------------
      const existingRes = await apiServices(
        "GET",
        `resumes?candidateName=${encodeURIComponent(parsedData.full_name || "")}`  // ✅ FIXED
      );

      const list = Array.isArray(existingRes?.data)
        ? existingRes.data
        : Array.isArray(existingRes?.data?.docs)
          ? existingRes.data.docs
          : [];

      const target = (parsedData.full_name || "").trim().toLowerCase();
      const existing = list.find(
        (r) => (r?.full_name || "").trim().toLowerCase() === target
      );

      // -----------------------------------------
      // 3️⃣ Duplicate → Open Modal (NO SAVE YET)
      // -----------------------------------------
      if (existing) {
        setDuplicateRecord(existing);
        setIsDuplicateModalVisible(true);

        // Modal will use finalPayload as well
        return;
        // isTwoColumnSkills,
      }

      // -----------------------------------------
      // 4️⃣ FIRST-TIME SAVE → Mongo + Pinecone
      // -----------------------------------------
      const saveRes = await apiServices("POST", "resumes", finalPayload);
      const record = saveRes?.data || finalPayload;

      message.success("✅ Resume saved successfully!");

      // -----------------------------------------
      // 5️⃣ Always Download Fresh PDF
      // -----------------------------------------
      try {
        message.loading({ content: "Generating PDF...", key: "pdfGen" });
        const exportPayload = {
          parsed: {
            ...record,
            presetId: selectedPresetId,     // 🔥 FIXED
            isTwoColumnSkills,              // include in parsed
            company_logo: record.company_logo
          }
        }

        const blobRes = await axiosInstance.post(
          "resume/preview-from-json",
          exportPayload,
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
        link.download = `${record.full_name || "resume"}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);

        message.success("📄 Download started!");
      } catch (err) {
        console.error("❌ PDF download failed:", err);
        message.error("PDF generation failed.");
      }
    } catch (err) {
      console.error("❌ Save failed:", err);
      message.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFocusPreview = async () => {
    if (!parsedData) return message.warning("No resume data to preview.");

    setLoadingFocusPdf(true);
    setIsPreviewModalVisible(true);
    setPdfFocusUrl(null);

    try {
      message.loading({ content: `Generating ${parsedData.full_name || "resume"}...`, key: "focus-preview" });
      const payload = {
        ...parsedData,
        company_logo: logoUrl || parsedData.company_logo || null,
        isTwoColumnSkills,
        presetId: selectedPresetId || null,
        createdAt: new Date().toISOString(),
      };

      const blobRes = await axiosInstance.post(
        "resume/preview-from-json",
        { parsed: payload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([blobRes.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      setPdfFocusUrl(blobUrl);
      message.success({ content: "PDF ready!", key: "focus-preview", duration: 2 });
    } catch (err) {
      console.error("❌ Focus PDF preview failed:", err);
      message.error("Failed to generate PDF preview.");
      setIsPreviewModalVisible(false);
    } finally {
      setLoadingFocusPdf(false);
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
    const deletedItem = updated.splice(index, 1)[0];
    handleFieldChange(key, updated);

    // ✅ store only once
    const deletedState = { key, item: deletedItem, index };
    setLastDeleted(deletedState);

    // ✅ log the *next render's* correct value
    console.log("🧠 Deleted item:", deletedState);

    notification.open({
      message: `Deleted from ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      description: (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, color: '#FF9B44' }}
          onClick={() => restoreLastDeleted(deletedState)}
        >
          Undo
        </Button>
      ),
      placement: "bottomRight",
      duration: 5,
      key: "undo-delete",
      style: {
        borderRadius: "8px",
        background: "#fff",
        // border: "1px solid #ffe58f",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      },
    });
  };



  const restoreLastDeleted = (lastDeleted) => {
    console.log('asdasd', lastDeleted);
    if (!lastDeleted) return;

    const { key, item, index } = lastDeleted;
    const updated = [...(parsedData?.[key] || [])];

    console.log(updated)

    // Reinsert at original position (if valid)
    // if (index >= 0 && index <= updated.length) {
    //   updated.splice(index, 0, item);
    // } else {
    //   updated.push(item);
    // }

    console.log(updated)

    handleFieldChange(key, updated);
    setLastDeleted(null);

    message.success("Restored deleted item!");
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
              <h3 className="page-title mb-1">Resume   Converter</h3>
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
                <span style={{ color: "#fff" }}><h5 style={{ color: '#fff', paddingTop: '4px' }}>Upload</h5></span>
              </Button>
            )}
          </div>

          {/* ----------------------------- MAIN GRID ----------------------------- */}
          <div
            className="converter-grid fluid-container"
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
                            Supported file types: <strong>PDF</strong>
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
                      {/* Buttons: PDF & Save */}
                      <div className="d-flex gap-2 mb-4 ">
                        <Button
                          type="default"
                          onClick={handleSave}
                          disabled={!parsedData || loading}
                          loading={loading}
                          block
                          style={{
                            // borderRadius: "30px",
                            borderRadius: '14px',
                            borderColor: "#FF9B44",
                            backgroundColor: "#FF9B44",
                          }}
                        >
                          <span style={{ color: '#fff', fontWeight: 550, fontFamily: 'Poppins, sans-serif' }}>Update Preview</span>
                        </Button>
                        <Button
                          type="default"
                          onClick={handleSaveMongo}
                          disabled={!parsedData}
                          loading={saving}
                          block
                          style={{
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a',
                            borderRadius: '14px',
                            color: '#fff',
                            fontWeight: 500
                          }}
                        >
                          <span style={{ color: "#fff", fontWeight: 550, fontFamily: 'Poppins, sans-serif' }}>Export Resume</span>

                        </Button>
                      </div>
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

                        {/* ----------------- Collapsible Resume Sections ----------------- */}
                        <Collapse
                          defaultActiveKey={[]}
                        // expandIconPosition="end"
                        // expandIcon={({ isActive }) => (
                        //     <img
                        //       src={leftPageIcon}
                        //       alt="dropdown"
                        //       style={{
                        //         width: "12px",
                        //         height: "12px",
                        //         transform: isActive ? "rotate(-90deg)" : "rotate(0deg)",
                        //         transition: "transform 0.3s ease",
                        //       }}
                        //     />
                        // )}
                        // style={{
                        //   backgroundColor: "#fff",
                        //   marginBottom: '4px',
                        //   border: "none",
                        //   borderRadius: "8px",
                        // }}
                        >
                          {/* ----------------- Personal Branding  ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Personal Branding</span>}
                            key="personalBranding"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              //  marginBottom: '12px',
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              padding: "9px 0",
                            }}
                          >
                            <div style={{ marginBottom: 16 }}>
                              <Checkbox
                                checked={includeCompanyLogo}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setIncludeCompanyLogo(checked);
                                  console.log('company logo found', test);
                                  setParsedData((prev) => ({
                                    ...prev,
                                    is_company_logo_included: checked,
                                  }));

                                  if (checked) {
                                    console.log("✅ Using existing company logo from database.");
                                    setLogoUrl(companyLogo); // set DB logo
                                    setLogoFile(null); // disable any uploaded file
                                  } else {
                                    console.log("🟠 Allowing user to upload new company logo.");
                                    setLogoUrl(null);
                                  }
                                }}
                              >
                                <span>Include Company Logo</span>
                              </Checkbox>

                              <div style={{ marginTop: 8 }}>
                                <Upload.Dragger
                                  accept="image/*"
                                  disabled={includeCompanyLogo} // ⛔ disable when checkbox is active
                                  beforeUpload={(file) => {
                                    if (includeCompanyLogo) {
                                      message.info("Company logo is locked — uncheck to upload a new one.");
                                      return false;
                                    }
                                    console.log("🟡 File selected for upload:", file);
                                    setLogoFile(file);
                                    handleLogoUpload(file);
                                    return false; // Stop auto upload
                                  }}
                                  fileList={!includeCompanyLogo && logoFile ? [logoFile] : []}
                                  onRemove={() => {
                                    console.log("🧹 Removing uploaded logo");
                                    setLogoFile(null);
                                    setLogoUrl(null);
                                  }}
                                  showUploadList={{ showRemoveIcon: !includeCompanyLogo }}
                                  style={{
                                    opacity: includeCompanyLogo ? 0.6 : 1,
                                    pointerEvents: includeCompanyLogo ? "none" : "auto",
                                    cursor: includeCompanyLogo ? "not-allowed" : "pointer",
                                  }}
                                >
                                  <p className="ant-upload-drag-icon">
                                    <UploadOutlined style={{ color: "#FF9B44", fontSize: 24 }} />
                                  </p>
                                  <p className="ant-upload-text">
                                    {includeCompanyLogo
                                      ? "Using saved company logo — uncheck to upload new one"
                                      : uploadingLogo
                                        ? "Uploading logo..."
                                        : "Click or drag image to upload"}
                                  </p>

                                  {/* Preview logo (DB or newly uploaded) */}
                                  {(logoUrl || companyLogo) && (
                                    <img
                                      src={includeCompanyLogo ? companyLogo : logoUrl}
                                      alt=""
                                      style={{
                                        marginTop: 8,
                                        maxHeight: 80,
                                        borderRadius: 8,
                                        border: "1px solid #ddd",
                                        objectFit: "contain",
                                      }}
                                    />
                                  )}
                                </Upload.Dragger>
                              </div>

                            </div>

                          </Panel>
                          {/* ---------- Candidate Info ---------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Candidate Details</span>}
                            key="1"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              //  marginBottom: '12px',
                              padding: "9px 0",
                            }}
                          >
                            {["full_name", "title", "email", "phone", "location"].map((field) => (
                              <div className="form-group" key={field}>
                                <label className="form-label text-capitalize">
                                  {field.replace("_", " ")}
                                </label>
                                <input
                                  className="form-control"
                                  value={parsedData[field] || ""}
                                  onChange={(e) => handleFieldChange(field, e.target.value)}
                                />
                              </div>
                            ))}
                            <div className="form-group">
                              <label className="form-label">Summary</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={parsedData.summary || ""}
                                onChange={(e) => handleFieldChange("summary", e.target.value)}
                              />
                            </div>
                          </Panel>

                          {/* ----------------- Education ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Education</span>}
                            key="2"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              //  marginBottom: '12px',
                              padding: "9px 0",
                            }}
                          >
                            {(parsedData.education || []).map((edu, i) => (
                              <div key={i} className="card p-3 mb-2 bg-white">
                                {["degree", "institution", "start_year", "end_year"].map((field) => (
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
                                <Button danger size="small" onClick={() => removeItem("education", i)}>
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
                          </Panel>

                          {/* ----------------- Experience ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Experience</span>}
                            key="3"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              borderRight: "none",
                              //  marginBottom: '12px',
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              padding: "9px 0",
                            }}
                          >
                            <Button
                              type="dashed"
                              style={{ marginBottom: "8px" }}
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
                                  true
                                )
                              }
                            >
                              + Add Experience
                            </Button>

                            {(parsedData.experience || []).map((exp, i) => (
                              <div key={i} className="card p-3 mb-2 bg-white">
                                {["company", "title", "start_year", "end_year"].map((field) => (
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
                                <Button danger size="small" onClick={() => removeItem("experience", i)}>
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </Panel>

                          {/* ----------------- Projects ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Projects</span>}
                            key="4"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              //  marginBottom: '12px',
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              padding: "9px 0",
                            }}
                          >
                            {(parsedData.projects || []).map((proj, i) => (
                              <div key={i} className="card p-3 mb-2 bg-white">
                                {["project_name", "start_year", "end_year"].map((field) => (
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
                                ))}
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
                                <Button danger size="small" onClick={() => removeItem("projects", i)}>
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
                          </Panel>

                          {/* ----------------- Skills ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Technical Skills</span>}
                            key="5"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              //  marginBottom: '12px',
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              padding: "9px 0",
                            }}
                          >
                            <div style={{ marginBottom: '5px' }}>

                              <Checkbox
                                checked={isTwoColumnSkills}
                                onChange={(e) => {
                                  setIsTwoColumnSkills(e.target.checked);
                                  message.info(
                                    e.target.checked
                                      ? "Technical skills will be shown in 2 columns."
                                      : "Technical skills will be shown in a single column."
                                  );
                                }}
                              >
                                <span>Column View</span>
                              </Checkbox>
                            </div>
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
                          </Panel>

                          {/* ----------------- Certifications ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Certifications</span>}
                            key="6"
                            style={{
                              background: "#fff",
                              borderTop: "none",
                              borderLeft: "none",
                              //  marginBottom: '12px',
                              borderRight: "none",
                              borderBottom: "1px solid #e0e0e0",
                              borderRadius: '5px',
                              padding: "9px 0",
                            }}
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

                          {/* ----------------- Languages ----------------- */}
                          <Panel
                            header={<span style={{ color: "#042F40", margin: 0, fontWeight: 550 }}>Languages</span>}
                            key="7"
                            style={{
                              background: "#fff",
                              border: "none", // 👈 remove bottom border for final section
                              borderRadius: '5px',
                              padding: "12px 0",
                            }}
                          >
                            <textarea
                              className="form-control"
                              rows="2"
                              placeholder="Enter languages separated by commas"
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
                          </Panel>
                        </Collapse>
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
                  className="card-header d-flex align-items-center justify-content-between mb-0"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "white",
                    borderColor: "white",
                    height: "60px",
                    width: '100%',
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
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={handleFocusPreview}
                    style={{
                      backgroundColor: "#FFF",
                      border: 'none',
                      color: '#FF9B44',
                      // borderRadius: "50%",
                      marginLeft: '10px',
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* <span> <img src={FilePdfOutlined}/></span> */}
                  </Button>
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
            <style jsx>{`
            @media (max-width: 992px) {
              .converter-grid {
                grid-template-columns: 1fr !important;
              }
              .right-section {
                margin-top: 24px;
              }
            }
            /* For small phones */
            @media (max-width: 600px) {
              .converter-grid {
                gap: 16px !important;
                padding: 0 8px;
              }
              .right-section {
                margin-top: 16px;
              }
            }
          `}</style>
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
              Supported file types: <strong>PDF, DOC, DOCX</strong>
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
      <Modal
        open={isDuplicateModalVisible}
        onCancel={() => setIsDuplicateModalVisible(false)}
        footer={null}
        centered
        width={540}
        bodyStyle={{
          background: "#FFFFFF",
          borderRadius: "10px",
          padding: "24px 24px 16px 24px",
        }}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#FFF1E5",
              borderRadius: "8px",
              padding: "10px 14px",
              margin: "24px -12px 12px -12px",
            }}
          >
            <FileTextOutlined style={{ color: "#FF9B44", fontSize: 22 }} />
            <span style={{ fontWeight: 600, color: "#042F40", fontSize: "16px" }}>
              Similar Resume Found
            </span>
          </div>
        }
      >
        {duplicateRecord && (
          <div>
            <p
              style={{
                marginBottom: "14px",
                fontSize: "15px",
                color: "#042F40",
                fontWeight: 500,
              }}
            >
              A resume for{" "}
              <span style={{ color: "#FF9B44", fontWeight: 600 }}>
                {duplicateRecord.full_name}
              </span>{" "}
              already exists. Save the new resume?
            </p>
            {/* Info Box */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                padding: 14,
                marginBottom: 20,
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#555",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Title:</strong> {duplicateRecord.title || "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {duplicateRecord.email || "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Phone:</strong> {duplicateRecord.phone || "—"}
              </p>
            </div>
            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              {/* Cancel */}
              <Button
                onClick={() => setIsDuplicateModalVisible(false)}
                style={{
                  background: "#f5f5f5",
                  borderColor: "#d9d9d9",
                  color: "#555",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </Button>
              {/* Override */}
              <Button
                type="primary"
                loading={isSaving}
                disabled={isSaving}
                style={{
                  background: "#FF9B44",
                  borderColor: "#FF9B44",
                  color: "#fff",
                  borderRadius: "6px",
                  fontWeight: 550,
                }}
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    // await apiServices("DELETE", `resumes/${duplicateRecord._id}`);
                    // const payload = {
                    //   ...parsedData,
                    //   company_logo: logoUrl || null, // add logo URL
                    //   createdAt: new Date().toISOString(), // ensure new timestamp
                    // };
                    const finalPayload = buildFinalPayload();
                    await apiServices("POST", "resumes", finalPayload);
                    message.success("Resume saved successfully!");
                  } catch (err) {
                    console.error(" Override failed:", err);
                    message.error("Failed to override resume.");
                  } finally {
                    setIsSaving(false);
                    setIsDuplicateModalVisible(false);
                  }
                }}
              >
                {isSaving ? "Saving..." : "Proceed"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={1100}
        className="pdf-preview-modal"
        centered
        style={{ zIndex: 3000 }}
        maskStyle={{ zIndex: 2999, background: "rgba(0, 0, 0, 0.5)" }}
        bodyStyle={{ padding: 0, height: "85vh" }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <EyeOutlined style={{ color: "#ff9244", fontSize: 20 }} />
            <span>{parsedData?.full_name || "Resume"} - Full PDF View</span>
          </div>
        }
      >
        {loadingFocusPdf ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#555",
            }}
          >
            <div className="spinner-border mb-3" role="status" />
            <p>Loading PDF preview...</p>
          </div>
        ) : pdfFocusUrl ? (
          <iframe
            src={`${pdfFocusUrl}#toolbar=0&navpanes=0`}
            width="100%"
            height="100%"
            title="Resume Focus Preview"
            style={{
              border: "none",
              backgroundColor: "#FFF1E5",
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
            }}
          >
            <p>No PDF preview available.</p>
          </div>
        )}

        <style jsx>{`
    /* --- Core Modal Styling --- */
    .pdf-preview-modal .ant-modal-content {
      border-radius: 10px;
      border: 1px solid transparent;
      overflow: hidden;
    }
    .pdf-preview-modal .ant-modal-header {
      border-bottom: none;
      padding: 15px 18px 0 24px;
      border-radius: 10px;
      margin-bottom: 10px
    }
    .pdf-preview-modal .ant-modal-title {
      font-size: 20px;
      font-weight: 600;
    }
    .pdf-preview-modal .ant-modal-close {
      background-color: #f8f9fa;
      border-radius: 50%;
      margin: 16px 16px 0 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* --- Z-Index Fix to Ensure It's Above Sidebar --- */
    .ant-modal,
    .ant-modal-wrap,
    .ant-modal-mask {
      z-index: 3000 !important;
    }

    /* --- Responsiveness --- */
    @media (max-width: 1200px) {
      .pdf-preview-modal .ant-modal-content {
        width: 95% !important;
      }
    }

    @media (max-width: 768px) {
      .pdf-preview-modal .ant-modal-body {
        height: 70vh !important;
      }
      .pdf-preview-modal .ant-modal-title {
        font-size: 16px;
      }
      .pdf-preview-modal .ant-modal-header {
        padding: 8px 12px;
      }
    }

    @media (max-width: 480px) {
      .pdf-preview-modal .ant-modal-body {
        height: 65vh !important;
      }
    }

    /* --- Scroll + Focus Handling --- */
    .pdf-preview-modal .ant-modal-body {
      overflow: hidden;
      background: #fff;
    }

    body.modal-open {
      overflow: hidden;
    }
  `}</style>
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
        // .converter-grid fluid-container {
        //   display: flex;
        //   align-items: flex-start;
        //   justify-content: space-between;
        //   gap: 24px;
        //   padding: 16px;
        // }
        
        // .converter-grid {
        //   transition: all 0.3s
        // }

        // /* Left section (form) */
        // .left-section {
        //   flex: 1 1 50%;
        //   min-width: 360px;
        // }

        // /* Right section (preview) */
        // .right-section {
        //   flex: 1 1 50%;
        //   background: #fff;
        //   border: 1px solid #eaeaea;
        //   border-radius: 10px;
        //   overflow: hidden;
        // }

        // /* --- Responsive behavior --- */
        // @media (max-width: 992px) {
        //   .converter-grid fluid-container {
        //     flex-direction: column;
        //     align-items: stretch;
        //   }

        //   .left-section,
        //   .right-section {
        //     width: 100%;
        //   }

        //   .right-section {
        //     margin-top: 24px; /* Add spacing between stacked blocks */
        //   }
        // }

        // /* Optional: for very small phones */
        // @media (max-width: 600px) {
        //   .resume-converter-container {
        //     padding: 12px;
        //   }
        //   .right-section {
        //     margin-top: 16px;
        //   }
        // }

          
      `}</style>
    </>

  );
} 