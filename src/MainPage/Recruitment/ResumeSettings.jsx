"use client";

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Input,
  Button,
  Select,
  Slider,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Empty,
  Breadcrumb,
  Modal,
  Skeleton,
  message,
} from "antd";
import {
  DeleteOutlined,
  SaveOutlined,
  LockOutlined,
  UnlockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";

const { Text } = Typography;

// ---------------------- STATIC FONT OPTIONS ----------------------
const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Helvetica", label: "Helvetica" },
];

export default function ResumeSettings() {
  const [currentConfig, setCurrentConfig] = useState(null);
  const [defaultConfig, setDefaultConfig] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [newPresetName, setNewPresetName] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPresetSelected, setIsPresetSelected] = useState(false);

  // ---------------------- FETCH ON LOAD ----------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentTheme(), fetchPresets()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // ---------------------- API CALLS ----------------------
  const fetchCurrentTheme = async () => {
    try {
      const res = await apiServices("GET", "resume-theme");
      if (res?.data?.config) {
        setCurrentConfig(res.data.config);
        setDefaultConfig(res.data.config);
      } else {
        message.warning("No current theme found in database.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch current theme:", err);
      message.error("Failed to fetch current theme from server.");
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await apiServices("GET", "resume-presets");
      if (res?.data) setPresets(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch presets:", err);
      message.error("Failed to fetch presets.");
    }
  };

  const updateCurrentTheme = async () => {
    try {
      const res = await apiServices("POST", "resume-theme", { config: currentConfig });
      if (res?.data) message.success("Theme updated successfully!");
    } catch (err) {
      console.error("❌ Failed to update theme:", err);
      message.error("Failed to update theme.");
    }
  };

  const savePresetToDB = async () => {
    if (!newPresetName.trim()) return;
    try {
      const res = await apiServices("POST", "resume-presets", {
        name: newPresetName,
        config: currentConfig,
      });
      if (res?.data) {
        message.success("Preset saved successfully!");
        setNewPresetName("");
        fetchPresets();
      }
    } catch (err) {
      console.error("❌ Failed to save preset:", err);
      message.error("Failed to save preset.");
    }
  };

  const deletePresetFromDB = async (id) => {
    Modal.confirm({
      title: "Delete Preset",
      content: "Are you sure you want to delete this preset?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await apiServices("DELETE", `resume-presets/${id}`);
          message.success("Preset deleted");
          fetchPresets();
        } catch (err) {
          console.error("❌ Failed to delete preset:", err);
          message.error("Failed to delete preset.");
        }
      },
    });
  };
    const usePreset = async (presetId) => {
      try {
        // 🧠 Use GET to fetch preset config directly
        const res = await apiServices("GET", `resume-presets/${presetId}`);
        if (res?.data?.config) {
          setCurrentConfig(res.data.config);
          message.success(`Preset "${res.data.name}" loaded successfully!`);
        } else {
          message.warning("Preset not found or missing config.");
          setSelectedPresetId(null);
          setIsPresetSelected(false);
          setIsLocked(false);
        }
      } catch (err) {
        console.error("❌ Failed to load preset:", err);
        if (err.response?.status === 404) {
          message.warning("Preset not found (possibly deleted).");
          setSelectedPresetId(null);
          setIsPresetSelected(false);
          setIsLocked(false);
        } else {
          message.error("Failed to fetch preset from server.");
        }
      }
    };
  // ---------------------- LOGIC ----------------------
  const handleSelectPreset = (presetId) => {
    const preset = presets.find((p) => p._id === presetId);
    if (preset) {
      setCurrentConfig(preset.config);
      setSelectedPresetId(presetId);
      setIsPresetSelected(true);
      setIsLocked(true);
    }
  };

  const handleConfigChange = (key, value) => {
    if (!isLocked) {
      setCurrentConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleResetConfig = () => {
    setCurrentConfig(defaultConfig);
    setSelectedPresetId(null);
    setIsPresetSelected(false);
    setIsLocked(false);
  };

  // ---------------------- RENDER LOADING ----------------------
  if (loading || !currentConfig) {
    return (
      <div className="p-4" style={{ maxWidth: "100%" }}>
        <Helmet>
          <title>Resume Settings</title>
        </Helmet>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  // ---------------------- MAIN RENDER ----------------------
  return (
    <div className="p-4" style={{ maxWidth: "100%" }}>
      <Helmet>
        <title>Resume Settings</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="page-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="page-title mb-1">Resume Settings</h3>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a href="/recruitment/dashboard">Dashboard</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Resume Settings</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT SECTION */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isLocked ? <LockOutlined /> : <UnlockOutlined />}
                  <span>
                    {isLocked && selectedPresetId
                      ? `Active Preset: ${presets.find((p) => p._id === selectedPresetId)?.name}`
                      : "Runtime Configuration"}
                  </span>
                </div>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Font Family */}
                <div>
                  <Text strong>Font Family</Text>
                  <Select
                    value={currentConfig.fontFamily}
                    onChange={(value) => handleConfigChange("fontFamily", value)}
                    disabled={isLocked}
                    style={{ width: "100%", marginTop: 6 }}
                    options={FONT_OPTIONS}
                  />
                </div>

                {/* Font Sizes */}
                {[
                  { key: "headingFontSize", label: "Heading Font Size", min: 12, max: 28 },
                  { key: "subHeadingFontSize", label: "Subheading Font Size", min: 10, max: 20 },
                  { key: "textFontSize", label: "Text Font Size", min: 8, max: 16 },
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <Text strong>{label}</Text>
                    <Slider
                      value={currentConfig[key]}
                      onChange={(value) => handleConfigChange(key, value)}
                      min={min}
                      max={max}
                      step={1}
                      disabled={isLocked}
                    />
                  </div>
                ))}
                {/* Logo Dimensions */}
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Logo Width (px)
                    </Text>
                    <Input
                      type="number"
                      min={20}
                      max={400}
                      value={currentConfig.logoWidth || ""}
                      onChange={(e) => handleConfigChange("logoWidth", Number(e.target.value))}
                      disabled={isLocked}
                      placeholder="e.g., 100"
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Logo Height (px)
                    </Text>
                    <Input
                      type="number"
                      min={20}
                      max={400}
                      value={currentConfig.logoHeight || ""}
                      onChange={(e) => handleConfigChange("logoHeight", Number(e.target.value))}
                      disabled={isLocked}
                      placeholder="e.g., 60"
                      style={{ width: "100%" }}
                    />
                  </Col>
                </Row>


                <Divider />

                {/* Colors */}
                <Text strong>Colors</Text>
                <Row gutter={16}>
                {["textColor", "headingColor", "accentColor"].map(
                    (key, index) => (
                    <Col xs={24} sm={index < 2 ? 12 : 24} key={key}>
                        <div>
                        <Text
                            type="secondary"
                            style={{ display: "block", marginBottom: 8, marginTop: 5 }}
                        >
                            {key === "textColor"
                            ? "Text Color"
                            : key === "headingColor"
                            ? "Heading Color"
                            : "Accent Color"}
                        </Text>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                            type="color"
                            value={currentConfig[key]}
                            onChange={(e) =>
                                handleConfigChange(key, e.target.value)
                            }
                            disabled={isLocked}
                            style={{
                                width: "40px",
                                height: "30px",
                                border: "none",
                                background: "none",
                                cursor: isLocked ? "not-allowed" : "pointer",
                            }}
                            />
                            <Input
                            value={currentConfig[key]}
                            onChange={(e) =>
                                handleConfigChange(key, e.target.value)
                            }
                            disabled={isLocked}
                            style={{
                                fontFamily: "monospace",
                                fontSize: 12,
                            }}
                            />
                        </div>
                        </div>
                    </Col>
                    )
                )}
                </Row>
                {isLocked && (
                  <Button onClick={handleResetConfig} block>
                    <UnlockOutlined /> Unlock & Reset
                  </Button>
                )}
                <Button
                  type="primary"
                  block
                  style={{ backgroundColor: "#FF9B44", border: "none" }}
                  onClick={async () => {
                    try {
                      if (isPresetSelected && selectedPresetId) {
                        await usePreset(selectedPresetId);
                      } else {
                        await updateCurrentTheme();
                      }
                    } catch (err) {
                      console.error("❌ Failed to apply settings:", err);
                    }
                  }}
                >
                  <ArrowRightOutlined /> Use Settings
                </Button>
              </Space>
            </Card>

            {/* PREVIEW */}
            <Card title="Preview">
              <div
                style={{
                  padding: 24,
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  fontFamily: currentConfig.fontFamily,
                  fontSize: `${currentConfig.textFontSize}pt`,
                  color: currentConfig.textColor,
                }}
              >
                {/*Logo preview*/}
                <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: currentConfig.logoWidth,
                    height: currentConfig.logoHeight,
                    backgroundColor: currentConfig.accentColor,
                    display: "inline-block",
                    borderRadius: 4,
                  }}
                />
              </div>
                <h4
                  style={{
                    color: currentConfig.headingColor,
                    fontSize: currentConfig.headingFontSize,
                    fontWeight: 600,
                  }}
                >
                  John Doe
                </h4>
                <p
                  style={{
                    color: currentConfig.accentColor,
                    fontSize: currentConfig.subHeadingFontSize,
                    fontWeight: 600,
                  }}
                >
                  Senior Software Engineer
                </p>
                <p>Experienced developer with 5+ years in full-stack development.</p>
                <div
                  style={{
                    color: currentConfig.accentColor,
                    fontWeight: 600,
                    fontSize: currentConfig.subHeadingFontSize,
                    margin: "16px 0 8px 0",
                  }}
                >
                  Experience
              </div>
                <p style={{ margin: 0 , color: currentConfig.textColor}}>
                  Led development of scalable applications and mentored junior
                  developers.
                </p>
              </div>
            </Card>
          </Space>
        </Col>

        {/* RIGHT SECTION */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Presets List */}
            <Card title="Your Presets">
              {presets.length === 0 ? (
                <Empty description="No presets yet" />
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  {presets.map((preset) => (
                    <div
                      key={preset._id}
                      onClick={() => handleSelectPreset(preset._id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 10,
                        border:
                          selectedPresetId === preset._id
                            ? "2px solid #1890ff"
                            : "1px solid #ddd",
                        backgroundColor:
                          selectedPresetId === preset._id ? "#e6f7ff" : "#fafafa",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <Text strong>{preset.name}</Text>
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePresetFromDB(preset._id);
                        }}
                        style={{ color: "red", cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Card>

            {/* Create Preset */}
            <Card title="Create Preset">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="e.g., My Custom Style"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
                <Button
                  type="primary"
                  block
                  icon={<SaveOutlined />}
                  onClick={savePresetToDB}
                  disabled={!newPresetName.trim()}
                >
                  Save as Preset
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
