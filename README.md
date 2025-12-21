# AI Resume Analyzer

A professional AI-powered resume analysis tool that helps job seekers optimize their resumes for specific job descriptions. Built with React, FastAPI, and Supabase.

## Features

### Core Functionality
- **AI-Powered Analysis**: Advanced NLP models analyze resume content
- **Job Matching**: Compare resumes against job descriptions for match scores
- **Grammar & Spelling**: Automatic grammar and spelling error detection
- **Semantic Analysis**: Deep understanding of skills and experience relevance
- **Smart Suggestions**: AI-generated recommendations for improvement

### User Features
- **Authentication**: Secure sign up and sign in with email/password
- **Save History**: Automatically save all resume analyses
- **Analysis Library**: View and manage past analyses
- **Export Options**: Download results as JSON or PDF
- **Responsive Design**: Works on desktop, tablet, and mobile

### Technical Features
- Modern React frontend with Tailwind CSS
- FastAPI backend with machine learning pipeline
- Supabase for authentication and database
- Row Level Security (RLS) for data protection
- Real-time analysis with progress indicators

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-resume-analyzer
```

### 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. The database schema is already set up (automatic migration)
4. Get your project URL and anon key from Settings > API

### 3. Configure Frontend

```bash
cd ai-resume-frontend
npm install
```

Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE=https://ai-resume-analyzer-tw6u.onrender.com
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173`

## Detailed Setup

For complete setup instructions including backend deployment, see [SETUP.md](./SETUP.md)

## Usage

### Sign Up / Sign In
1. Click "Sign In" button in the top navigation
2. Create a new account or sign in with existing credentials
3. Email confirmation may be required (check Supabase settings)

### Analyze Resume
1. Upload your resume (PDF or DOCX format)
2. (Optional) Paste the job description you're applying to
3. Click "Analyze Resume"
4. View comprehensive analysis results including:
   - Overall match score
   - Semantic similarity breakdown
   - Grammar and spelling issues
   - Skill extraction
   - Improvement suggestions

### Manage Saved Analyses
- All analyses are automatically saved to your account
- View history in the sidebar
- Click any saved analysis to view details
- Delete analyses you no longer need

## Technology Stack

### Frontend
- **React 19**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization
- **Supabase JS**: Database and auth client

### Backend
- **FastAPI**: High-performance Python API framework
- **Sentence Transformers**: Semantic similarity analysis
- **spaCy**: Natural language processing
- **Language Tool**: Grammar and spelling checking
- **PyMuPDF & python-docx**: Document parsing

### Database & Auth
- **Supabase**: PostgreSQL database with built-in auth
- **Row Level Security**: Ensures data privacy
- **Real-time subscriptions**: Live updates (future feature)

## Project Structure

```
ai-resume-analyzer/
├── ai-resume-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Auth)
│   │   ├── lib/                 # Utility libraries (Supabase client)
│   │   ├── App.jsx              # Main application component
│   │   └── main.jsx             # Application entry point
│   ├── public/                  # Static assets
│   ├── .env.local.example       # Environment variables template
│   └── package.json
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py              # API entry point
│   │   ├── parser/              # Resume parsing logic
│   │   └── scorer/              # AI analysis pipeline
│   └── requirements.txt
│
├── SETUP.md                     # Detailed setup guide
└── README.md                    # This file
```

## API Endpoints

### POST /analyze_with_jd
Analyze a resume with optional job description matching.

**Request:**
- `file`: Resume file (PDF or DOCX)
- `jd_text`: Optional job description text

**Response:**
```json
{
  "final_score": 85,
  "breakdown": {
    "semantic_score": 78,
    "grammar_score": 92,
    "match_score": 85
  },
  "parsed_resume": {
    "text": "...",
    "skills": ["Python", "React", "AWS"]
  },
  "quality": {
    "total_issues_count": 3,
    "spelling_issues_count": 1,
    "grammar_issues_count": 2
  },
  "semantic": {
    "overall_similarity": 0.78,
    "per_section_similarity": {...}
  },
  "suggestions": [
    "Fix 3 grammar and spelling issues",
    "Add more relevant keywords from the job description"
  ]
}
```

### GET /health
Health check endpoint.

## Database Schema

### resume_analyses Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| filename | text | Original resume filename |
| resume_text | text | Extracted resume text |
| job_description | text | Optional job description |
| match_score | integer | Overall match score (0-100) |
| breakdown | jsonb | Detailed score breakdown |
| extracted_skills | text[] | Skills found in resume |
| missing_skills | text[] | Skills from JD not in resume |
| suggestions | text[] | AI-generated suggestions |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

## Security

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **Data Privacy**: Users can only access their own analyses
- **CORS**: Configured for specific frontend origins
- **Input Validation**: File type and size restrictions
- **SQL Injection**: Protected by Supabase prepared statements

## Performance

- **First Analysis**: 5-15 seconds (includes model loading)
- **Subsequent Analyses**: 3-8 seconds
- **Caching**: AI models cached after first use
- **Database Queries**: Indexed for fast retrieval
- **Frontend**: Code splitting and lazy loading

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables (Supabase keys)

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set start command: `sh start.sh`
3. Environment: Python 3.11
4. Add environment variable: `FRONTEND_URL`

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

**Frontend won't connect to Supabase**
- Verify environment variables are set correctly
- Check Supabase project URL and anon key
- Restart dev server after changing .env

**Backend analysis fails**
- First run downloads large AI models (~500MB)
- Check Python version (3.11+ required)
- Verify all dependencies are installed

**Authentication not working**
- Check if email confirmation is enabled in Supabase
- Look for confirmation email in spam folder
- Disable email confirmation for testing

**Can't save analyses**
- Ensure you're signed in
- Check browser console for errors
- Verify RLS policies in Supabase dashboard

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] Support for more resume formats (LinkedIn PDF, Google Docs)
- [ ] ATS (Applicant Tracking System) compatibility check
- [ ] Resume template suggestions
- [ ] Skill gap analysis with learning resources
- [ ] Interview preparation tips
- [ ] Cover letter analysis
- [ ] Multiple resume versions comparison
- [ ] Team collaboration features

## License

MIT License - See LICENSE file for details

## Support

For questions or issues:
- Check [SETUP.md](./SETUP.md) for detailed instructions
- Review browser console for errors (F12)
- Check Supabase dashboard for auth/database issues

## Acknowledgments

- Built with [React](https://react.dev/), [FastAPI](https://fastapi.tiangolo.com/), and [Supabase](https://supabase.com/)
- AI models from [Hugging Face](https://huggingface.co/) and [spaCy](https://spacy.io/)
- UI inspiration from modern SaaS applications

---

Made with ❤️ for job seekers worldwide
