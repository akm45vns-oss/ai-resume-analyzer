# Setup Checklist

Use this checklist to ensure everything is configured correctly.

## Prerequisites
- [ ] Node.js v16+ installed (`node --version`)
- [ ] Python 3.11+ installed (`python --version`)
- [ ] Supabase account created at https://supabase.com
- [ ] Git installed (optional, for version control)

## Supabase Setup
- [ ] New Supabase project created
- [ ] Database schema automatically applied (check "Database" tab)
- [ ] `resume_analyses` table exists with RLS enabled
- [ ] Project URL copied from Settings > API
- [ ] Anon key copied from Settings > API
- [ ] Email authentication enabled (Authentication > Providers)
- [ ] Email confirmation disabled for testing (optional)

## Frontend Configuration
- [ ] Navigated to `ai-resume-frontend` directory
- [ ] Ran `npm install` successfully
- [ ] Created `.env.local` file
- [ ] Added `VITE_SUPABASE_URL` to `.env.local`
- [ ] Added `VITE_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Added `VITE_API_BASE` to `.env.local`
- [ ] Ran `npm run build` successfully (no errors)
- [ ] Started dev server with `npm run dev`
- [ ] Application opens at http://localhost:5173

## Testing Authentication
- [ ] "Sign In" button visible in top-right corner
- [ ] Clicked "Sign In" and modal appears
- [ ] Switched to "Sign Up" view
- [ ] Created test account with email/password
- [ ] Received confirmation email (if enabled)
- [ ] Successfully logged in
- [ ] User email shows in header after login
- [ ] "Sign Out" button works correctly

## Testing Resume Analysis
- [ ] Prepared a test resume (PDF or DOCX)
- [ ] Upload area visible on main page
- [ ] Drag-and-drop or click to select file works
- [ ] File name appears after selection
- [ ] Job description textarea visible (optional field)
- [ ] "Analyze Resume" button enabled after file selection
- [ ] Click "Analyze Resume" shows loading state
- [ ] Analysis completes (5-15 seconds first time)
- [ ] Results display with score circle
- [ ] Breakdown scores visible
- [ ] Suggestions shown (if any)

## Testing Saved Analyses
- [ ] Right sidebar shows "Recent Analyses" section
- [ ] Latest analysis appears in the list
- [ ] Analysis shows filename and date
- [ ] Match score visible on each item
- [ ] Clicking saved analysis loads it
- [ ] Delete button (trash icon) visible
- [ ] Deleting analysis removes it from list
- [ ] Sign out and sign back in - analyses persist

## Verification
- [ ] No console errors in browser (F12 > Console)
- [ ] Network requests succeeding (F12 > Network)
- [ ] Supabase shows new rows in `resume_analyses` table
- [ ] Multiple users can sign up without seeing each other's data
- [ ] All features work on different browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsive design works (resize browser window)

## Backend (Optional - if running locally)
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend starts without errors (`uvicorn app.main:app`)
- [ ] Health endpoint responds: http://localhost:8000/health
- [ ] Updated frontend `.env.local` with local backend URL
- [ ] Analysis works with local backend

## Common Issues to Check
- [ ] If auth fails: Check Supabase URL and keys
- [ ] If can't save: Verify user is logged in
- [ ] If others' data visible: Check RLS policies in Supabase
- [ ] If analysis fails: Check backend URL is correct
- [ ] If build fails: Delete node_modules and reinstall

## Production Deployment (Optional)
- [ ] Frontend deployed to Vercel/Netlify/etc.
- [ ] Environment variables added to hosting platform
- [ ] Custom domain configured (optional)
- [ ] Backend deployed to Render/Railway/etc. (optional)
- [ ] CORS updated with production domain
- [ ] Email confirmation enabled in Supabase
- [ ] SSL/HTTPS working on both frontend and backend

## Success Criteria
✅ Users can sign up and sign in
✅ Resume analysis returns valid scores
✅ Analyses are saved and retrievable
✅ Users can only see their own data
✅ UI is responsive and professional
✅ No console errors during normal operation

---

**If all items are checked, congratulations! Your AI Resume Analyzer is fully functional.**

Need help? Check [SETUP.md](./SETUP.md) for detailed instructions or review error messages in the browser console.
