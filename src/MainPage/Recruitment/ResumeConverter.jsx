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

    const handleUploadWithPreview = async () => {
      if (!file) return;
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('http://localhost:3001/resume/upload-with-preview', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Upload preview failed: ${res.status} ${res.statusText}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    const handleSave = async () => {
      if (!parsedData) return;
      setError(null);
      try {
        const res = await fetch('http://localhost:3001/resume/preview-from-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parsed: parsedData }),
        });
        if (!res.ok) throw new Error(`Update failed: ${res.status} ${res.statusText}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
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
            <div className="col-xl-7 col-lg-5" style={{ paddingRight: "0.75rem" }}>
              <div className="card">
                <div className="card-body" style={{ padding: "1rem 1.25rem" }}>
                  <div className="card" style={{ marginBottom: 20, backgroundColor: '#f8f9fa' }}>
                    <div className="card-body">
                      <h6 className="card-title mb-3" style={{ color: '#042F40' }}>📄 Resume Upload & Processing</h6>
                      <div className="row g-3 align-items-end">
                        <div className="col-sm-8">
                          <div className="form-group">
                            <label className="form-label">Select PDF Resume</label>
                            <input type="file" accept="application/pdf" className="form-control" onChange={handleFileChange} />
                            <small className="form-text text-muted">Upload a PDF resume to parse and edit</small>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="d-grid gap-2">
                            <button className="btn btn-primary" onClick={handleUploadWithPreview} disabled={loading || !file}>
                              {loading ? "⏳ Processing..." : "📤 Upload & Parse"}
                            </button>
                            <button className="btn btn-success" onClick={handleSave} disabled={!parsedData || loading}>
                              💾 Save & Update Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">{error}</div>
                  )}

                  {parsedData ? (
                    <div className="border rounded" style={{ maxHeight: '70vh', overflow: 'auto', padding: 20, backgroundColor: '#f8f9fa' }}>
                      <div className="row">
                        <div className="col-12">
                          <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Basic Information</h5>
                        </div>
                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-control" value={parsedData.full_name || ""} onChange={(e) => handleFieldChange("full_name", e.target.value)} placeholder="Enter full name" />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">Professional Title</label>
                            <input className="form-control" value={parsedData.title || ""} onChange={(e) => handleFieldChange("title", e.target.value)} placeholder="e.g. Software Engineer" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-control" value={parsedData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="your.email@example.com" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-control" value={parsedData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">Location</label>
                            <input className="form-control" value={parsedData.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} placeholder="City, State, Country" />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">Professional Summary</label>
                            <textarea className="form-control" rows="4" value={parsedData.summary || ""} onChange={(e) => handleFieldChange("summary", e.target.value)} placeholder="Brief professional summary highlighting your key strengths and experience..." />
                          </div>
                        </div>
                      </div>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Education</h5>
                        {(parsedData?.education || []).map((edu, i) => (
                          <div key={`edu-${i}`} className="card" style={{ marginBottom: 15, border: '1px solid #e9ecef' }}>
                            <div className="card-body" style={{ padding: 16 }}>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Degree</label>
                                    <input className="form-control" value={edu.degree || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], degree: e.target.value }; handleFieldChange("education", list); }} placeholder="e.g. Bachelor of Science" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Institution</label>
                                    <input className="form-control" value={edu.institution || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], institution: e.target.value }; handleFieldChange("education", list); }} placeholder="University Name" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Start Year</label>
                                    <input className="form-control" value={edu.start_year || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("education", list); }} placeholder="2018" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">End Year</label>
                                    <input className="form-control" value={edu.end_year || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("education", list); }} placeholder="2022" />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="2" value={edu.description || ""} onChange={(e) => { const list = [...(parsedData?.education || [])]; list[i] = { ...list[i], description: e.target.value }; handleFieldChange("education", list); }} placeholder="Additional details about your education..." />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeEducation(i)}>Remove Education</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div>
                          <button className="btn btn-outline-primary btn-sm" onClick={addEducation}>+ Add Education</button>
                        </div>
                      </section>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Work Experience</h5>
                        {(parsedData?.experience || []).map((exp, i) => (
                          <div key={`exp-${i}`} className="card" style={{ marginBottom: 15, border: '1px solid #e9ecef' }}>
                            <div className="card-body" style={{ padding: 16 }}>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Company</label>
                                    <input className="form-control" value={exp.company || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], company: e.target.value }; handleFieldChange("experience", list); }} placeholder="Company Name" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Job Title</label>
                                    <input className="form-control" value={exp.title || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], title: e.target.value }; handleFieldChange("experience", list); }} placeholder="Your Position" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-control" value={exp.start_year || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("experience", list); }} placeholder="Jan 2020" />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input className="form-control" value={exp.end_year || ""} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("experience", list); }} placeholder="Dec 2023 or Present" />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label">Responsibilities & Achievements</label>
                                    <textarea className="form-control" rows="3" value={(exp.description || []).join("\n")} onChange={(e) => { const list = [...(parsedData?.experience || [])]; list[i] = { ...list[i], description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }; handleFieldChange("experience", list); }} placeholder="• Led a team of 5 developers&#10;• Increased performance by 40%&#10;• Implemented new features" />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeExperience(i)}>Remove Experience</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div>
                          <button className="btn btn-outline-primary btn-sm" onClick={addExperience}>+ Add Experience</button>
                        </div>
                      </section>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Projects</h5>
                        {(parsedData?.projects || []).map((proj, i) => (
                          <div key={`proj-${i}`} className="card" style={{ marginBottom: 15, border: '1px solid #e9ecef' }}>
                            <div className="card-body" style={{ padding: 16 }}>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label">Project Name</label>
                                    <input className="form-control" value={proj.project_name || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], project_name: e.target.value }; handleFieldChange("projects", list); }} placeholder="e.g. E-commerce Platform" />
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-control" value={proj.start_year || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], start_year: e.target.value }; handleFieldChange("projects", list); }} placeholder="Jan 2023" />
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input className="form-control" value={proj.end_year || ""} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], end_year: e.target.value }; handleFieldChange("projects", list); }} placeholder="Jun 2023" />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label">Project Description</label>
                                    <textarea className="form-control" rows="3" value={(proj.description || []).join("\n")} onChange={(e) => { const list = [...(parsedData?.projects || [])]; list[i] = { ...list[i], description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }; handleFieldChange("projects", list); }} placeholder="• Built responsive web application&#10;• Used React and Node.js&#10;• Implemented payment integration" />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeProject(i)}>Remove Project</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div>
                          <button className="btn btn-outline-primary btn-sm" onClick={addProject}>+ Add Project</button>
                        </div>
                      </section>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Technical Skills</h5>
                        <div className="form-group">
                          <label className="form-label">Skills (comma-separated)</label>
                          <textarea className="form-control" rows="3" value={(parsedData?.technical_skills || []).join(", ")} onChange={(e) => handleFieldChange("technical_skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git" />
                          <small className="form-text text-muted">Enter skills separated by commas. They will be displayed in 2 columns in the resume.</small>
                        </div>
                        {/* Display skills in 2 columns for preview */}
                        {(parsedData?.technical_skills || []).length > 0 && (
                          <div className="mt-3">
                            <label className="form-label">Preview:</label>
                            <div className="row">
                              <div className="col-md-6">
                                <ul className="list-unstyled">
                                  {(parsedData?.technical_skills || []).filter((_, index) => index % 2 === 0).map((skill, index) => (
                                    <li key={index} className="mb-1">
                                      <span className="badge bg-primary me-1">•</span>
                                      {skill}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul className="list-unstyled">
                                  {(parsedData?.technical_skills || []).filter((_, index) => index % 2 === 1).map((skill, index) => (
                                    <li key={index} className="mb-1">
                                      <span className="badge bg-primary me-1">•</span>
                                      {skill}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </section>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Certifications</h5>
                        <div className="form-group">
                          <label className="form-label">Certifications (comma-separated)</label>
                          <textarea className="form-control" rows="3" value={(parsedData?.certifications || []).join(", ")} onChange={(e) => handleFieldChange("certifications", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="AWS Certified Solutions Architect, Google Cloud Professional, PMP Certification" />
                        </div>
                      </section>

                      <section style={{ marginTop: 24 }}>
                        <h5 className="mb-3" style={{ color: '#042F40', borderBottom: '2px solid #A1CA73', paddingBottom: '8px' }}>Languages</h5>
                        <div className="form-group">
                          <label className="form-label">Languages (comma-separated)</label>
                          <textarea className="form-control" rows="2" value={(parsedData?.languages || []).join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="English (Native), Spanish (Fluent), French (Intermediate)" />
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="text-muted">No resume parsed yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-5" style={{ paddingLeft: "0.75rem", marginBottom: "2rem" }}>
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-header" style={{ backgroundColor: '#042F40', color: 'white' }}>
                  <h5 className="card-title mb-0">📑 Resume Preview</h5>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {pdfUrl ? (
                    <div className="embed-responsive embed-responsive-4by3">
                      <iframe 
                        title="Resume Preview" 
                        src={pdfUrl} 
                        className="embed-responsive-item" 
                        style={{ 
                          width: '100%', 
                          height: '70vh', 
                          border: 'none', 
                          borderRadius: '0 0 4px 4px' 
                        }} 
                      />
                    </div>
                  ) : (
                    <div 
                      className="text-muted d-flex flex-column align-items-center justify-content-center" 
                      style={{ 
                        height: '70vh', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '0 0 4px 4px'
                      }}
                    >
                      <div className="text-center">
                        <i className="fas fa-file-pdf fa-3x mb-3" style={{ color: '#6c757d' }}></i>
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


