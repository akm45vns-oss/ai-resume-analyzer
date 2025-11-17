// src/components/ResumeUploader.jsx
import React, { useState } from "react";
import { analyzeResumeWithJD } from "../api/uploadResume";

/**
 * ResumeUploader
 * - choose file
 * - paste JD text
 * - call backend (analyze_with_jd)
 * - show simple result preview
 */

export default function ResumeUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setError(null);
    if (!selectedFile) {
      setError("Please select a resume file first.");
      return;
    }

    try {
      setLoading(true);
      const res = await analyzeResumeWithJD(selectedFile, jdText);
      setResult(res);
    } catch (err) {
      console.error("Analyze error:", err);
      setError("Analysis failed. Check console for details and ensure backend running.");
    } finally {
      setLoading(false);
    }
  };

  const prettyResult = (r) => {
    try {
      return JSON.stringify(r, null, 2);
    } catch {
      return String(r);
    }
  };

  return (
    <div style={{ maxWidth: 920, margin: "20px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>AI Resume Analyzer — Upload & Compare</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Upload Resume (PDF / DOCX / TXT)
        </label>
        <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
        {selectedFile && (
          <div style={{ marginTop: 8, color: "#333" }}>
            Selected: <strong>{selectedFile.name}</strong>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Job Description (paste here)
        </label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Example: Looking for ML engineer with python, tensorflow, 3+ years experience..."
          style={{ width: "100%", height: 120, padding: 8, fontSize: 14 }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padd
