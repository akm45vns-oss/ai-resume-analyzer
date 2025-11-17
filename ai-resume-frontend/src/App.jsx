import { useState } from "react";
import "./App.css";
import logo from "./assets/logo-premium.png";

const apiBase = import.meta.env.VITE_API_BASE;

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const resetAll = () => {
    setResumeFile(null);
    setJobDescription("");
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      alert("Please upload a PDF first!");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("resume", resumeFile);
    if (jobDescription.trim()) form.append("job_description", jobDescription);

    try {
      const res = await fetch(`${apiBase}/analyze-resume`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="main-container">

      {/* HEADER */}
      <div className="header">
        <img src={logo} alt="AI Resume Logo" className="logo" />
        <h1 className="title">AI Resume Analyzer</h1>
        <p className="subtitle">
          Premium AI-powered resume analysis • Instant scoring • Smart insights
        </p>
      </div>

      <div className="content">
        
        {/* LEFT PANEL */}
        <div className="card upload-card">
          <h2>Upload Resume</h2>

          <label className="label">Select PDF:</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />

          <label className="label">Paste Job Description (optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste JD here to get a contextual match..."
          />

          <div className="buttons">
            <button className="btn-gold" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            <button className="btn-reset" onClick={resetAll}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="card result-card">
          <h2>Result</h2>

          {!result && <p>Your analysis will appear here after you submit.</p>}

          {result && (
            <div className="result-box">
              <p><b>ID:</b> {result.id}</p>
              <p><b>Filename:</b> {result.filename}</p>
              <p><b>Match Score:</b> <span className="score">{result.match_score}</span></p>

              <h3>Breakdown:</h3>
              <pre className="json-box">{JSON.stringify(result.breakdown, null, 2)}</pre>

              <h3>Text (snippet):</h3>
              <textarea className="snippet-box" value={result.text_snippet} readOnly />
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        Made with ❤️ by <span className="gold">Ayush Kumar Maurya</span> — Developer
      </footer>
    </div>
  );
}
