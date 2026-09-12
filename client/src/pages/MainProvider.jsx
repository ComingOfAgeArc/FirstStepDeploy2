import "../styles/MainProvider.css";
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const MainProvider = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [expandedApplicants, setExpandedApplicants] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/recruiter/profile");
        setProfile(res.data.profile);
        setFormData(res.data.profile);
        await fetchJobs(res.data.profile._id);
      } catch (err) {
        console.error("Error fetching recruiter profile:", err);
      }
    };
    fetchData();
  }, []);

  // Resume scoring happens in the background after a seeker applies, so it
  // may still be running when a recruiter is already looking at this page.
  // Poll periodically so scores/status show up without a manual reload.
  useEffect(() => {
    if (!profile?._id) return;
    const interval = setInterval(() => {
      fetchJobs(profile._id);
    }, 10000);
    return () => clearInterval(interval);
  }, [profile?._id]);

  const fetchJobs = async (recruiterId) => {
    try {
      const res = await api.get(`/jobs/recruiter/${recruiterId}`);
      const jobsData = res.data.jobs;
      setJobs(jobsData);

      const applicantsByJobData = {};
      await Promise.all(
        jobsData.map(async (job) => {
          // Protected route — only works because the axios interceptor
          // attaches this recruiter's own ID token; the server checks
          // ownership of each job before returning its applicants.
          const applicantsRes = await api.get(`/jobs/applicants/${job._id}`);
          applicantsByJobData[job._id] = applicantsRes.data.applications || [];
        }),
      );
      setApplicantsByJob(applicantsByJobData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const toggleApplicantDetails = (appId) => {
    setExpandedApplicants((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const toggleJobApplicants = (jobId) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put("/recruiter/update", formData);
      setProfile(res.data.profile);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating recruiter profile:", err);
    }
  };

  const handleStage = async (appId, field, value) => {
    try {
      await api.put(`/applications/update/${appId}`, { [field]: value });
      fetchJobs(profile._id);
    } catch (err) {
      console.error("Failed to update stage/score:", err);
    }
  };

  return (
    <>
      <Header />

      <div className="main-container">
        {/* PROFILE - FULL WIDTH */}
        <div className="profile-section">
          <h2>Welcome, {profile?.name || "Recruiter"}</h2>
          {!editMode ? (
            <div className="profile-view">
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Name:</strong> {profile?.name}
              </p>
              <p>
                <strong>Company:</strong> {profile?.company}
              </p>
              <p>
                <strong>Position:</strong> {profile?.position}
              </p>
              <p>
                <strong>Website:</strong> {profile?.companyDetails?.website}
              </p>
              <p>
                <strong>Size:</strong> {profile?.companyDetails?.size}
              </p>
              <p>
                <strong>Industry:</strong> {profile?.companyDetails?.industry}
              </p>
              <p>
                <strong>Location:</strong> {profile?.companyDetails?.location}
              </p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          ) : (
            <div className="profile-form">
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Name"
              />
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Email"
              />
              <input
                name="company"
                value={formData.company || ""}
                onChange={handleChange}
                placeholder="Company"
              />
              <input
                name="position"
                value={formData.position || ""}
                onChange={handleChange}
                placeholder="Position"
              />
              <input
                name="companyDetails.website"
                value={formData.companyDetails?.website || ""}
                onChange={handleChange}
                placeholder="Website"
              />
              <input
                name="companyDetails.size"
                value={formData.companyDetails?.size || ""}
                onChange={handleChange}
                placeholder="Company Size"
              />
              <input
                name="companyDetails.industry"
                value={formData.companyDetails?.industry || ""}
                onChange={handleChange}
                placeholder="Industry"
              />
              <input
                name="companyDetails.location"
                value={formData.companyDetails?.location || ""}
                onChange={handleChange}
                placeholder="Location"
              />
              <div className="profile-buttons">
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* JOB LISTINGS - GRID */}
        <h3>Job Openings</h3>
        <button className="add-job-btn" onClick={() => navigate("/add-job")}>
          Add New Job
        </button>

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h4>{job.title}</h4>
              <strong>{job.description}</strong>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Type:</strong> {job.employmentType}
              </p>

              <button
                className="toggle-applicants-btn"
                onClick={() => toggleJobApplicants(job._id)}
              >
                {expandedJobs[job._id] ? "Hide Applicants" : "Show Applicants"}
              </button>

              {expandedJobs[job._id] && (
                <div className="applicants-list">
                  {(applicantsByJob[job._id] || []).map((app) => (
                    <div key={app._id} className="applicant-card">
                      <div
                        className="applicant-header"
                        onClick={() => toggleApplicantDetails(app._id)}
                      >
                        <strong>{app.applicant?.name}</strong> ▼
                      </div>
                      {expandedApplicants[app._id] && (
                        <div className="applicant-details">
                          <p>
                            <strong>Email:</strong> 
                                {
                              <span style={{ color: "#c99b6d" }}>
                                {app.applicant?.email}
                              </span>
                            }
                          </p>
                          <p>
                            <strong>Resume:</strong>{" "}
                           <a
                              href={`${app.resumeUrl}?fl_attachment=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download Resume
                            </a>
                          </p>
                          {/* <p><strong>Cover Letter:</strong> {app.coverLetter}</p> */}
                          <p>
                            <strong>Score:</strong>{" "}
                            {app.scoringStatus === "pending" && (
                              <span style={{ color: "#b8860b" }}>
                                Scoring in progress…
                              </span>
                            )}
                            {app.scoringStatus === "failed" && (
                              <span style={{ color: "#c0392b" }}>
                                Scoring failed
                                {app.scoringError ? ` (${app.scoringError})` : ""}
                              </span>
                            )}

                            {(app.scoringStatus === "completed" ||
                              !app.scoringStatus) &&
                              (
                                <span style={{ color: "#c99b6d" }}>
                                  {app.score ?? 0}
                                </span>
                                
                              )}
                          </p>
                          <p>
                            <strong>Stage:</strong>
                            <select
                              value={app.stage || "Applied"}
                              onChange={(e) =>
                                handleStage(app._id, "stage", e.target.value)
                              }
                            >
                              <option>Applied</option>
                              <option>Shortlisted</option>
                              <option>Interview Scheduled</option>
                              <option>Offered</option>
                              <option>Rejected</option>
                            </select>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MainProvider;
