import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/AddJobForm.css'

export default function AddJobForm({ onJobAdded }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salaryRange: '',
    employmentType: '',
    experienceLevel: '',
    remoteType: '',
    skillsRequired: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      ...formData,
      skillsRequired: formData.skillsRequired
        ? formData.skillsRequired.split(',').map((skill) => skill.trim())
        : [],
      // No createdBy here — the server looks up the recruiter from the
      // verified ID token, so a recruiter can only ever post jobs as themself.
    };

    try {
      await api.post('/jobs/create', jobData);
      alert('Job posted!');
      if (onJobAdded) onJobAdded();

      navigate('/main-provider');
    } catch (error) {
      console.error('Error adding job:', error);
      alert(error.response?.data?.error || 'Failed to post job.');
    }
  };

 return (
  <>
  <Header></Header>
  <div id="ok">
  <div className="add-job-container">
    <h2>Post a New Job</h2>
    <form onSubmit={handleSubmit}>
      <input name="title" onChange={handleChange} placeholder="Job Title" required />
      {/* <input name="creator" onChange={handleChange} placeholder="Company Name" required /> */}
      <textarea name="description" onChange={handleChange} placeholder="Description" />
      <input name="requirements" onChange={handleChange} placeholder="Requirements" />
      <input name="location" onChange={handleChange} placeholder="Location" />
      <input name="salaryRange" onChange={handleChange} placeholder="Salary Range" />
      <input name="employmentType" onChange={handleChange} placeholder="Full-time / Part-time" />
      <input name="experienceLevel" onChange={handleChange} placeholder="Entry / Mid / Senior" />
      <input name="remoteType" onChange={handleChange} placeholder="Remote / On-site" />
      <input name="skillsRequired" onChange={handleChange} placeholder="Skills (comma-separated)" />
      <button type="submit">Post Job</button>
    </form>
  </div>
  </div>
  </>
);

}
