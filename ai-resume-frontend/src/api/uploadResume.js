// src/api/uploadResume.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export async function uploadResume(file, jobDescription = "") {
  if (!file) throw new Error("No file provided");

  const fd = new FormData();
  fd.append("resume", file);
  if (jobDescription) fd.append("job_description", jobDescription);

  const res = await fetch(`${API_BASE}/analyze-resume`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  return res.json();
}
