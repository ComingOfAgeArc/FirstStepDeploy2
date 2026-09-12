// models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },

  coverLetter: String,
  resumeUrl: String,
  applicantMessage: String,

  score: { type: Number, default: 0 },

  // Tracks the async Gemini scoring job so the UI can tell "not scored yet"
  // and "scoring failed" apart from a genuine score of 0.
  scoringStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  scoringError: {
    type: String,
    default: ''
  },

  stage: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'],
    default: 'Applied'
  },
  feedback: {
      type: String,
      default: ""
  },

  matchedSkills: {
      type: [String],
      default: []
  },

  missingSkills: {
      type: [String],
      default: []
  },

  appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
