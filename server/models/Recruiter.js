import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique:true },
  name: { type: String, required: true },
  company: { type: String, default: '' },
  position: { type: String, default: '' },

  companyDetails: {
    website: { type: String, default: '' },
    size: { type: String, default: '' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' }
  },

  contact: {
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },

  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export default Recruiter;
