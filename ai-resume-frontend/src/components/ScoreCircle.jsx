import React from "react";
import { motion } from "framer-motion";

export default function ScoreCircle({ score = 0 }) {
  const v = Math.max(0, Math.min(100, Number(score)));
  const size = 96;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#e6e6e6" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={v >= 75 ? "#16a34a" : v >= 40 ? "#f59e0b" : "#ef4444"}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>

      <div className="text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-extrabold">
          {v}
        </motion.div>
        <div className="text-sm text-gray-500">Match Score</div>
      </div>
    </motion.div>
  );
}
