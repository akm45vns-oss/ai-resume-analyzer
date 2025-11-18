// src/components/ScoreUI.jsx
// Paste this file into ai-resume-frontend/src/components/ScoreUI.jsx
// Then edit your ResumeUploader.jsx to import and render it when `result` exists:
// import ScoreUI from "./ScoreUI";
// ...
// {result && <ScoreUI result={result} />}
import "./score-ui.css";
import React from "react";

// Small, dependency-free UI for showing resume score + breakdown + suggestions
// Works with the backend JSON shape produced by the analyzer (parsed_resume, features_enhanced, quality, semantic)

function ScoreCircle({ value = 0, size = 120 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="#e6eef8" strokeWidth="10" />
        <circle
          r={radius}
          fill="none"
          stroke="url(#g1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90)`}
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontSize={20}
          fontWeight={700}
          fill="#0f172a"
        >
          {percent}%
        </text>
      </g>
    </svg>
  );
}

function MetricBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontWeight: 700 }}>{pct}%</div>
      </div>
      <div style={{ height: 10, background: "#e6eef8", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#06b6d4)" }} />
      </div>
    </div>
  );
}

function SuggestionList({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ marginBottom: 8 }}>Suggestions</h4>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {suggestions.map((s, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function KeyFacts({ parsed = {} }) {
  const name = (parsed.get("name") || parsed.name) || "";
  const contact = parsed.contact || {};
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{name || parsed_resume_preview(parsed)}</div>
        <div style={{ color: "#475569", marginTop: 6 }}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span style={{ marginLeft: 10 }}>{contact.phone}</span>}
        </div>
      </div>
    </div>
  );
}

function parsed_resume_preview(parsed) {
  // small helper in case fields missing
  const sections = parsed && parsed.sections ? parsed.sections : {};
  const skills = sections.skills || "";
  return skills ? `Skills: ${skills.split(",").slice(0, 6).join(", ")}` : "Resume";
}

export default function ScoreUI({ result }) {
  // result expected to contain: final_score or features_enhanced.semantic_overall_similarity
  const features = result?.features_enhanced || {};
  const quality = result?.quality || {};
  const semantic = result?.semantic || {};

  // compute main score: prefer final_score if backend sends it, otherwise combine
  let mainScore = result?.final_score;
  if (mainScore == null) {
    // combine weights: semantic(0.45) + skills/structure from features (0.35) + grammar(0.20)
    const sem = Math.round((semantic.overall_similarity || features.semantic_overall_similarity || 0) * 100);
    const grammarIssues = quality.total_issues_count || 0; // lower is better
    const grammarScore = grammarIssues === 0 ? 95 : Math.max(30, 95 - grammarIssues * 5);
    const structural = features.structure_score || features.layout_score || Math.round((features.experience_score || 0) * 10) || 70;
    mainScore = Math.round((sem * 0.45) + (structural * 0.35) + (grammarScore * 0.20));
  }

  // breakdown items
  const breakdown = result?.breakdown || {
    skills: Math.round((features.semantic_per_section_similarity?.skills || 0) * 100) || Math.round((features.skill_match || 0) * 100) || 80,
    experience: Math.round((features.semantic_per_section_similarity?.experience || 0) * 100) || features.years_score || 70,
    achievements: features.achievements_score || 60,
    structure: features.structure_score || 80,
    grammar: Math.max(0, 100 - (quality.total_issues_count || 0) * 5),
    relevance: Math.round((semantic.overall_similarity || features.semantic_overall_similarity || 0) * 100) || 78,
  };

  const suggestions = result?.suggestions || [];

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto", padding: 18, background: "#ffffff", borderRadius: 12, boxShadow: "0 6px 30px rgba(11,22,60,0.06)" }}>
      <div style={{ display: "flex", gap: 18 }}>
        <div style={{ width: 160, textAlign: "center" }}>
          <ScoreCircle value={mainScore} size={140} />
          <div style={{ marginTop: 8, color: "#475569" }}>Final Resume Score</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Resume Analysis</h3>
              <div style={{ color: "#64748b", marginTop: 6 }}>Quick summary and suggestions to make your resume stronger.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Relevance</div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{breakdown.relevance}%</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div>
              <MetricBar label="Skills Match" value={breakdown.skills} />
              <MetricBar label="Experience Strength" value={breakdown.experience} />
              <MetricBar label="Achievements" value={breakdown.achievements} />
            </div>

            <div>
              <MetricBar label="Structure & Format" value={breakdown.structure} />
              <MetricBar label="Grammar & Spelling" value={breakdown.grammar} />
              <MetricBar label="Relevance to JD" value={breakdown.relevance} />
            </div>
          </div>

          <SuggestionList suggestions={suggestions} />

        </div>
      </div>

      <div style={{ marginTop: 18, borderTop: "1px solid #eef2ff", paddingTop: 14 }}>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Detailed Output (Parsed)</h4>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, fontFamily: "monospace", fontSize: 13, color: "#0f172a", background: "#fbfdff", padding: 12, borderRadius: 8 }}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
{JSON.stringify(result?.parsed_resume || result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}



