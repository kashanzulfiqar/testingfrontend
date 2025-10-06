import React, { useState } from 'react';

export default function ResumeConverter() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsedData((prev) => (prev ? { ...prev, [field]: value } : { [field]: value }));
  };

  const addEducation = () => {
    const updated = parsedData?.education ? [...parsedData.education] : [];
    updated.push({ degree: "", institution: "", start_year: "", end_year: "", description: "" });
    handleFieldChange("education", updated);
  };
  const removeEducation = (i) => {
    const updated = [...(parsedData?.education || [])];
    updated.splice(i, 1);
    handleFieldChange("education", updated);
  };

  const addExperience = () => {
    const updated = parsedData?.experience ? [...parsedData.experience] : [];
    updated.push({ company: "", title: "", start_year: "", end_year: "", description: [""] });
    handleFieldChange("experience", updated);
  };
  const removeExperience = (i) => {
    const updated = [...(parsedData?.experience || [])];
    updated.splice(i, 1);
    handleFieldChange("experience", updated);
  };

  const addProject = () => {
    const updated = parsedData?.projects ? [...parsedData.projects] : [];
    updated.push({ project_name: "", start_year: "", end_year: "", description: [""] });
    handleFieldChange("projects", updated);
  };
  const removeProject = (i) => {
    const updated = [...(parsedData?.projects || [])];
    updated.splice(i, 1);
    handleFieldChange("projects", updated);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload/", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data?.parsed) {
        setParsedData(data.parsed);
        setPdfUrl(data.pdf_url || null);
      } else {
        setError("Parsing failed. Please try another resume.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/update/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsed: parsedData }),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data?.pdf_url) setPdfUrl(`${data.pdf_url}?t=${Date.now()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Resume Converter</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/recruitment/dashboard" target="_blank" rel="noopener noreferrer">Dashboard</a></li>
                <li className="breadcrumb-item active">Resume Converter</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8 col-lg-7">
            <div className="card">
              <div className="card-body">
                <div className="row g-2 align-items-center" style={{ marginBottom: 16 }}>
                  <div className="col-sm-7">
                    <div className="form-group">
                      <input type="file" accept="application/pdf" className="form-control" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div className="col-sm-5" style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                      {loading ? "Processing..." : "Upload & Parse"}
                    </button>
                    <button className="btn btn-success" onClick={handleSave} disabled={!parsedData || loading}>
                      Save & Update Preview
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">{error}</div>
                )}

                {parsedData ? (
                  <div className="border rounded" style={{ maxHeight: 600, overflow: 'auto', padding: 12 }}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <input className="form-control" value={parsedData.full_name || ""} onChange={(e) => handleFieldChange("full_name", e.target.value)} placeholder="Full Name" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <input className="form-control" value={parsedData.title || ""} onChange={(e) => handleFieldChange("title", e.target.value)} placeholder="Title" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <input className="form-control" value={parsedData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="Email" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <input className="form-control" value={parsedData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="Phone" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <input className="form-control" value={parsedData.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} placeholder="Location" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <textarea className="form-control" rows="4" value={parsedData.summary || ""} onChange={(e) => handleFieldChange("summary", e.target.value)} placeholder="Career Summary" />
                        </div>
                      </div>
                    </div>

                    <section style={{ marginTop: 16 }}>
                      <h5>Education</h5>
                      {(parsedData?.education || []).map((edu, i) => (
                        <div key={`edu-${i}`} className="card" style={{ marginBottom: 10 }}>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={edu.degree || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], degree: e.target.value }; handleFieldChange("education", list); }} placeholder="Degree" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={edu.institution || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], institution: e.target.value }; handleFieldChange("education", list); }} placeholder="Institution" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={edu.start_year || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("education", list); }} placeholder="Start Year" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={edu.end_year || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("education", list); }} placeholder="End Year" />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-group">
                                  <textarea className="form-control" rows="2" value={edu.description || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], description: e.target.value }; handleFieldChange("education", list); }} placeholder="Description" />
                                </div>
                              </div>
                              <div className="col-12">
                                <button className="btn btn-danger btn-sm" onClick={() => removeEducation(i)}>Remove</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div>
                        <button className="btn btn-secondary btn-sm" onClick={addEducation}>+ Add Education</button>
                      </div>
                    </section>

                    <section style={{ marginTop: 16 }}>
                      <h5>Experience</h5>
                      {(parsedData?.experience || []).map((exp, i) => (
                        <div key={`exp-${i}`} className="card" style={{ marginBottom: 10 }}>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={exp.company || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], company: e.target.value }; handleFieldChange("experience", list); }} placeholder="Company" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={exp.title || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], title: e.target.value }; handleFieldChange("experience", list); }} placeholder="Job Title" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={exp.start_year || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("experience", list); }} placeholder="Start Year" />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={exp.end_year || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("experience", list); }} placeholder="End Year" />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-group">
                                  <textarea className="form-control" rows="3" value={(exp.description || []).join("\n")} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }; handleFieldChange("experience", list); }} placeholder="One bullet per line" />
                                </div>
                              </div>
                              <div className="col-12">
                                <button className="btn btn-danger btn-sm" onClick={() => removeExperience(i)}>Remove</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div>
                        <button className="btn btn-secondary btn-sm" onClick={addExperience}>+ Add Experience</button>
                      </div>
                    </section>

                    <section style={{ marginTop: 16 }}>
                      <h5>Projects</h5>
                      {(parsedData?.projects || []).map((proj, i) => (
                        <div key={`proj-${i}`} className="card" style={{ marginBottom: 10 }}>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input className="form-control" value={proj.project_name || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], project_name: e.target.value }; handleFieldChange("projects", list); }} placeholder="Project Name" />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <input className="form-control" value={proj.start_year || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("projects", list); }} placeholder="Start Year" />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <input className="form-control" value={proj.end_year || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("projects", list); }} placeholder="End Year" />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-group">
                                  <textarea className="form-control" rows="3" value={(proj.description || []).join("\n")} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }; handleFieldChange("projects", list); }} placeholder="One bullet per line" />
                                </div>
                              </div>
                              <div className="col-12">
                                <button className="btn btn-danger btn-sm" onClick={() => removeProject(i)}>Remove</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div>
                        <button className="btn btn-secondary btn-sm" onClick={addProject}>+ Add Project</button>
                      </div>
                    </section>

                    <section style={{ marginTop: 16 }}>
                      <h5>Technical Skills</h5>
                      <div className="form-group">
                        <textarea className="form-control" rows="2" value={(parsedData?.technical_skills || []).join(", ")} onChange={(e) => handleFieldChange("technical_skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Comma-separated skills" />
                      </div>
                    </section>

                    <section style={{ marginTop: 16 }}>
                      <h5>Certifications</h5>
                      <div className="form-group">
                        <textarea className="form-control" rows="2" value={(parsedData?.certifications || []).join(", ")} onChange={(e) => handleFieldChange("certifications", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Comma-separated certifications" />
                      </div>
                    </section>

                    <section style={{ marginTop: 16 }}>
                      <h5>Languages</h5>
                      <div className="form-group">
                        <textarea className="form-control" rows="2" value={(parsedData?.languages || []).join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Comma-separated languages" />
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-muted">No resume parsed yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-5">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: 0 }}>Resume Preview</h5>
              </div>
              <div className="card-body">
                {pdfUrl ? (
                  <div className="embed-responsive embed-responsive-4by3">
                    <iframe title="Resume Preview" src={pdfUrl} className="embed-responsive-item" style={{ width: '100%', height: 600, border: '1px solid #eaeaea', borderRadius: 4 }} />
                  </div>
                ) : (
                  <div className="text-muted" style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No preview available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


