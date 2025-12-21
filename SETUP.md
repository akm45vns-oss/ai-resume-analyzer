# AI Resume Analyzer - Setup Guide

This guide will help you set up the complete AI Resume Analyzer application with authentication and database functionality.

## Features

- User authentication (sign up, sign in, sign out)
- AI-powered resume analysis
- Job description matching
- Grammar and spelling checks
- Semantic similarity analysis
- Save and retrieve analysis history
- Professional modern UI/UX

## Prerequisites

- Node.js (v16 or higher)
- Python 3.11+
- Supabase account (free tier works)

## Part 1: Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in:
   - Project name: `ai-resume-analyzer`
   - Database password: (generate a strong password and save it)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup to complete

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Go to "API" section
3. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Database Migration

The database schema is already created! When you set up Supabase with this project, the migration was automatically applied. It created:

- `resume_analyses` table with Row Level Security (RLS)
- Policies ensuring users can only access their own data
- Automatic timestamp updates

### 4. Configure Email Authentication

1. In Supabase dashboard, go to "Authentication" > "Providers"
2. Enable "Email" provider (should be enabled by default)
3. Under "Authentication" > "Email Templates", you can customize signup confirmation emails
4. For testing, you can disable email confirmation:
   - Go to "Authentication" > "Settings"
   - Scroll to "Email Auth"
   - Toggle OFF "Enable email confirmations" (for development only)

## Part 2: Frontend Setup

### 1. Install Dependencies

```bash
cd ai-resume-frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `ai-resume-frontend` directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE=https://ai-resume-analyzer-tw6u.onrender.com
```

Replace:
- `your_supabase_project_url_here` with your Project URL from Supabase
- `your_supabase_anon_key_here` with your anon public key from Supabase
- Update `VITE_API_BASE` if you deploy your own backend

### 3. Run the Frontend

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

The app will be available at `http://localhost:5173`

## Part 3: Backend Setup (Optional - if deploying your own)

The backend is already deployed at `https://ai-resume-analyzer-tw6u.onrender.com`, but if you want to run it locally or deploy your own:

### 1. Install Python Dependencies

```bash
cd backend
pip install -r ../requirements.txt
```

### 2. Run the Backend Locally

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

Update your frontend `.env.local`:
```bash
VITE_API_BASE=http://localhost:8000
```

### 3. Deploy Backend (Render)

1. Create account at [https://render.com](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-resume-analyzer-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `sh start.sh`
   - **Environment**: `Python 3`
5. Add environment variable:
   - `FRONTEND_URL`: Your deployed frontend URL
6. Click "Create Web Service"

## Part 4: Testing the Application

### 1. Sign Up

1. Open the application in your browser
2. Click "Sign In" in the top-right
3. Click "Don't have an account? Sign Up"
4. Enter email and password (min 6 characters)
5. If email confirmation is enabled, check your email and confirm
6. If disabled, you'll be logged in immediately

### 2. Upload Resume

1. Click or drag-drop a PDF or DOCX resume file
2. (Optional) Paste a job description in the text area
3. Click "Analyze Resume"
4. Wait for AI analysis (usually 5-15 seconds)

### 3. View Results

- See your overall match score
- Review detailed breakdown (semantic similarity, grammar, etc.)
- Read AI-generated suggestions
- Results are automatically saved to your account

### 4. Access Saved Analyses

- View your recent analyses in the sidebar
- Click on any saved analysis to view it again
- Delete analyses you no longer need

## Troubleshooting

### Frontend Issues

**Error: Supabase client not configured**
- Make sure `.env.local` exists with correct Supabase credentials
- Restart the dev server after creating/updating `.env.local`

**Build errors**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Issues

**Import errors**
- Ensure all Python dependencies are installed
- Check Python version (needs 3.11+)

**Analysis takes too long**
- First analysis downloads AI models (one-time, ~500MB)
- Subsequent analyses should be faster

### Authentication Issues

**Can't sign in after signup**
- Check if email confirmation is required in Supabase settings
- Check spam folder for confirmation email
- Disable email confirmation for testing

**Users can see others' data**
- Check that RLS is enabled on `resume_analyses` table
- Verify policies are correctly set up in Supabase dashboard

## Security Notes

- Never commit `.env.local` or `.env` files to Git
- Use strong passwords for Supabase database
- Keep your Supabase service role key secret (only use anon key in frontend)
- Enable email confirmation for production
- Set proper CORS origins in backend

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│  React Frontend │────────▶│  FastAPI Backend │────────▶│  AI Models  │
│  (Vite + Tailwind)        │  (Python)        │         │  (spaCy,    │
│                 │         │                  │         │  Transformers)
└────────┬────────┘         └──────────────────┘         └─────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│  Supabase       │
│  - Auth         │
│  - PostgreSQL   │
│  - RLS          │
│                 │
└─────────────────┘
```

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console (F12)
3. Check backend logs if running locally
4. Verify Supabase dashboard for auth/database issues

## License

MIT License - feel free to use for personal or commercial projects.
