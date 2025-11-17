// src/App.jsx
import React, { useState, useRef } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function PrettyBadge({ children }) {
  return <span className="badge">{children}</span>;
}

function Spinner() {
  return (
    <div className="spinner" aria-hidden>
      <div></div><div></div><div></div>
    </div>
  );
}

export default function App() {
  const fileRef = useRef();
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a PDF to analyze.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("job_description", jobDesc || "");

      const endpoint = (API_BASE || "").replace(/\/$/, "") + "/analyze-resume";
      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server error ${res.status}: ${txt || res.statusText}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <h1 className="title">AI Resume Analyzer</h1>
          <p className="subtitle">
            Fast, safe resume parsing and match scoring — upload a PDF and get instant feedback.
          </p>
        </div>
        <div className="glow" />
      </header>

      <main className="container">
        <section className="card left">
          <h2>Upload Resume</h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="label">Select PDF:</label>
            <input
              ref={fileRef}
              onChange={handleFileChange}
              accept="application/pdf"
              type="file"
              className="file"
            />
            {fileName && <div className="file-note">Selected: {fileName}</div>}

            <label className="label">Paste Job Description (optional)</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste JD here to get a contextual match..."
              rows={6}
            />

            <div className="actions">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? <><Spinner/> Analyzing...</> : "Analyze Resume"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setJobDesc("");
                  setResult(null);
                  setError("");
                  fileRef.current.value = "";
                  setFileName("");
                }}
                disabled={loading}
              >
                Reset
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </form>
        </section>

        <aside className="card right">
          {!result && (
            <div className="placeholder">
              <PrettyBadge>Result</PrettyBadge>
              <p className="muted">Your analysis will appear here after you submit a resume.</p>
            </div>
          )}

          {result && (
            <div className="result">
              <h3>Result</h3>
              <div className="result-grid">
                <div><strong>ID:</strong> <span className="mono">{result.id}</span></div>
                <div><strong>Filename:</strong> {result.filename}</div>
                <div><strong>Match score:</strong> <span className="score">{result.match_score}</span></div>
              </div>

              <div className="breakdown">
                <strong>Breakdown:</strong>
                <pre>{JSON.stringify(result.breakdown, null, 2)}</pre>
              </div>

              <div className="snippet">
                <strong>Text (snippet):</strong>
                <div className="snippet-box">{result.text_snippet || <span className="muted">No text extracted.</span>}</div>
              </div>

              <div className="share-row">
                <a className="btn small" href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`} download={`analysis-${result.id}.json`}>
                  Download JSON
                </a>
                <a className="btn small ghost" target="_blank" rel="noreferrer" href="/">
                  New Analysis
                </a>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="footer">
        <div>Made with ❤️ — AI Resume Analyzer</div>
        <div className="small muted">Environment: {API_BASE ? "connected" : "no API base (use VITE_API_BASE)"}</div>
      </footer>
    </div>
  );
}
