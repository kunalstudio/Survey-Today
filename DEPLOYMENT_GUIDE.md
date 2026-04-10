# Survey Today MERN - Deployment Guide

## ⚠️ CRITICAL SECURITY ISSUE FIXED

Your MongoDB credentials were exposed in the committed `.env` file. This has been cleaned up:
- **Old credentials deleted** from `backend/.env`
- **New `.gitignore` files** added to backend and frontend directories
- **You must rotate your MongoDB credentials immediately** before deploying

### Steps to Secure Your Database:
1. Go to MongoDB Atlas
2. Delete the old user (Kunal:kunal123)
3. Create a new user with a strong password
4. Update the `MONGO_URI` in Render environment variables

---

## Project Status: ✅ Ready to Deploy

### What's Been Fixed:
1. ✅ Cleared exposed `.env` with credentials
2. ✅ Created `.gitignore` files for subdirectories
3. ✅ Created `render.yaml` for automated deployment configuration
4. ✅ Verified backend code for syntax errors
5. ✅ Verified all dependencies are installed

---

## Deployment Checklist

### Before Deploying:

#### 1. **Update MongoDB Credentials (URGENT)**
```bash
# In Render Dashboard:
# Backend Service → Environment Variables
MONGO_URI=mongodb+srv://[NEW_USERNAME]:[NEW_PASSWORD]@newone.jzofypi.mongodb.net/surveydb?retryWrites=true&w=majority
```

#### 2. **Generate JWT Secrets**
```bash
# Run in your terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run this twice and use results for JWT_SECRET and JWT_REFRESH_SECRET
```

#### 3. **Environment Variables for Render Backend**
Set these in Render Dashboard → Backend Service → Environment:

```
PORT=5000
NODE_ENV=production
MONGO_URI=[Your new MongoDB URI]
JWT_SECRET=[Generated secret from step 2]
JWT_REFRESH_SECRET=[Generated secret from step 2]
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=https://your-frontend-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=[Your Gmail]
EMAIL_PASS=[Gmail App Password]
EMAIL_FROM=SurveyOS <noreply@surveyos.com>
```

#### 4. **Frontend .env.production**
Frontend is already configured with:
```
REACT_APP_API_URL=https://survey-today.onrender.com/api
```
Update this to match your actual Render backend URL.

---

## Deployment Options

### Option 1: Using Render Dashboard (Recommended for Beginners)

1. **Connect GitHub**
   - Go to render.com
   - Sign in or create account
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Create Backend Service**
   - Name: `survey-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Set all variables above

3. **Create Frontend Service**
   - Name: `survey-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Framework: React (auto-detected)
   - Environment: Set REACT_APP_API_URL

4. **Connect Services**
   - Note Backend URL (e.g., `https://survey-backend.onrender.com`)
   - Update Frontend REACT_APP_API_URL to point to backend
   - Redeploy frontend

### Option 2: Using render.yaml (Automated)

The `render.yaml` in your project root can be used for automated deployment:

1. Create both services from YAML
2. Update URLs in the YAML file
3. Commit and push to trigger automatic deployment

---

## Testing After Deployment

### Backend Health Check
```bash
curl https://your-backend-url/api/health
# Expected response: {"success":true,"message":"SurveyOS API is running","env":"production"}
```

### Test API Endpoint
```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Frontend Build Test
- Visit your frontend URL
- Check browser console for any errors
- Test API connectivity from UI

---

## Troubleshooting

### Backend Won't Start
1. **Check Render logs**: Render Dashboard → Backend → Logs
2. **Common issues**:
   - Missing `MONGO_URI` environment variable
   - Invalid JWT secrets
   - MongoDB connection timeout
   - Port conflicts

### API Not Responding
1. **Check CORS configuration**: Frontend URL must be in `CLIENT_URL`
2. **Verify Authorization header**: Ensure frontend sends `Authorization: Bearer [token]`
3. **Check MongoDB connection**: Test with health endpoint

### Frontend Build Failure
1. **Check build logs**: Render Dashboard → Frontend → Logs
2. **Ensure dependencies installed**: Check `package-lock.json` exists
3. **Verify REACT_APP_API_URL**: Must be set correctly before build

---

## Production Best Practices

### Security
- ✅ Environment variables for all secrets
- ✅ HTTPS enforced
- ✅ CORS configured for specific origins
- ✅ Rate limiting enabled
- ✅ Helmet security headers enabled
- ⚠️ TODO: Enable email verification for new users
- ⚠️ TODO: Set up email for password reset

### Performance
- ✅ Compression enabled
- ✅ Rate limiting configured
- ⚠️ TODO: Add database indexing
- ⚠️ TODO: Enable response caching

### Monitoring
- ⚠️ TODO: Set up error tracking (Sentry)
- ⚠️ TODO: Set up analytics (Google Analytics)
- ⚠️ TODO: Monitor API response times

---

## Environment Variables Summary

### Backend (.env)
| Variable | Required | Example |
|----------|----------|---------|
| PORT | No | 5000 |
| NODE_ENV | Yes | production |
| MONGO_URI | Yes | mongodb+srv://user:pass@cluster.mongodb.net/surveydb |
| JWT_SECRET | Yes | 64-char hex string |
| JWT_REFRESH_SECRET | Yes | 64-char hex string |
| JWT_EXPIRE | No | 7d |
| JWT_REFRESH_EXPIRE | No | 30d |
| CLIENT_URL | Yes | https://frontend-url.vercel.app |
| EMAIL_HOST | No | smtp.gmail.com |
| EMAIL_PORT | No | 587 |
| EMAIL_USER | No | your-email@gmail.com |
| EMAIL_PASS | No | Gmail app password |
| EMAIL_FROM | No | SurveyOS <noreply@surveyos.com> |

### Frontend (.env)
| Variable | Required | Example |
|----------|----------|---------|
| REACT_APP_API_URL | Yes | https://backend-url.onrender.com/api |

---

## File Structure After Setup
```
survey-mern/
├── .gitignore (root)
├── render.yaml
├── backend/
│   ├── .env (NEVER commit - added to .gitignore)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   └── utils/
└── frontend/
    ├── .env (NEVER commit - added to .gitignore)
    ├── .gitignore
    ├── package.json
    └── src/
```

---

## Next Steps

1. ✅ **Review all changes** - Check git diff before committing
2. ✅ **Regenerate MongoDB password** - CRITICAL for security
3. ✅ **Set Render environment variables** - All variables from checklist
4. ✅ **Test locally first** - Run `npm start` in backend and frontend
5. ✅ **Push to GitHub** - Trigger automatic Render deployment
6. ✅ **Test production** - Use health check endpoint
7. ✅ **Monitor logs** - Watch Render dashboard for errors

---

## Support & Debugging

### Render Logs Location
- Render Dashboard → Your Service → Logs
- Scroll to find error messages

### MongoDB Connection Test
```javascript
// Add to server.js temporarily to debug
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});
```

### Common Error Messages
- `ECONNREFUSED`: MongoDB not accessible - check IP whitelist in Atlas
- `Invalid JWT`: Check JWT_SECRET matches between services
- `CORS error`: Check CLIENT_URL is correctly set to frontend URL

