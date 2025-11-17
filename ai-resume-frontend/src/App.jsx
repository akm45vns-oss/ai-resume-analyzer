// src/App.jsx
import React, { useState, useRef } from "react";
import "./App.css";

/**
 * Uses Vite env var VITE_API_BASE (set on Render environment to your backend URL).
 * Fallbacks to the same host as frontend if not set.
 */
const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || window.REACT_APP_API_BASE || "";

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [envStatus] = useState(apiBase ? "connected" : "not set");
  const fileInputRef = useRef(null);

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setPdfFile(f);
      setPdfName(f.name);
    } else {
      setPdfFile(null);
      setPdfName("");
    }
    setResult(null);
    setError("");
  }

  function resetForm() {
    setPdfFile(null);
    setPdfName("");
    setJdText("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = ""; // clear native input
  }

  async function analyze(e) {
    e?.preventDefault();
    setError("");
    setResult(null);

    if (!pdfFile) {
      setError("Please select a PDF resume first.");
      return;
    }

    // Build URL
    const target = apiBase ? `${apiBase.replace(/\/$/, "")}/analyze-resume` : `/analyze-resume`;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", pdfFile);
      if (jdText) fd.append("job_description", jdText);

      const res = await fetch(target, {
        method: "POST",
        body: fd,
        // do not set content-type; browser will set multipart boundary
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}${txt ? ": " + txt : ""}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      setError("Analysis failed — " + (err.message || "unknown error"));
    } finally {
      setLoading(false);
    }
  }

  function downloadJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (result.filename || "analysis") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyId() {
    if (!result?.id) return;
    navigator.clipboard?.writeText(result.id).then(() => {
      // small feedback
      alert("Analysis ID copied to clipboard");
    });
  }

  return (
    <div className="container">
      <header className="header">
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <h1>AI Resume Analyzer</h1>
          <p>Fast, safe resume parsing and match scoring — upload a PDF and get instant feedback.</p>
          <div className="accent" aria-hidden />
        </div>
      </header>

      <main className="main-grid">
        {/* Upload / Form */}
        <section className="card upload-card">
          <h2>Upload Resume</h2>

          <form onSubmit={analyze} style={{marginTop:12}}>
            <div className="form-row">
              <label style={{fontWeight:700}}>Select PDF:</label>
              <div className="file-row" style={{marginTop:8}}>
                <input
                  ref={fileInputRef}
                  accept="application/pdf"
                  type="file"
                  onChange={onFileChange}
                  aria-label="Upload resume PDF"
                />
                <div className="file-info">{pdfName ? `Selected: ${pdfName}` : "No file chosen"}</div>
              </div>
            </div>

            <div className="form-row" style={{marginTop:14}}>
              <label style={{fontWeight:700}}>Paste Job Description (optional)</label>
              <textarea
                placeholder="Paste JD here to get a contextual match..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>

            <div style={{display:"flex",gap:12,alignItems:"center",marginTop:14}}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>

              <button className="btn btn-secondary" type="button" onClick={resetForm} disabled={loading}>
                Reset
              </button>

              <div style={{marginLeft:"auto", color:"var(--muted)", fontSize:13}}>
                API: <strong style={{color:"#08304a"}}>{apiBase || window.location.origin}</strong>
              </div>
            </div>

            {error && <div style={{color:"#c53030", marginTop:12, fontWeight:700}}>{error}</div>}
          </form>
        </section>

        {/* Result */}
        <aside className="card result-card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <h3 style={{margin:"0 0 6px 0"}}>Result</h3>
              <div className="meta">Your analysis will appear here after you submit a resume.</div>
            </div>

            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"var(--muted)"}}>Status</div>
              <div style={{fontWeight:800}}>{envStatus}</div>
            </div>
          </div>

          {result ? (
            <div style={{marginTop:14}}>
              <div className="kv" style={{marginBottom:10}}>
                <div className="label">ID</div>
                <div className="value" style={{wordBreak:"break-all"}}>{result.id}</div>
                <div style={{marginLeft:10}}>
                  <button className="btn btn-secondary" onClick={copyId}>Copy ID</button>
                </div>
              </div>

              <div className="kv" style={{marginBottom:8}}>
                <div className="label">Filename</div>
                <div className="value">{result.filename}</div>
              </div>

              <div className="kv" style={{marginBottom:8,alignItems:"center"}}>
                <div className="label">Match score</div>
                <div style={{marginLeft:6}}><span className="score-badge">{result.match_score}</span></div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{fontWeight:700, marginBottom:8}}>Breakdown:</div>
                <pre className="code">{JSON.stringify(result.breakdown ?? {}, null, 2)}</pre>
              </div>

              <div style={{marginTop:12}}>
                <div style={{fontWeight:700, marginBottom:8}}>Text (snippet):</div>
                <div className="snippet">{result.text_snippet || "No extracted text"}</div>
              </div>

              <div className="actions" style={{marginTop:12}}>
                <button className="btn btn-primary" onClick={downloadJson}>Download JSON</button>
                <button className="btn btn-secondary" onClick={() => { setResult(null); }}>New Analysis</button>
              </div>
            </div>
          ) : (
            <div style={{marginTop:18,color:"var(--muted)"}}>
              No analysis yet.
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <div className="footer" style={{marginTop:26}}>
        <div>
          Made with ❤️ — AI Resume Analyzer
        </div>

        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:800}}>
            <a
              href="https://github.com/akm45vns-oss"
              target="_blank"
              rel="noopener noreferrer"
              style={{color:"#06324a", textDecoration:"none"}}
            >
              Ayush Kumar Maurya
            </a>
          </div>
          <div style={{fontSize:12,color:"var(--muted)"}}>Environment: {envStatus}</div>
        </div>
      </div>
    </div>
  );
}
