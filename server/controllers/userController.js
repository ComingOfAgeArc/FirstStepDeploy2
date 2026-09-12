// server/controllers/userController.js
import User from '../models/user.js';

export const registerUser = async (req, res) => {
  const { uid, email, role, name, company, resumeUrl } = req.body;

  try {
    const newUser = new User({
      uid,
      email,
      role,
      name,
      company: role === 'recruiter' ? company : '',
      resumeUrl: role === 'seeker' ? resumeUrl || '' : '',
    });

    await newUser.save();
    res.status(201).json({ message: 'User saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user' });
  }
};
