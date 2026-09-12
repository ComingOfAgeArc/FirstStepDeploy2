// models/JobSeeker.js
import mongoose from 'mongoose';

const jobSeekerSchema = new mongoose.Schema({
   uid: { type: String, required: true },// Firebase UID
  email: { type: String, required: true },
  name: { type: String, required: true },
  resumeUrl: { type: String, default: '' },
  
    personalDetails: {
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' }
    },


  education: [
    {
      degree: String,
      institution: String,
      year: String,
      grade: String
    }
  ],

  experience: [
    {
      company: String,
      position: String,
      duration: String,
      description: String
    }
  ],

  skills: [String],

  certifications: [String
  ],

  projects: [
   String
  ],

  externalLinks: {
    github: String,
    linkedin: String,
    portfolio: String,
    other: String
  },

  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);
export default JobSeeker;
