// models/Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // creator: {type : String},
  description: { type: String },
  requirements: { type: String },
  location: { type: String },
  salaryRange: { type: String },
  employmentType: { type: String }, // Full-time, Part-time, Internship
  experienceLevel: { type: String }, // Entry, Mid, Senior
  remoteType: { type: String }, // Remote, On-site, Hybrid
  skillsRequired: [String],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  // applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],

  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
