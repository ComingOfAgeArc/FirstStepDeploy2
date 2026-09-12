// routes/userRoutes.js
import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Recruiter from '../models/Recruiter.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Register User
// uid/email now come from the verified Firebase token, never from the request body.
// This guarantees a user can only ever create a profile for their own account.
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const uid = req.uid;
  const email = req.email;
  const { role, name, resumeUrl, company, position } = req.body;

  try {
    if (role === 'seeker') {
      const existing = await JobSeeker.findOne({ uid });
      if (existing) return res.status(200).json({ message: 'Job seeker already exists' });

      const newSeeker = new JobSeeker({
        uid,
        email,
        name,
        resumeUrl: resumeUrl || '',
        personalDetails: {},
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: [],
        externalLinks: {},
        applications: []
      });

      await newSeeker.save();
      return res.status(201).json({ message: 'Job seeker registered' });
    }

    if (role === 'recruiter') {
      const existing = await Recruiter.findOne({ uid });
      if (existing) return res.status(200).json({ message: 'Recruiter already exists' });

      const newRecruiter = new Recruiter({
        uid,
        email,
        name,
        company: company || '',
        position: position || '',
        jobsPosted: []
      });

      await newRecruiter.save();
      return res.status(201).json({ message: 'Recruiter registered' });
    }

    res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ Login User — identity comes from the verified Firebase ID token,
// not from a uid the client hands us. The client only needs to prove
// (via the token) who it is; the server looks up the matching profile.
router.post('/login', verifyFirebaseToken, async (req, res) => {
  const uid = req.uid;

  try {
    const seeker = await JobSeeker.findOne({ uid });
    if (seeker) {
      return res.status(200).json({ role: 'seeker', name: seeker.name, uid });
    }

    const recruiter = await Recruiter.findOne({ uid });
    if (recruiter) {
      return res.status(200).json({ role: 'recruiter', name: recruiter.name, uid });
    }

    res.status(404).json({ error: 'User not found. Please register.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ✅ Convenience endpoint the client can call any time to find out
// "who am I / what's my role" from just the token, no localStorage needed.
router.get('/me', verifyFirebaseToken, async (req, res) => {
  const uid = req.uid;
  try {
    const seeker = await JobSeeker.findOne({ uid });
    if (seeker) return res.status(200).json({ role: 'seeker', name: seeker.name, uid, email: req.email });

    const recruiter = await Recruiter.findOne({ uid });
    if (recruiter) return res.status(200).json({ role: 'recruiter', name: recruiter.name, uid, email: req.email });

    res.status(404).json({ error: 'User not found. Please register.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

export default router;
