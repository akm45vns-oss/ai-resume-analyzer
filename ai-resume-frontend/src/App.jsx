// src/App.jsx
import React, { useState } from "react";
import { analyzeResume } from "./api";

export default function App() {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onFile = (e) => {
    setResult(null);
    setError("");
    setFile(e.target.files[0] || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError("");

    if (!file) {
      setError("Please select a PDF file before analyzing.");
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeResume(file, job);
      setResult(res);
    } catch (err) {
      // friendly error message
      setError(err?.message || "Failed to fetch");
      console.error("Analyze error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Upload Resume</h1>

      <form onSubmit={onSubmit} style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 10 }}>
          <label>Select PDF: </label>
          <input type="file" accept="application/pdf" onChange={onFile} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <textarea
            placeholder="Paste Job Description (optional)"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            rows={6}
            style={{ width: "100%", maxWidth: 700 }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "10px 18px" }}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </div>

      {result && (
        <div style={{ marginTop: 30, background: "#f8f8f8", padding: 16, borderRadius: 6 }}>
          <h3>Result</h3>
          <div><b>ID:</b> {result.id}</div>
          <div><b>Filename:</b> {result.filename}</div>
          <div><b>Match score:</b> {result.match_score}</div>
          <div style={{ marginTop: 8 }}>
            <b>Breakdown:</b>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.breakdown, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Text (snippet):</b>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}>{result.text_snippet}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
