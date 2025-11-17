// src/App.jsx
import React, { useState, useRef } from "react";
import "./App.css";
import logo from "./assets/logo-gold.png"; // ensure this file exists

const apiBase = import.meta.env.VITE_API_BASE || "";

export default function App() {
  const fileRef = useRef();
  const [fileName, setFileName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function reset() {
    setFileName("");
    setJobDesc("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function analyze(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a PDF to analyze.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      if (jobDesc) fd.append("job_description", jobDesc);

      const url = (apiBase || "").replace(/\/+$/, "") + "/analyze-resume";
      const res = await fetch(url, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Server returned ${res.status} ${res.statusText}. ${text}`
        );
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-wrap">
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-wrap">
            <img src={logo} alt="AI Resume Analyzer" className="logo" />
          </div>
          <h1 className="title">AI Resume Analyzer</h1>
          <p className="subtitle">
            Fast, safe resume parsing and match scoring — upload a PDF and get
            instant feedback.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="panel upload-panel">
          <h2>Upload Resume</h2>
          <form onSubmit={analyze} className="form">
            <label className="label">
              <span className="label-text">Select PDF:</span>
              <div className="file-row">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                  className="file-input"
                />
                <div className="file-name">{fileName || "No file chosen"}</div>
              </div>
            </label>

            <label className="label">
              <span className="label-text">Paste Job Description (optional)</span>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste JD here to get a contextual match..."
                className="textarea"
                rows={6}
              />
            </label>

            <div className="actions">
              <button className="btn primary" disabled={loading}>
                {loading ? "Analyzing…" : "Analyze Resume"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={reset}
                disabled={loading}
              >
                Reset
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </form>
        </section>

        <aside className="panel result-panel">
          <h2>Result</h2>

          {!result && (
            <div className="result-empty">
              Your analysis will appear here after you submit a resume.
            </div>
          )}

          {result && (
            <div className="result-content">
              <div className="meta-row">
                <div><strong>ID:</strong> <span className="mono">{result.id}</span></div>
                <div><strong>Filename:</strong> {result.filename}</div>
              </div>

              <div className="score-row">
                <div className="score-pill">{result.match_score}</div>
                <div className="score-label">Match score</div>
              </div>

              <div className="breakdown">
                <strong>Breakdown:</strong>
                <pre className="code">{JSON.stringify(result.breakdown, null, 2)}</pre>
              </div>

              <div className="snippet">
                <strong>Text (snippet):</strong>
                <div className="snippet-box">{result.text_snippet || "—"}</div>
              </div>

              <div className="result-actions">
                <a
                  className="link-btn"
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(result, null, 2)
                  )}`}
                  download={`analysis-${result.id}.json`}
                >
                  Download JSON
                </a>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => {
                    // start a fresh analysis (keep file)
                    setResult(null);
                    setError("");
                  }}
                >
                  New Analysis
                </button>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="footer">
        <div>
          Made with <span className="heart">❤️</span> by{" "}
          <strong>Ayush Kumar Maurya — Developer</strong>
        </div>
        <div className="env">Environment: connected</div>
      </footer>
    </div>
  );
}
