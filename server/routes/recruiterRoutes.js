// server/routes/recruiterRoutes.js
import express from 'express';
import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET my posted jobs + applicants
router.get('/my-jobs', verifyFirebaseToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const jobs = await Job.find({ createdBy: recruiter._id })
      .populate({
        path: 'applicants',
        populate: {
          path: 'applicant',
          model: 'JobSeeker',
          select: 'name email education skills resumeUrl'
        }
      });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs with applicants:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my recruiter profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.status(200).json({ profile: recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE my recruiter profile
router.put('/update', verifyFirebaseToken, async (req, res) => {
  const updateData = req.body;
  delete updateData.uid;
  delete updateData.email;

  try {
    const updated = await Recruiter.findOneAndUpdate(
      { uid: req.uid },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Recruiter not found' });

    res.json({ profile: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
