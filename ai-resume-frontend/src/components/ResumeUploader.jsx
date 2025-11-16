// src/components/ResumeUploader.jsx
import React, { useState } from "react";
import { uploadResume } from "../api/uploadResume";

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setLoading(true);
    try {
      const res = await uploadResume(file, jd);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>Upload Resume</h2>

      <form onSubmit={onSubmit}>
        <div>
          <label>
            Select PDF:
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <textarea
            placeholder="Paste Job Description (optional)"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows="4"
            style={{ width: "100%" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 10, padding: "8px 16px" }}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <pre style={{ background: "#f3f3f3", padding: 10 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
