// src/App.jsx
import React, { useState } from "react";
import "./App.css";
import logo from "./assets/logo-gold.png"; // put your gold 3D logo here

const apiBase = import.meta.env.VITE_API_BASE || import.env?.REACT_APP_API_BASE || "";

export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError("");
  }

  async function analyze(e) {
    e?.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("job_description", jd || "");

      const res = await fetch(`${apiBase.replace(/\/$/, "")}/analyze-resume`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}: ${text || res.statusText}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFile(null);
    setJd("");
    setResult(null);
    setError("");
    document.getElementById("resume-input")?.value && (document.getElementById("resume-input").value = "");
  }

  return (
    <div className="app-root">
      <header className="hero">
        <div className="hero-inner">
          <img src={logo} alt="AI Resume Analyzer" className="logo" />
          <h1 className="title">AI Resume Analyzer</h1>
          <p className="subtitle">Fast, safe resume parsing and match scoring — upload a PDF and get instant feedback.</p>
        </div>
      </header>

      <main className="container">
        <form className="grid" onSubmit={analyze} aria-label="Resume analyzer form">
          <section className="card upload-card">
            <h2>Upload Resume</h2>

            <label className="label">Select PDF:</label>
            <div className="file-row">
              <input id="resume-input" type="file" accept=".pdf" onChange={handleFileChange} />
              <span className="file-name">{file ? file.name : "No file chosen"}</span>
            </div>

            <label className="label">Paste Job Description (optional)</label>
            <textarea
              placeholder="Paste JD here to get a contextual match..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="jd-input"
            />

            <div className="actions">
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Analyzing…" : "Analyze Resume"}
              </button>
              <button type="button" className="btn ghost" onClick={resetForm}>
                Reset
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </section>

          <aside className="card result-card" aria-live="polite">
            <h2>Result</h2>

            {!result && <div className="placeholder">Your analysis will appear here after you submit a resume.</div>}

            {result && (
              <>
                <div className="meta-row">
                  <div className="meta">
                    <span className="meta-label">ID:</span>
                    <div className="meta-value">{result.id}</div>
                  </div>
                  <div className="meta">
                    <span className="meta-label">Filename:</span>
                    <div className="meta-value">{result.filename}</div>
                  </div>
                </div>

                <div className="score-row">
                  <span className="score-label">Match score:</span>
                  <div className="score-pill">{result.match_score}</div>
                </div>

                <div className="breakdown">
                  <span className="label">Breakdown:</span>
                  <pre className="code">{JSON.stringify(result.breakdown, null, 2)}</pre>
                </div>

                <div className="text-snippet">
                  <span className="label">Text (snippet):</span>
                  <textarea readOnly value={result.text_snippet || ""} />
                </div>

                <div className="result-actions">
                  <a
                    className="link"
                    href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`}
                    download={`analysis-${result.id}.json`}
                  >
                    Download JSON
                  </a>
                  <button className="btn small ghost" onClick={() => setResult(null)}>
                    New Analysis
                  </button>
                </div>
              </>
            )}
          </aside>
        </form>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>Made with <span style={{ color: "#ff3b6b" }}>❤️</span> by Ayush Kumar Maurya – Developer</span>
          <span className="env">Environment: {apiBase ? "connected" : "not set"}</span>
        </div>
      </footer>
    </div>
  );
}

