# Quick Start Guide

Get your AI Resume Analyzer up and running in 5 minutes!

## Prerequisites Check
```bash
node --version  # Should be 16 or higher
python --version  # Should be 3.11 or higher
```

## Step 1: Supabase Setup (2 minutes)

1. **Create Account**
   - Go to https://supabase.com/dashboard
   - Sign up with GitHub or email

2. **Create Project**
   - Click "New Project"
   - Name: `ai-resume-analyzer`
   - Generate strong database password
   - Choose region closest to you
   - Click "Create new project"
   - Wait 2 minutes for setup

3. **Get Credentials**
   - Click "Settings" (gear icon) in sidebar
   - Click "API" section
   - Copy the **URL** (looks like `https://xxxxx.supabase.co`)
   - Copy the **anon public** key (long string)

4. **Verify Database**
   - Click "Database" in sidebar
   - Click "Tables"
   - You should see `resume_analyses` table (auto-created)
   - If not there, wait a minute and refresh

5. **Configure Auth**
   - Click "Authentication" in sidebar
   - Click "Settings"
   - Scroll to "Email Auth"
   - **Toggle OFF** "Enable email confirmations" (for testing)
   - Save

## Step 2: Frontend Configuration (1 minute)

1. **Create Environment File**
   ```bash
   cd ai-resume-frontend
   cp .env.local.example .env.local
   ```

2. **Edit .env.local**
   Open `ai-resume-frontend/.env.local` and replace:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_BASE=https://ai-resume-analyzer-tw6u.onrender.com
   ```

   With your actual Supabase credentials from Step 1.

## Step 3: Run the App (1 minute)

```bash
cd ai-resume-frontend
npm run dev
```

Visit: http://localhost:5173

## Step 4: Test It (1 minute)

1. **Sign Up**
   - Click "Sign In" button (top-right)
   - Click "Don't have an account? Sign Up"
   - Enter: `test@example.com` and password `test123`
   - Click "Sign Up"
   - You should be logged in immediately

2. **Analyze Resume**
   - Prepare a PDF resume (any resume works)
   - Drag-drop or click to upload
   - (Optional) Paste a job description
   - Click "Analyze Resume"
   - Wait 5-10 seconds
   - View results!

3. **Check Saved Analyses**
   - Look at right sidebar
   - Your analysis should appear in "Recent Analyses"
   - Click it to view again

## Done! 🎉

You now have a fully functional AI Resume Analyzer!

## Troubleshooting

**Problem: "Supabase client not configured"**
```bash
# Make sure .env.local exists and has correct values
cat ai-resume-frontend/.env.local

# Restart dev server
# Press Ctrl+C to stop, then:
npm run dev
```

**Problem: Can't sign up**
- Check Supabase dashboard > Authentication > Settings
- Make sure email confirmation is OFF (for testing)
- Try different email address

**Problem: Build errors**
```bash
cd ai-resume-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem: Backend not responding**
- Backend URL should be: `https://ai-resume-analyzer-tw6u.onrender.com`
- Check VITE_API_BASE in .env.local
- First analysis may take 10-15 seconds (loading AI models)

## What's Next?

- Read `README.md` for full documentation
- Follow `SETUP.md` for production deployment
- Use `CHECKLIST.md` to verify everything works
- Customize the UI colors and branding
- Deploy to Vercel/Netlify for production

## Need Help?

1. Check browser console (F12) for error messages
2. Verify Supabase credentials are correct
3. Make sure dev server is running
4. Review `SETUP.md` for detailed instructions

## Quick Reference

| What | Where | URL |
|------|-------|-----|
| App | Local Dev | http://localhost:5173 |
| Supabase | Dashboard | https://supabase.com/dashboard |
| Backend | Render | https://ai-resume-analyzer-tw6u.onrender.com |
| Docs | README | `README.md` |
| Setup | Guide | `SETUP.md` |

---

**That's it!** You should now have the app running. If not, check the troubleshooting section above or review the error messages in your browser console (F12).
