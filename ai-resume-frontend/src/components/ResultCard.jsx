import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function ResultCard({ result }) {
  const breakdown = result.breakdown ?? {};
  const bars = [
    { name: "Skills", value: breakdown.skill_score ?? 0 },
    { name: "Semantic", value: breakdown.semantic_score ?? 0 },
    { name: "Experience", value: breakdown.experience_score ?? 0 },
    { name: "Title", value: breakdown.title_score ?? 0 },
    { name: "Format", value: breakdown.format_score ?? 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Score Breakdown</h2>
          <div className="mt-2 text-sm text-slate-500">Match score: <span className="font-bold">{result.match_score ?? result.score ?? "N/A"}</span></div>
        </div>
      </div>

      <div className="mt-4" style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={bars} layout="vertical" margin={{ top: 8, right: 8, left: 30, bottom: 8 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" width={90} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-500">Skills</div>
          <div className="font-semibold">{breakdown.skill_score ?? "-"}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-500">Semantic</div>
          <div className="font-semibold">{breakdown.semantic_score ?? "-"}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-500">Experience</div>
          <div className="font-semibold">{breakdown.experience_score ?? "-"}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-500">Title / Format</div>
          <div className="font-semibold">{(breakdown.title_score ?? "-")}/{breakdown.format_score ?? "-"}</div>
        </div>
      </div>
    </motion.div>
  );
}
