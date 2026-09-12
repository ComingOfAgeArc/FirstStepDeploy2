// server/routes/applicationRoutes.js
import express from "express";
import axios from "axios";
import multer from "multer";
import { scoreResume } from "../utils/scoreResume.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import JobSeeker from "../models/jobSeeker.js";
import Recruiter from "../models/Recruiter.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

// Multer storage setup

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Update stage — only the recruiter who owns the job may change it.
router.put("/update/:appId", verifyFirebaseToken, async (req, res) => {
  const { appId } = req.params;
  const updateFields = req.body; // e.g., { stage: "Shortlisted" }

  try {
    const recruiter = await Recruiter.findOne({ uid: req.uid });
    if (!recruiter)
      return res.status(403).json({ message: "Recruiters only." });

    const application = await Application.findById(appId).populate("job");
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (String(application.job.createdBy) !== String(recruiter._id)) {
      return res
        .status(403)
        .json({ message: "You do not own the job for this application." });
    }

    const updated = await Application.findByIdAndUpdate(
      appId,
      { $set: updateFields },
      { new: true },
    );

    res.json({
      message: "Application updated successfully",
      application: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/applications/apply — the applicant is always the verified
// signed-in user, never a seekerId the client hands us in the form data.
router.post(
  "/apply",
  verifyFirebaseToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId, coverLetter, applicantMessage } = req.body;
      const resumeFile = req.file;

      if (!resumeFile)
        return res.status(400).json({ error: "Resume file is required" });

      console.log("Resume File:", resumeFile);

       const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
        {
            folder: "resumes",
            resource_type: "raw",
            public_id: `resumes/${Date.now()}-${resumeFile.originalname.replace(/\.[^/.]+$/, "")}`,
            format: "pdf",
            overwrite: false,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(resumeFile.buffer).pipe(stream);
      });

      console.log("uploadResult", uploadResult);
      if (!jobId) return res.status(400).json({ error: "Job ID is required" });

      const job = await Job.findById(jobId);
      const seeker = await JobSeeker.findOne({ uid: req.uid });

      if (!job || !seeker)
        return res.status(404).json({ error: "Job or seeker not found" });

      const existing = await Application.findOne({
        job: jobId,
        applicant: seeker._id,
      });
      if (existing)
        return res.status(400).json({ error: "Already applied to this job" });

      const newApp = new Application({
        job: jobId,
        applicant: seeker._id,
        coverLetter,
        applicantMessage,
        resumeUrl: uploadResult.secure_url,
        stage: "Applied",
        appliedAt: new Date(),
      });

      await newApp.save();

      seeker.applications.push(newApp._id);
      await seeker.save();
      res.status(201).json({
        message: "Application submitted successfully",
        application: newApp,
      });

      setImmediate(async () => {
        try {
          console.log("Background scoring started:", newApp._id);

          await scoreResume(newApp._id);

          console.log("Background scoring completed:", newApp._id);
        } catch (err) {
          console.error("Background scoring failed:", err.message);

          // Previously the score was just left at its default of 0 with no
          // way to tell "not scored yet" apart from "scoring broke" — record
          // the failure so the recruiter dashboard can show it clearly.
          try {
            await Application.findByIdAndUpdate(newApp._id, {
              scoringStatus: "failed",
              scoringError: err.message,
            });
          } catch (saveErr) {
            console.error(
              "Failed to record scoring failure:",
              saveErr.message
            );
          }
        }
      });
    } catch (err) {
      console.error("Server error while applying:", err);
      res.status(500).json({ error: "Server error while applying" });
    }
  },
);

export default router;
