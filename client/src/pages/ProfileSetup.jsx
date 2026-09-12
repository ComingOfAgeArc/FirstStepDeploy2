//pages/ProfileSetup(for seeker)
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import "../styles/ProfileSetup.css";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resumeUrl: '',
    personalDetails: { phone: '', address: '', bio: '' },
    education: [{ school: '', degree: '', field: '', startYear: '', endYear: '' }],
    experience: [{ company: '', role: '', duration: '' }],
    skills: [''],
      certifications: [{ name: '' }],  
  projects: [{ title: '' }], 
    externalLinks: { github: '', portfolio: '', linkedin: '' }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/seeker/profile');
        if (res.data?.profile?.personalDetails?.phone) {
          navigate('/main-seeker');
        } else {
          setFormData(prev => ({ ...prev, ...res.data.profile }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e, section, index, field) => {
    const { name, value } = e.target;

    if (section) {
      setFormData(prev => {
        const updatedSection = [...prev[section]];
        updatedSection[index][field] = value;
        return { ...prev, [section]: updatedSection };
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e, section, index) => {
    const { value } = e.target;
    setFormData(prev => {
      const updated = [...prev[section]];
      updated[index] = value;
      return { ...prev, [section]: updated };
    });
  };

  const handleAddItem = (section, itemTemplate = '') => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], itemTemplate]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only validate name, email, and phone
    const { name, email, personalDetails: { phone } } = formData;
    if (!name || !email || !phone) {
      alert('Name, Email, and Phone are required!');
      return;
    }

    try {
        console.log(formData);
      await api.put('/seeker/update', formData);
      navigate('/main-seeker');
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <>
    <Header></Header>
    <div className="profile-setup">
      <h2>Complete Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Name: <input name="name" value={formData.name} onChange={handleChange} required /></label>
        <label>Email: <input name="email" value={formData.email} onChange={handleChange} required /></label>
        <label>Resume URL: <input name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} /></label>

        <label>Phone: <input name="personalDetails.phone" value={formData.personalDetails.phone} onChange={handleChange} required /></label>
        <label>Address: <input name="personalDetails.address" value={formData.personalDetails.address} onChange={handleChange} /></label>
        <label>Bio: <textarea name="personalDetails.bio" value={formData.personalDetails.bio} onChange={handleChange} /></label>

        <h4>Education</h4>
        {formData.education.map((edu, i) => (
          <div key={i}>
            <input placeholder="School" value={edu.school} onChange={(e) => handleChange(e, 'education', i, 'school')} />
            <input placeholder="Degree" value={edu.degree} onChange={(e) => handleChange(e, 'education', i, 'degree')} />
            <input placeholder="Field" value={edu.field} onChange={(e) => handleChange(e, 'education', i, 'field')} />
            <input placeholder="Start Year" value={edu.startYear} onChange={(e) => handleChange(e, 'education', i, 'startYear')} />
            <input placeholder="End Year" value={edu.endYear} onChange={(e) => handleChange(e, 'education', i, 'endYear')} />
          </div>
        ))}
        <button type="button" onClick={() => handleAddItem('education', { school: '', degree: '', field: '', startYear: '', endYear: '' })}>+ Add Education</button>

        <h4>Experience</h4>
        {formData.experience.map((exp, i) => (
          <div key={i}>
            <input placeholder="Company" value={exp.company} onChange={(e) => handleChange(e, 'experience', i, 'company')} />
            <input placeholder="Role" value={exp.role} onChange={(e) => handleChange(e, 'experience', i, 'role')} />
            <input placeholder="Duration" value={exp.duration} onChange={(e) => handleChange(e, 'experience', i, 'duration')} />
          </div>
        ))}
        <button type="button" onClick={() => handleAddItem('experience', { company: '', role: '', duration: '' })}>+ Add Experience</button>

        <h4>Skills</h4>
        {formData.skills.map((skill, i) => (
          <input key={i} placeholder="Skill" value={skill} onChange={(e) => handleArrayChange(e, 'skills', i)} />
        ))}
        <button type="button" onClick={() => handleAddItem('skills')}>+ Add Skill</button>

        <h4>Certifications</h4>
          {formData.certifications.map((cert, i) => (
            <input
              key={i}
              placeholder="Certification"
              value={cert.name}
              onChange={(e) => handleChange(e, 'certifications', i, 'name')}
            />
          ))}
          <button type="button" onClick={() => handleAddItem('certifications', { name: '' })}>+ Add Certification</button>

       <h4>Projects</h4>
        {formData.projects.map((proj, i) => (
          <input
            key={i}
            placeholder="Project Title"
            value={proj.title}
            onChange={(e) => handleChange(e, 'projects', i, 'title')}
          />
        ))}
        <button type="button" onClick={() => handleAddItem('projects', { title: '' })}>+ Add Project</button>


        <h4>External Links</h4>
        <label>GitHub: <input name="externalLinks.github" value={formData.externalLinks.github} onChange={handleChange} /></label>
        <label>Portfolio: <input name="externalLinks.portfolio" value={formData.externalLinks.portfolio} onChange={handleChange} /></label>
        <label>LinkedIn: <input name="externalLinks.linkedin" value={formData.externalLinks.linkedin} onChange={handleChange} /></label>

        <button type="submit">Save Profile</button>
      </form>
    </div></>
  );
};

export default ProfileSetup;

