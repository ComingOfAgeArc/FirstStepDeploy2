
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'recruiter'], required: true },
  name: String,
  company: String,
  resumeUrl: String,
});

const User = mongoose.model('User', userSchema);

export default User;
