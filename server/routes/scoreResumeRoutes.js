// server/routes/scoreResumeRoutes.js
import express from "express";
import fs from "fs";
import { promisify } from "util";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ works with pdf-parse@1.1.1
import axios from "axios";
import { scoreResume } from "../utils/scoreResume.js";
import Application from "../models/Application.js";
import JobSeeker from "../models/jobSeeker.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const readFile = promisify(fs.readFile);



// POST /api/score-resume/:applicationId
router.post("/:applicationId", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await scoreResume(req.params.applicationId, req.uid);

    res.json({
      message: "Resume evaluated successfully",
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      summary: result.summary
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});




// router.post("/:applicationId", verifyFirebaseToken, async (req, res) => {
//   const { applicationId } = req.params;
//   console.log("=== SCORE RESUME REQUEST ===");
//   console.log("Application ID:", applicationId);

//   try {
//     // 1️⃣ Find the application
//     const application = await Application.findById(applicationId).populate(
//       "job"
//     );
//     if (!application) {
//       console.error("Application not found");
//       return res.status(404).json({ error: "Application not found" });
//     }

//     // Only the seeker who submitted this application can trigger scoring
//     const seeker = await JobSeeker.findOne({ uid: req.uid });
//     if (!seeker || String(application.applicant) !== String(seeker._id)) {
//       return res.status(403).json({ error: "Not your application" });
//     }

//     // 2️⃣ Check resume file exists
//     if (!application.resumeUrl) {
//       console.error("Resume not found for this application");
//       return res
//         .status(400)
//         .json({ error: "Resume not found for this application" });
//     }

//     const resumePath = `.${application.resumeUrl}`;
//     console.log("Resume path:", resumePath);
//     if (!fs.existsSync(resumePath)) {
//       console.error("Resume file does not exist on server");
//       return res
//         .status(404)
//         .json({ error: "Resume file does not exist on server" });
//     }

//     // 3️⃣ Parse PDF
//     const dataBuffer = await readFile(resumePath);
//     const pdfData = await pdfParse(dataBuffer);
//     const resumeText = (pdfData.text || "").substring(0, 12000);
//     if (!resumeText) {
//       console.warn("Resume PDF is empty");
//     }

//     // 4️⃣ Check Gemini API key
//     if (!process.env.GEMINI_API_KEY) {
//       console.error("GEMINI_API_KEY is missing");
//       return res
//         .status(500)
//         .json({ error: "Server misconfiguration: GEMINI_API_KEY missing" });
//     }

//     // 5️⃣ Build Gemini prompt
//     // 5️⃣ Build Gemini prompt
//     const jobSkills = application.job.skillsRequired || [];
//     const prompt = `
//       You are an experienced ATS (Applicant Tracking System) and technical recruiter.

//       Evaluate how well the candidate's resume matches the job.

//       =========================
//       JOB TITLE
//       ${application.job.title}

//       JOB DESCRIPTION
//       ${application.job.description}

//       JOB REQUIREMENTS
//       ${application.job.requirements}

//       REQUIRED SKILLS
//       ${jobSkills.join(", ")}

//       EXPERIENCE LEVEL
//       ${application.job.experienceLevel}

//       =========================
//       RESUME
//       ${resumeText}

//       =========================

//       Evaluation Criteria (100 marks total)

//       1. Skills Match (40)
//       - Compare required skills with the resume.
//       - Give partial credit for related technologies.
//       - Do not require exact keyword matches.

//       2. Projects (20)
//       - Relevant academic or personal projects should receive credit.

//       3. Experience (20)
//       - Relevant internships, freelance or work experience receive credit.
//       - Freshers should not be heavily penalized.

//       4. Education (10)
//       - Relevant education receives credit.

//       5. Overall Fit (10)
//       - Consider whether the candidate is likely to perform well in the role.

//       Guidelines

//       - Evaluate like an experienced recruiter.
//       - Reward relevant knowledge, projects and transferable skills.
//       - Do not reward resume formatting or resume length.
//       - Do not give 100 unless the candidate is an exceptional fit.
//       - Completely unrelated resumes should usually score below 25.
//       - Average freshers applying for suitable jobs should usually score between 55 and 75.
//       - Good candidates should generally score between 75 and 90.

//       Return ONLY valid JSON.

//       {
//         "score": 0,
//         "matchedSkills": [],
//         "missingSkills": [],
//         "strengths": [],
//         "weaknesses": [],
//         "summary": ""
//       }

//     `;

//     // 6️⃣ Call Gemini API
//     let geminiResponse;
//     try {
//       const GEMINI_URL =
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

//      geminiResponse = await axios.post(
//       `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: prompt }]
//           }
//         ]
//       },
//       {
//         headers: {
//           "Content-Type": "application/json"
//         }
//       }
//     );
//       // const GEMINI_URL =
//       //   "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

//       // geminiResponse = await axios.post(
//       //   `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
//       //   {
//       //     contents: [
//       //       {
//       //         parts: [{ text: prompt }],
//       //       },
//       //     ],
//       //   },
//       //   {
//       //     headers: { "Content-Type": "application/json" },
//       //   }
//       // );
//     } catch (geminiErr) {
//       console.error(
//         "Error calling Gemini API:",
//         geminiErr.response?.data || geminiErr.message
//       );
//       return res.status(500).json({ error: "Failed to call Gemini API" });
//     }

//     // 7️⃣ Extract score
//     const raw = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//       console.log(raw);

//     // Remove ```json if Gemini returns markdown
//     const cleaned = raw
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     let result;

//     try {
//       result = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("Invalid Gemini JSON");
//       return res.status(500).json({
//         error: "Gemini returned invalid JSON",
//         raw
//       });
//     }
//     // const scoreText =
//     //   geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
//     // console.log("Gemini raw score text:", scoreText);
//     // const score = parseInt(scoreText, 10);
//     // if (isNaN(score)) {
//     //   console.warn("Gemini returned invalid score:", scoreText);
//     //   return res
//     //     .status(500)
//     //     .json({ error: "Gemini API returned invalid score" });
//     // }

//     // 8️⃣ Save score in DB
//     application.score = result.score;
//     application.feedback = result.summary;
//     application.matchedSkills = result.matchedSkills;
//     application.missingSkills = result.missingSkills;

//     await application.save();


//     res.json({
//       message: "Resume evaluated successfully",
//       score: result.score,
//       matchedSkills: result.matchedSkills,
//       missingSkills: result.missingSkills,
//       strengths: result.strengths,
//       weaknesses: result.weaknesses,
//       summary: result.summary
//     });
//     // console.log("Score saved successfully:", score);
//     // res.json({ message: "Score calculated successfully", score });
//   } catch (err) {
//     console.error("Unexpected server error:", err);
//     res.status(500).json({ error: "Failed to calculate resume score" });
//   }
// });

export default router;
