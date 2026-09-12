// src/pages/MainSeeker.jsx
import '../styles/MainSeeker.css';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

const MainSeeker = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/seeker/profile');
        setProfile(res.data.profile);
        setFormData(res.data.profile);
        setApplications(res.data.appliedJobs || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      skills: e.target.value.split(',').map((s) => s.trim())
    }));
  };

  const handleAddStringItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const handleUpdateStringItem = (field, index, value) => {
    const updated = [...(formData[field] || [])];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const handleRemoveStringItem = (field, index) => {
    const updated = [...(formData[field] || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put('/seeker/update', formData);
      setProfile(res.data.profile);
      setFormData(res.data.profile);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  console.log(applications);

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="seeker-dashboard">
          <div className="dashboard-content">

            {/* Profile Section */}
            <div className="profile-section">
              <h2>{profile?.name || 'Job Seeker'}</h2>
              <h3>Your Profile</h3>

              {!editMode ? (
                <div className="profile-view">
                  {(!profile || !profile.personalDetails?.phone) ? (
                    <p>Profile incomplete. Please fill in your details.</p>
                  ) : (
                    <>
                      <p><strong>Email:</strong> {profile.email}</p>
                      <p><strong>Phone:</strong> {profile.personalDetails?.phone}</p>
                      <p><strong>Address:</strong> {profile.personalDetails?.address}</p>
                      <p><strong>DOB:</strong> {profile.personalDetails?.dob}</p>
                      <p><strong>Gender:</strong> {profile.personalDetails?.gender}</p>
                      <p><strong>Skills:</strong> {profile.skills?.join(', ')}</p>
                      <p><strong>Certifications:</strong> {profile.certifications?.join(', ')}</p>
                      <p><strong>Projects:</strong> {profile.projects?.join(', ')}</p>
                      <p><strong>GitHub:</strong> {profile.externalLinks?.github}</p>
                      <p><strong>LinkedIn:</strong> {profile.externalLinks?.linkedin}</p>
                      <p><strong>Portfolio:</strong> {profile.externalLinks?.portfolio}</p>
                    </>
                  )}
                  <button onClick={() => setEditMode(true)}>Edit Profile</button>
                </div>
              ) : (
                <div className="profile-form">
                  <label>Email: <input name="email" value={formData.email || ''} onChange={handleChange} /></label>
                  <label>Phone: <input name="personalDetails.phone" value={formData.personalDetails?.phone || ''} onChange={handleChange} /></label>
                  <label>Address: <input name="personalDetails.address" value={formData.personalDetails?.address || ''} onChange={handleChange} /></label>
                  <label>DOB: <input name="personalDetails.dob" value={formData.personalDetails?.dob || ''} onChange={handleChange} /></label>
                  <label>Gender: <input name="personalDetails.gender" value={formData.personalDetails?.gender || ''} onChange={handleChange} /></label>
                  <label>Skills (comma-separated): <input name="skills" value={formData.skills?.join(', ') || ''} onChange={handleSkillsChange} /></label>

                  <label>Certifications:</label>
                  {(formData.certifications || []).map((cert, i) => (
                    <div key={i}>
                      <input value={cert} placeholder="Certification name" onChange={(e) => handleUpdateStringItem('certifications', i, e.target.value)} />
                      <button type="button" onClick={() => handleRemoveStringItem('certifications', i)}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddStringItem('certifications')}>+ Add Certification</button>

                  <label>Projects:</label>
                  {(formData.projects || []).map((proj, i) => (
                    <div key={i}>
                      <input value={proj} placeholder="Project title" onChange={(e) => handleUpdateStringItem('projects', i, e.target.value)} />
                      <button type="button" onClick={() => handleRemoveStringItem('projects', i)}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddStringItem('projects')}>+ Add Project</button>

                  <label>GitHub: <input name="externalLinks.github" value={formData.externalLinks?.github || ''} onChange={handleChange} /></label>
                  <label>LinkedIn: <input name="externalLinks.linkedin" value={formData.externalLinks?.linkedin || ''} onChange={handleChange} /></label>
                  <label>Portfolio: <input name="externalLinks.portfolio" value={formData.externalLinks?.portfolio || ''} onChange={handleChange} /></label>

                  <button onClick={handleUpdate}>Save</button>
                </div>
              )}
            </div>

            {/* Applications Section */}
            <div className="applications-section">
              <h3>Jobs You Applied For</h3>
              <button onClick={() => window.location.href = '/available-jobs'}>See Jobs Available</button>

              {applications.length === 0 ? (
                <p>No applications yet.</p>
              ) : (
                <ul>
                  {applications.map((app, idx) => (
                    <li key={idx}>
                      <h4>{app.job.title}</h4>
                      <p><strong>Company:</strong> {app.job.createdBy?.company}</p>
                      <p><strong>Status:</strong> {app.stage}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </>

    
  );
};

export default MainSeeker;


