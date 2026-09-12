// src/pages/AvailableJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';
import '../styles/AvailableJobs.css';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/all');
        setJobs(res.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="available-jobs">
          <h2>Available Jobs</h2>
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.createdBy?.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Skills Required:</strong> {job.skillsRequired.join(', ')}</p>
              <button onClick={() => handleApply(job._id)}>Apply</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AvailableJobs;
