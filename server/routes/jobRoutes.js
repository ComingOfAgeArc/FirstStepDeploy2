import express from 'express';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: jobs posted by a given recruiter (Mongo id) — job listings are public info
router.get('/recruiter/:recruiterId', async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.params.recruiterId });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Public: all jobs (available jobs page)
router.get('/all', async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Public: single job by id
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('createdBy');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Protected: create a job. The recruiter is derived from the verified
// token, never trusted from the request body — otherwise anyone could
// pass any recruiter's Mongo id in `createdBy` and post jobs on their behalf.
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter) {
      return res.status(403).json({ error: 'Only registered recruiters can post jobs.' });
    }

    const { createdBy, ...jobFields } = req.body; // ignore any client-supplied createdBy

    const job = new Job({
      ...jobFields,
      createdBy: recruiter._id,
    });
    await job.save();

    recruiter.jobsPosted.push(job._id);
    await recruiter.save();

    res.status(201).json({ job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Server error while creating job.' });
  }
});

// Protected: applicant list contains PII (resumes, emails) — only the
// recruiter who owns the job may view it.
router.get('/applicants/:jobId', verifyFirebaseToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter) return res.status(403).json({ error: 'Recruiters only.' });

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (String(job.createdBy) !== String(recruiter._id)) {
      return res.status(403).json({ error: 'You do not own this job posting.' });
    }

    const applications = await Application.find({ job: req.params.jobId }).populate('applicant');
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
