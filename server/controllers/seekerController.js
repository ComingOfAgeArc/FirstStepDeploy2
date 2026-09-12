import Seeker from '../models/jobSeeker.js';

export const getProfile = async (req, res) => {
  const email = req.user.email;
  const seeker = await Seeker.findOne({ email });
  if (!seeker) return res.status(404).json({ message: 'Profile not found' });
  res.json(seeker);
};

export const updateProfile = async (req, res) => {
  const email = req.user.email;
  const updates = req.body;

  const seeker = await Seeker.findOneAndUpdate({ email }, { $set: updates }, { new: true, upsert: true });
  res.json(seeker);
};
