// src/api/index.js

export const API_BASE = import.meta.env.VITE_API_BASE || "https://ai-resume-analyzer-cxl0.onrender.com";

export async function analyzeResume(file, jobDescription) {
    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription) {
        formData.append("job_description", jobDescription);
    }

    try {
        const response = await fetch(`${API_BASE}/analyze-resume`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API error:", error);
        throw error;
    }
}
