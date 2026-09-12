import { createRequire } from "module";
import axios from "axios";
import Application from "../models/Application.js";
import JobSeeker from "../models/jobSeeker.js";



const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function scoreResume(applicationId, uid = null) {
  const application = await Application.findById(applicationId).populate("job");

  if (!application) {
    throw new Error("Application not found");
  }

  // Optional ownership check
  if (uid) {
    const seeker = await JobSeeker.findOne({ uid });

    if (!seeker) {
      throw new Error("Job seeker not found");
    }

    if (String(application.applicant) !== String(seeker._id)) {
      throw new Error("Not your application");
    }
  }

  if (!application.resumeUrl) {
    throw new Error("Resume not found");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  let buffer;
  try {
    const response = await axios.get(application.resumeUrl, {
      responseType: "arraybuffer",
    });
    buffer = Buffer.from(response.data);
  } catch (err) {
    throw new Error(`Failed to download resume: ${err.message}`);
  }

  let resumeText = "";
  try {
    const pdf = await pdfParse(buffer);
    resumeText = (pdf.text || "").substring(0, 12000);
  } catch (err) {
    throw new Error(`Failed to parse resume PDF: ${err.message}`);
  }

  if (!resumeText.trim()) {
    throw new Error("Resume PDF contains no extractable text");
  }

  const jobSkills = application.job.skillsRequired || [];

  const prompt = `
        You are an experienced ATS (Applicant Tracking System).

        Evaluate the following resume for the given job.

        JOB TITLE
        ${application.job.title}

        JOB DESCRIPTION
        ${application.job.description}

        JOB REQUIREMENTS
        ${application.job.requirements}

        REQUIRED SKILLS
        ${jobSkills.join(", ")}

        EXPERIENCE LEVEL
        ${application.job.experienceLevel}

        ====================

        RESUME

        ${resumeText}

        ====================

        Evaluation Criteria

        Skills Match (40)

        Projects (20)

        Experience (20)

        Education (10)

        Overall Fit (10)

        Important

        - Give partial credit.
        - Freshers should not be heavily penalized.
        - Do not reward formatting.
        - Do not reward resume length.
        - Only evaluate technical relevance.

        Return ONLY valid JSON.

        {
        "score":0,
        "matchedSkills":[],
        "missingSkills":[],
        "strengths":[],
        "weaknesses":[],
        "summary":""
        }
        `;

  const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  // Ask Gemini to respond with real JSON instead of relying on the prompt
  // text alone — this is what actually stops it from wrapping the answer
  // in prose/markdown that used to make JSON.parse blow up.
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const callGemini = async () => {
    const geminiResponse = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );

    const raw =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Extra safety net: if Gemini still adds any stray text around the
    // JSON, pull out just the {...} block before parsing.
    if (!cleaned.startsWith("{")) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
    }

    if (!cleaned) {
      throw new Error("Gemini returned an empty response");
    }

    return JSON.parse(cleaned);
  };

  let result;
  try {
    result = await callGemini();
  } catch (err) {
    // One retry — Gemini occasionally returns malformed/truncated JSON on
    // the first try, and a second call usually succeeds.
    try {
      result = await callGemini();
    } catch (retryErr) {
      throw new Error(
        `Gemini scoring failed: ${retryErr.message || err.message}`
      );
    }
  }

  const parsedScore = Number(result.score);
  if (Number.isNaN(parsedScore)) {
    throw new Error("Gemini response did not include a valid numeric score");
  }

  application.score = Math.max(0, Math.min(100, Math.round(parsedScore)));
  application.feedback = result.summary || "";
  application.matchedSkills = Array.isArray(result.matchedSkills)
    ? result.matchedSkills
    : [];
  application.missingSkills = Array.isArray(result.missingSkills)
    ? result.missingSkills
    : [];
  application.scoringStatus = "completed";
  application.scoringError = "";

  await application.save();

  return result;
}