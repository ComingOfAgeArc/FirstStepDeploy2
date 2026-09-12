// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import datab from './config/db.js';
import path from 'path';

import userRoutes from './routes/userRoutes.js';
import normalRoutes from './routes/normalRoutes.js';
import seekerRoutes from './routes/seekerRoutes.js';     // ✅ NEW
import recruiterRoutes from './routes/recruiterRoutes.js'; // ✅ (optional, for recruiter APIs)
import jobRoutes from './routes/jobRoutes.js'; // ✅ (optional, for recruiter APIs)
import applicationRoutes from './routes/applicationRoutes.js';
import scoreResumeRoutes from './routes/scoreResumeRoutes.js';



dotenv.config();
datab(); // ✅ Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());
const __dirname = path.resolve();

// ✅ Mount all routes
app.use('/api/users', userRoutes);         // Register, Login
app.use('/api/seeker', seekerRoutes);      // Profile GET/PUT for seekers
app.use('/api/recruiter', recruiterRoutes);// (future recruiter APIs)
app.use('/api/jobs', jobRoutes);// (future recruiter APIs)
app.use('/api/applications', applicationRoutes);
app.use('/api', normalRoutes); 
app.use('/api/score-resume', scoreResumeRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
