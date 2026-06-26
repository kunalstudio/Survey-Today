# Quick Start Guide - Deployment to Render

## 🚀 Getting Started (5 minute setup)

### Step 1: Fix Critical Security Issue
⚠️ **Your MongoDB credentials were in git!**

1. Go to MongoDB Atlas
2. Delete user "Kunal"
3. Create new user with strong password
4. Update your Render environment variables (see Step 3)

### Step 2: Generate JWT Secrets
```bash
# Run this twice in your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Save both outputs - you'll need them in Step 3
```

### Step 3: Deploy to Render

#### Create Backend Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (d--survey-mern)
4. Set these values:
   - **Name**: `survey-backend`
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Region**: `oregon` (or your preferred)
   - **Plan**: `Free`

5. Click "Advanced" and add these **Environment Variables**:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://[NEW_USER]:[NEW_PASSWORD]@newone.jzofypi.mongodb.net/surveydb?retryWrites=true&w=majority
JWT_SECRET=[First generated secret]
JWT_REFRESH_SECRET=[Second generated secret]
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=[Get your frontend URL from Step 4]
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=[Your Gmail]
EMAIL_PASS=[Gmail App Password]
EMAIL_FROM=Survey Today <noreply@surveytoday.com>
```

6. Click "Create Web Service"
7. Wait for deployment (you'll see logs)
8. **Copy its URL** (e.g., `https://survey-backend.onrender.com`)

#### Create Frontend Service
1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Set these values:
   - **Name**: `survey-frontend`
   - **Root Directory**: `frontend`
   - **Build**: `npm install && npm run build`
   - **Publish**: `build`

4. Click "Advanced" and add:
```
REACT_APP_API_URL=https://survey-backend.onrender.com/api
```

5. Click "Create Static Site"
6. Wait for deployment
7. **Copy its URL** when done (e.g., `https://survey-frontend.onrender.com`)

#### Update Backend's CLIENT_URL
1. Go back to your Backend service
2. Go to **Environment** section
3. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://survey-frontend.onrender.com
   ```
4. Click "Save" - this triggers redeployment

### Step 4: Test Your Deployment

#### Health Check
```bash
curl https://survey-backend.onrender.com/api/health
# Should return: {"success":true,"message":"Survey Today API is running","env":"production"}
```

#### Test Login (optional)
```bash
curl -X POST https://survey-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

#### Visit Frontend
Open your frontend URL in browser - you should see the Survey Today app!

---

## 🆘 Troubleshooting

### Backend stuck in "Deploy in progress"
- Check **Logs** tab - look for MongoDB connection errors
- Verify all environment variables are set
- Check MongoDB IP whitelist includes 0.0.0.0 (Render's IP)

### "Cannot GET /api/health"
- Ensure `PORT=5000` is in environment variables
- Check that server.js is in `/backend` directory
- Look at Logs tab for startup errors

### Frontend shows "Network Error"
- Open browser DevTools (F12) → Network tab
- Check if API calls are going to correct URL
- Verify `REACT_APP_API_URL` is set in Frontend environment

### CORS Errors in Browser
- Go to Backend service → Environment
- Verify `CLIENT_URL` matches your actual frontend URL (exact domain!)
- Redeploy after changing

---

## 📋 What Changed in Your Project

✅ **Fixed Issues:**
- Removed hardcoded MongoDB credentials from .env
- Added `.gitignore` for backend and frontend
- Created `render.yaml` for automated deployment
- Created `DEPLOYMENT_GUIDE.md` with full documentation
- Frontend .env already configured correctly

✅ **Files Modified:**
- `backend/.env` - cleared credentials (now empty template)
- `backend/.gitignore` - new file to prevent future commits
- `frontend/.gitignore` - new file to prevent future commits
- `render.yaml` - new deployment configuration

:::warning
**IMPORTANT**: Your `.env` with credentials is still in git history! Before using this project:
1. [Rotate your MongoDB password immediately](https://cloud.mongodb.com/v2#/)
2. Push this commit to GitHub
3. Consider force-pushing if production access is at risk
:::

---

## 📞 Still Need Help?

1. **Check Render Logs**: Dashboard → Your Service → Logs tab
2. **Read Full Guide**: See `DEPLOYMENT_GUIDE.md` for advanced topics
3. **Test Locally First**: Run `cd backend && npm start` locally before deploying
4. **Check Environment Variables**: Dashboard → Service → Environment

**Common URLs to remember:**
- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repo: https://github.com/[YOUR_USERNAME]/survey-mern

