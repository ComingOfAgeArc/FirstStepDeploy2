// src/pages/ApplyJob.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/ApplyJob.css';
import Header from '../components/Header';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  // const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  // const [applicantMessage, setApplicantMessage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job:', err);
      }
    };
    fetchJob();
  }, [jobId]);

  // ✅ Handle file input with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { 
      alert('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
  };

 const handleSubmit = async () => {
  if (!resumeFile) {
    alert('Please upload your resume in PDF format.');
    return;
  }

  const formData = new FormData();
  formData.append('jobId', job._id);
  // formData.append('coverLetter', coverLetter);
  // formData.append('applicantMessage', applicantMessage);
  formData.append('resume', resumeFile);

  try {
    // 1️⃣ Submit application (store resume & details). seekerId is
    // derived server-side from the verified ID token — never sent by
    // the client — so no one can submit an application as someone else.
    const res = await api.post(
      '/applications/apply',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );


setMessage("Application submitted successfully!");

setTimeout(() => navigate("/main-seeker"), 1000);

    // const applicationId = res.data.application._id;

    // // 2️⃣ Call Gemini scoring route
    // const scoreRes = await api.post(`/score-resume/${applicationId}`);

    // setMessage(`Application submitted! Score: ${scoreRes.data.score}`);
    setTimeout(() => navigate('/main-seeker'), 2000);
  } catch (err) {
    console.error('Error submitting application or calculating score:', err);
    setMessage('Failed to apply');
  }
};


  if (!job) return <p>Loading job details...</p>;

  return (
    <>
      <Header />
      <div className="ok">
      <div className="apply-job-page">
        <h2>Apply for {job.title}</h2>

        <div className="job-details">
          <p><strong>Description:</strong> {job.description}</p>
          <p><strong>Requirements:</strong> {job.requirements}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Salary Range:</strong> {job.salaryRange}</p>
          <p><strong>Employment Type:</strong> {job.employmentType}</p>
          <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
          <p><strong>Remote Type:</strong> {job.remoteType}</p>
          <p><strong>Skills Required:</strong> {job.skillsRequired.join(', ')}</p>
        </div>

        <div className="application-form">
          {/* <label>Cover Letter:</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          /> */}

          <label>Resume (PDF only):</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {resumeFile && (
            <p>
              Selected file: <strong>{resumeFile.name}</strong>{' '}
              <a
                href={URL.createObjectURL(resumeFile)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview
              </a>
            </p>
          )}

          {/* <label>Message to Recruiter:</label>
          <textarea
            value={applicantMessage}
            onChange={(e) => setApplicantMessage(e.target.value)}
          /> */}

          <button onClick={handleSubmit} disabled={!resumeFile}>
            Submit Application
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
      </div>
    </>
  );
};

export default ApplyJob;

