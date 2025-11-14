import React, { useState } from "react";
import "./index.css"; // keep your existing css or remove if not used

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // backend URL - change here if your backend runs somewhere else
  const API_URL = "http://127.0.0.1:8000/analyze-resume";

  async function handleAnalyze(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please choose a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription?.trim()) {
      formData.append("job_description", jobDescription.trim());
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData, // important: DO NOT set Content-Type header (browser does it)
        // If backend and frontend at different origins you must enable CORS in backend
      });

      if (!res.ok) {
        // try to get JSON error message if available
        let text = await res.text();
        try {
          const j = JSON.parse(text);
          setError(j.detail || JSON.stringify(j));
        } catch {
          setError(`Server returned ${res.status}: ${text}`);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      // expected result shape: { match_score: number, breakdown: {...}, ... }
      setResult(data);
    } catch (err) {
      setError("Network error or backend not running: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError("");
  }

  function renderScore() {
    if (!result) return null;
    const score = result.match_score ?? result.matchScore ?? result.score ?? null;
    return (
      <div className="result-card">
        <div className="score-row">
          <div className="score-circle">
            <div className="score-number">{score ?? "N/A"}</div>
            <div className="score-label">Match Score</div>
          </div>
          <div className="breakdown">
            <h3>Score Breakdown</h3>
            <pre className="json-block">{JSON.stringify(result.breakdown ?? result, null, 2)}</pre>
          </div>
        </div>

        {result.extracted_skills && (
          <div className="skills">
            <h4>Extracted Skills</h4>
            <div className="chips">
              {result.extracted_skills.map((s, i) => (
                <span key={i} className="chip">{s}</span>
              ))}
            </div>
          </div>
        )}

        {result.text_snippet && (
          <div>
            <h4>Resume Text Snippet</h4>
            <pre className="json-block small">{result.text_snippet}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">Upload resume (PDF) and get instant score</p>

      <form className="upload-form" onSubmit={handleAnalyze}>
        <label className="label">Resume (PDF)</label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        <label className="label">Job Description (optional)</label>
        <textarea
          placeholder="e.g. Data Scientist with Python, Pandas"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
        />

        <div className="btn-row">
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Analyzing…" : "Analyze Resume"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setFile(null);
              setJobDescription("");
              setResult(null);
              setError("");
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
      {renderScore()}

      <footer className="footer">Powered by your local backend</footer>

      <style>{`
        .app-container{ max-width:900px;margin:40px auto;font-family:system-ui,Segoe UI,Roboto,Arial; color:#222;padding:20px;}
        .subtitle{color:#666;margin-top:-8px;margin-bottom:18px}
        .upload-form{background:#fff;border:1px solid #eee;padding:18px;border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,0.03)}
        .label{display:block;margin:8px 0 6px;font-weight:600}
        input[type=file]{display:block;margin-bottom:10px}
        textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:inherit}
        .btn-row{margin-top:12px;display:flex;gap:10px;align-items:center}
        .btn{padding:8px 14px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer}
        .btn.primary{background:#0b76ff;color:#fff;border-color:#0b76ff}
        .btn:disabled{opacity:.6;cursor:default}
        .error{color:#b00020;margin-top:12px}
        .result-card{margin-top:20px;background:#fff;border:1px solid #eee;padding:16px;border-radius:10px}
        .score-row{display:flex;gap:18px;align-items:flex-start}
        .score-circle{width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#e6f0ff,#dff3ff);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(2,6,23,0.04)}
        .score-number{font-size:36px;font-weight:700}
        .score-label{font-size:13px;color:#555}
        .breakdown{flex:1}
        .json-block{background:#f9f9f9;border:1px solid #eee;padding:10px;border-radius:6px;overflow:auto;max-height:280px}
        .json-block.small{white-space:pre-wrap}
        .skills{margin-top:12px}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{background:#eef6ff;padding:6px 10px;border-radius:999px;border:1px solid #d9eeff}
        .footer{margin-top:18px;color:#888;font-size:13px}
      `}</style>
    </div>
  );
}
