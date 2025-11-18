// Paste this into ai-resume-frontend/src/components/ResumeUploader.jsx


const res = await fetch(`${BASE}/analyze_with_jd`, {
method: "POST",
body: formData,
});


if (!res.ok) {
const txt = await res.text();
throw new Error(`Request failed: ${res.status} ${txt}`);
}


const json = await res.json();
setResult(json);
} catch (err) {
console.error(err);
setError(err.message || String(err));
} finally {
setLoading(false);
}
};


return (
<div className="uploader-root">
<form onSubmit={submit} className="uploader-form">
<h2>Upload Resume & Match with Job Description</h2>


<label className="uploader-label">
Resume file (PDF or DOCX)
<input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
</label>


<label className="uploader-label">
Job Description (optional)
<textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the job description here..." />
</label>


<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
<button type="submit" className="uploader-btn" disabled={loading}>
{loading ? "Analyzing..." : "Analyze Resume"}
</button>
{error && <div className="uploader-error">{error}</div>}
</div>
</form>


<div style={{ marginTop: 18 }}>
{result ? (
<ScoreUI result={result} />
) : (
<div className="uploader-placeholder">Upload a resume to see analysis and scoring.</div>
)}
</div>
</div>
);
}
