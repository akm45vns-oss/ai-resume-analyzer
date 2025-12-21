import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import SavedAnalyses from './components/SavedAnalyses';
import { motion } from 'framer-motion';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleSelectAnalysis = (analysis) => {
    const transformedResult = {
      final_score: analysis.match_score,
      breakdown: analysis.breakdown,
      parsed_resume: {
        text: analysis.resume_text,
        skills: analysis.extracted_skills,
      },
      suggestions: analysis.suggestions || [],
    };
    setSelectedAnalysis(transformedResult);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header onAuthClick={() => setShowAuthModal(true)} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              AI-Powered Resume Analysis
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get instant feedback on your resume with advanced AI analysis. Match your skills with job descriptions
              and improve your chances of landing your dream job.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResumeAnalyzer preloadedResult={selectedAnalysis} />
            </div>

            <div>
              <SavedAnalyses onSelectAnalysis={handleSelectAnalysis} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant Analysis</h3>
              <p className="text-slate-600">Get comprehensive resume feedback in seconds with our advanced AI engine.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Matching</h3>
              <p className="text-slate-600">Match your resume against job descriptions to see how well you fit the role.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Actionable Insights</h3>
              <p className="text-slate-600">Receive detailed suggestions to improve your resume and stand out.</p>
            </div>
          </motion.div>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-slate-600">
              © 2025 AI Resume Analyzer. Powered by advanced machine learning.
            </p>
          </div>
        </footer>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </AuthProvider>
  );
}
