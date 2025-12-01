# ✅ Render Deployment Checklist

## Pre-Deployment

### 🔴 Critical Security Fixes
- [x] Remove hardcoded MongoDB credentials
- [x] Configure CORS properly
- [x] Add environment variable validation
- [x] Server binds to 0.0.0.0

### 📝 Configuration Files
- [x] `.env.example` created
- [x] `.gitignore` updated
- [x] `render.yaml` created (optional)
- [x] `package.json` has `start` script

### 🗄️ Database
- [ ] MongoDB Atlas cluster created
- [ ] Database connection string ready
- [ ] Network access configured (allow Render IPs)
- [ ] Database user created with proper permissions

### 🌐 Environment Variables (Set in Render Dashboard)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` - Comma-separated frontend URLs
- [ ] `PORT` - Usually auto-set by Render (optional)

---

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Web Service
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Select the repository and branch

### 3. Configure Service
- **Name**: `chatapp-backend`
- **Environment**: `Node`
- **Build Command**: `cd mock-backend && npm install`
- **Start Command**: `cd mock-backend && npm start`
- **Plan**: Free (or Paid for production)

### 4. Set Environment Variables
In Render dashboard → Environment:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp_db
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 5. Deploy
- Click "Create Web Service"
- Wait for build to complete
- Check logs for errors

---

## Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-backend.onrender.com/health
```
Expected: `{"status":"ok","message":"Mock backend server is running"}`

### 2. Test Registration
```bash
curl -X POST https://your-backend.onrender.com/api/register/check-availability \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Test CORS
- Open browser console on your frontend
- Make a request to the backend
- Check for CORS errors

### 4. Check Logs
- Go to Render dashboard → Logs
- Verify MongoDB connection success
- Check for any errors

---

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Verify connection string format
- Check database user permissions

### Issue: CORS Errors
**Solution**:
- Add frontend URL to `ALLOWED_ORIGINS`
- Include protocol (https://)
- No trailing slashes

### Issue: Service Sleeping (Free Tier)
**Solution**:
- First request after sleep takes ~30 seconds
- Consider upgrading to paid plan
- Use a ping service to keep alive (not recommended for production)

### Issue: Build Fails
**Solution**:
- Check build logs in Render
- Verify `package.json` is correct
- Ensure all dependencies are listed

---

## Production Recommendations

1. **Upgrade to Paid Plan**
   - No sleep time
   - Better performance
   - More resources

2. **Set Up Monitoring**
   - Use Render's built-in monitoring
   - Set up error tracking (Sentry, etc.)

3. **Database Backups**
   - Enable MongoDB Atlas backups
   - Regular backup schedule

4. **Security**
   - Use strong MongoDB passwords
   - Rotate credentials regularly
   - Enable MongoDB authentication

5. **Performance**
   - Enable MongoDB indexes
   - Monitor query performance
   - Use connection pooling

---

## Quick Reference

### Render Service URL
```
https://your-backend-name.onrender.com
```

### Health Check
```
GET /health
```

### API Base URL
```
https://your-backend-name.onrender.com/api
```

### Environment Variables Template
```bash
MONGODB_URI=your-connection-string
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.com
```

---

## ✅ Status: Ready for Deployment!

All critical issues have been fixed. Follow the checklist above to deploy successfully.

