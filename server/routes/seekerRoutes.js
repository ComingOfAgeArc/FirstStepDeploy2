// routes/seekerRoutes.js
import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Application from '../models/Application.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Update MY profile. No :uid in the URL — the identity comes from the
// verified token, so a seeker can never update another seeker's profile
// just by changing an id in the request.
router.put('/update', verifyFirebaseToken, async (req, res) => {
  const uid = req.uid;
  const updateData = req.body;

  // Never allow the client to change which account a document belongs to
  delete updateData.uid;
  delete updateData.email; // email is controlled by Firebase auth, not free text

  try {
    const updated = await JobSeeker.findOneAndUpdate(
      { uid },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Seeker not found' });
    res.status(200).json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ✅ Get MY dashboard info (profile + applications)
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  const uid = req.uid;
  try {
    const seeker = await JobSeeker.findOne({ uid }).lean();
    if (!seeker) return res.status(404).json({ error: 'Seeker not found' });

    const applications = await Application.find({ applicant: seeker._id })
      .populate({
        path: 'job',
        populate: {
          path: 'createdBy',
          select: 'company name'
        }
      })
      .lean();

    const appliedJobs = applications.map(app => ({
      job: {
      title: app.job?.title,
      createdBy: {
        name: app.job?.createdBy?.name,
        company: app.job?.createdBy?.company
      }
    },
    score: app.score,
    stage: app.stage
  }));
    console.log(JSON.stringify(applications, null, 2));

    res.status(200).json({ profile: seeker, appliedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
});

export default router;
