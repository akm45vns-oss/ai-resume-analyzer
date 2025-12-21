import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ResultCard from './ResultCard';
import ScoreCircle from './ScoreCircle';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://ai-resume-analyzer-tw6u.onrender.com';

export default function ResumeAnalyzer({ preloadedResult }) {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(preloadedResult || null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const saveAnalysisToDatabase = async (analysisData, filename) => {
    if (!user) return;

    try {
      const breakdown = analysisData.breakdown || {};
      const { data, error } = await supabase.from('resume_analyses').insert([
        {
          user_id: user.id,
          filename: filename,
          resume_text: analysisData.parsed_resume?.text || '',
          job_description: jdText || '',
          match_score: analysisData.final_score || breakdown.match_score || 0,
          breakdown: breakdown,
          extracted_skills: analysisData.parsed_resume?.skills || [],
          missing_skills: [],
          suggestions: analysisData.suggestions || [],
        },
      ]);

      if (error) throw error;
      console.log('Analysis saved successfully');
    } catch (err) {
      console.error('Error saving analysis:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jd_text', jdText || '');

      const response = await fetch(`${API_BASE}/analyze_with_jd`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (user) {
        await saveAnalysisToDatabase(data, file.name);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJdText('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Analyze Your Resume</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <svg
                  className={`mx-auto h-12 w-12 ${file ? 'text-green-500' : 'text-slate-400'}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-slate-600">
                  {file ? (
                    <span className="font-medium text-green-600">{file.name}</span>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">PDF, DOC, or DOCX up to 10MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Paste the job description here to get a better match score..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Resume...
                </span>
              ) : (
                'Analyze Resume'
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis Complete</h2>
                <p className="text-slate-600 mt-1">Here's how your resume performs</p>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                New Analysis
              </button>
            </div>

            <div className="flex items-center justify-center">
              <ScoreCircle score={result.final_score || result.match_score || 0} />
            </div>
          </div>

          <ResultCard result={result} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Suggestions for Improvement</h3>
            {result.suggestions && result.suggestions.length > 0 ? (
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600">No specific suggestions at this time. Your resume looks good!</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
