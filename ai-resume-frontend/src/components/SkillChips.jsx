import React from "react";

export default function SkillChips({ skills = [] }) {
  if (!skills || skills.length === 0) return <div className="text-sm text-slate-500">No skills found</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <span key={i} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border">
          {s}
        </span>
      ))}
    </div>
  );
}
