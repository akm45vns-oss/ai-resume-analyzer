// src/api/index.js
export const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ||
  window.__API_BASE__ ||
  "https://ai-resume-analyzer-cxl0.onrender.com";

export async function analyzeResume(file, jobDescription) {
  const formData = new FormData();
  formData.append("resume", file);
  if (jobDescription) formData.append("job_description", jobDescription);

  const url = `${API_BASE.replace(/\/$/, "")}/analyze-resume`;

  try {
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) {
      // try to read json/text from response for better debugging
      let text;
      try { text = await res.text(); } catch(e){ text = "<no body>"; }
      const err = new Error(`HTTP ${res.status}: ${text}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    // rethrow so UI can show it
    console.error("analyzeResume error:", err);
    throw err;
  }
}
