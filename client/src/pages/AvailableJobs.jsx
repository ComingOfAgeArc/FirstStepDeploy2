// src/pages/AvailableJobs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';
import '../styles/AvailableJobs.css';

const EMPTY_FILTERS = { location: '', employmentType: '', experienceLevel: '', remoteType: '' };

// Normalise free-text values so "Remote" / "remote " are treated as the same option
const norm = (v) => (v || '').trim().toLowerCase();

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
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

  // Build dropdown options from the jobs that were already fetched
  const filterOptions = useMemo(() => {
    const collect = (field) => {
      const map = new Map();
      jobs.forEach((job) => {
        const key = norm(job[field]);
        if (key && !map.has(key)) map.set(key, job[field].trim());
      });
      return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    };
    return {
      location: collect('location'),
      employmentType: collect('employmentType'),
      experienceLevel: collect('experienceLevel'),
      remoteType: collect('remoteType'),
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = norm(searchTerm);
    return jobs.filter((job) => {
      if (term) {
        const haystack = [job.title, job.createdBy?.company, job.location].map(norm).join(' ');
        if (!haystack.includes(term)) return false;
      }
      return Object.keys(filters).every(
        (field) => !filters[field] || norm(job[field]) === filters[field]
      );
    });
  }, [jobs, searchTerm, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters(EMPTY_FILTERS);
  };

  const hasActiveFilters = searchTerm.trim() !== '' || Object.values(filters).some(Boolean);

  const renderSelect = (name, label) =>
    filterOptions[name].length > 0 && (
      <select name={name} value={filters[name]} onChange={handleFilterChange} aria-label={label}>
        <option value="">{label}</option>
        {filterOptions[name].map(([key, display]) => (
          <option key={key} value={key}>{display}</option>
        ))}
      </select>
    );

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="available-jobs">
          <h2>Available Jobs</h2>

          <div className="job-filters">
            <input
              type="text"
              className="job-search-input"
              placeholder="Search by job title, company or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search jobs"
            />
            {renderSelect('location', 'All Locations')}
            {renderSelect('employmentType', 'All Job Types')}
            {renderSelect('experienceLevel', 'All Experience Levels')}
            {renderSelect('remoteType', 'All Work Modes')}
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </button>
          </div>

          {jobs.length > 0 && filteredJobs.length === 0 && (
            <p className="no-jobs-message">
              No jobs match your search or filters. Try different keywords or clear the filters.
            </p>
          )}

          {filteredJobs.map((job) => (
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
