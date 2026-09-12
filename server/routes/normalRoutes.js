import express from 'express';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';


const router = express.Router();

// Protected + ownership-checked, same rule as /api/applications/update/:appId
router.put('/applications/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter) return res.status(403).json({ error: 'Recruiters only.' });

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (String(application.job.createdBy) !== String(recruiter._id)) {
      return res.status(403).json({ error: 'You do not own the job for this application.' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;