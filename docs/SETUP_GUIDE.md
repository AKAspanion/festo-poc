# Festo Mobile - Complete Setup Guide

This guide will walk you through setting up the entire Festo Mobile application with PingOne OAuth integration.

## Table of Contents

1. [PingOne Configuration](#pingone-configuration)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)

---

## PingOne Configuration

### Step 1: Create PingOne Account

1. Go to [PingOne](https://admin.pingone.com)
2. Sign up or log in to your account
3. Navigate to the appropriate region (US, EU, APAC)

### Step 2: Create OAuth Application

1. In PingOne Admin Console, go to **Connections → Applications**
2. Click **Create Application**
3. Choose **Application Type: Native**
4. Fill in application details:
   - **Application Name:** Festo Mobile
   - **Description:** Mobile OAuth authentication

### Step 3: Configure OAuth Settings

1. In your application settings, go to **OAuth Configuration**
2. **Grant Types:** Enable
   - ✅ Authorization Code
   - ✅ Refresh Token

3. **Redirect URIs:** Our app computes the URI at runtime using Expo's
   `AuthSession.makeRedirectUri` API with a custom URL scheme. You can generate
   the exact value with the following snippet and then register it with PingOne:

   ```js
   import * as AuthSession from "expo-auth-session";

   const redirectUri = AuthSession.makeRedirectUri({
     scheme: "festo-mobile",
     path: "callback",
   });

   console.log(redirectUri);
   // typically prints: festo-mobile://callback
   ```

   (For production, the exact value may vary depending on your Expo/EAS
   configuration, but it will keep the `festo-mobile://callback` scheme/path.)

4. **Response Types:** Select
   - ✅ code
   - ✅ id_token token

5. **Save Settings**

### Step 4: Get Credentials

1. Go to **Credentials** tab
2. Copy:
   - **Client ID** (public, used in mobile app)
   - **Client Secret** (keep secure, backend only)
3. Note your **Environment ID** (visible in dashboard URL)

Your PingOne credentials are now ready!

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd festo-backend
npm install
```

This installs:

- `express` - Web server
- `axios` - HTTP requests to PingOne
- `cors` - Cross-origin request handling
- `body-parser` - JSON parsing
- `dotenv` - Environment variable management
- `jsonwebtoken` - Token decoding

### Step 2: Configure Environment

Edit `festo-backend/.env`:

```env
# From PingOne Credentials tab
PINGONE_ENV_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
PINGONE_CLIENT_ID=client_abc123xyz456
PINGONE_CLIENT_SECRET=secret_xyz789abc456def

# Server settings
PORT=3001
NODE_ENV=development
```

### Step 3: Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:

```
🚀 OAuth Backend Server running on http://localhost:3001
✅ Server is ready to handle OAuth callbacks
```

**Keep the backend running!** Open a new terminal for the next steps.

### Step 4: Test Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "OAuth backend server is running"
}
```

---

## Mobile App Setup

### Step 1: Install Dependencies

```bash
cd festo-mobile
npm install
```

This installs React Native, Expo, and OAuth libraries.

### Step 2: Configure Environment

Edit `festo-mobile/.env`:

```env
# Use SAME credentials from PingOne
EXPO_PUBLIC_PINGONE_ENV_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
EXPO_PUBLIC_PINGONE_CLIENT_ID=client_abc123xyz456

# Point to running backend server
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Important:**

- The `PINGONE_CLIENT_SECRET` should NOT be in the mobile `.env`
- Backend handles secret securely

### Step 3: Update Redirect URI (Mobile)

The redirect URI is computed for you and exported via the configuration
module. It uses `AuthSession.makeRedirectUri` behind the scenes so that it
will be correct when running under the Expo proxy. You can log or inspect it
as shown below if you ever need to verify the value:

```ts
import { PINGONE_CONFIG } from './src/config/pingone-config';
console.log('redirect URI', PINGONE_CONFIG.redirectUrl);
```

No manual edits to the screen component are necessary unless you want to
override the default value.

The URI typically looks like `festo-mobile://callback` for
local development.

### Step 4: Start Mobile App

**Option A: Expo development server (Recommended)**

```bash
npm start
```

You should see:

```
Your URL is: exp://localhost:19000
Scan the QR code above with Expo Go or press:
 a - for Android
 i - for iOS
 w - for web
```

**Option B: iOS Simulator**

```bash
npm run ios
```

**Option C: Android Emulator**

```bash
npm run android
```

**Option D: Web Browser**

```bash
npm run web
```

---

## Testing the Integration

### Complete Authentication Flow Test

1. **Backend running?**
   - Check terminal: Should see "OAuth Backend Server running"
   - Test: `curl http://localhost:3001/health`

2. **Mobile app running?**
   - Check terminal: Should see "Expo development server running"
   - Should see QR code

3. **In the app:**
   - See login screen with "Login with PingOne" button
   - Tap the button

4. **PingOne login window opens:**
   - Enter your PingOne credentials
   - Review permissions, click "Authorize"

5. **Expected flow:**

   ```
   App → PingOne (login) → Redirect to app → Backend (exchange code) 
   → PingOne (get tokens) → App (show dashboard)
   ```

6. **You should see dashboard with:**
   - Your name
   - Your email
   - Your profile picture
   - User ID
   - "Logout" button

### Verify Token Storage

Check Expo DevTools to inspect stored tokens:

1. While app is running, press `Cmd+J` (Mac) or `Ctrl+J` (Windows)
2. Check localStorage for `auth_tokens` and `auth_user`
3. Should contain base64-encoded user and token data

### Test Logout

1. Tap "Logout" button on dashboard
2. Should return to login screen
3. Tokens should be cleared from storage

---

## Troubleshooting

### Issue: "Failed to exchange code"

**Cause:** Backend not reachable or misconfigured

**Solution:**

```bash
# 1. Check backend is running
curl http://localhost:3001/health

# 2. Check backend .env has correct credentials
cat festo-backend/.env

# 3. Check mobile app points to correct backend
cat festo-mobile/.env | grep BACKEND_URL

# 4. On physical device/emulator, use:
# EXPO_PUBLIC_BACKEND_URL=http://<YOUR_IP>:3001
# not localhost
```

### Issue: "Invalid Redirect URI"

**Cause:** Redirect URI in PingOne doesn't match app

**Solution:**

1. Get actual redirect URI from app console
2. Go to PingOne Admin Console
3. Find your application
4. Under OAuth Configuration → Redirect URIs
5. Add the exact URI from step 1
6. Save and try again

### Issue: "Cannot find module 'axios'"

**Solution:**

```bash
# Make sure dependencies are installed
npm install

# Check axios is listed
npm list axios
```

### Issue: "CORS error" in mobile app

**Solution:**

1. Backend must be running
2. Check backend .env for correct port
3. In backend `index.js`, verify CORS whitelist includes your origin
4. For physical device, use device IP instead of localhost

### Issue: "Secure Store not available"

**Solution:**

- This is Expo Secure Store limitation
- For web, will use fallback storage
- Make sure you're using Expo SDK 55.0+

### Issue: "App keeps showing login screen"

**Solution:**

1. Clear Expo cache: `expo start -c`
2. Clear app storage manually
3. Check user is actually logging in (watch PingOne logs)
4. Verify backend token exchange is working

### Check Server Logs

**Backend logs (shows all HTTP requests):**

```bash
# See detailed logs
curl -v http://localhost:3001/exchange-code \
  -H "Content-Type: application/json" \
  -d '{"code":"test123"}'
```

**Mobile app logs:**

- Expo terminal shows console.log output
- Use React Native Debugger for detailed inspection

---

## Production Deployment

### Backend Deployment

#### Option 1: Deploy to Heroku (Free Alternative)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd backend
heroku create festo-oauth-backend

# Set environment variables
heroku config:set PINGONE_ENV_ID=your_env_id
heroku config:set PINGONE_CLIENT_ID=your_client_id
heroku config:set PINGONE_CLIENT_SECRET=your_client_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 2: Deploy to Railway

1. Connect Railway.app to your GitHub repo
2. Select `backend` directory
3. Add environment variables in Railway dashboard
4. Railway auto-deploys on git push

#### Option 3: Deploy to AWS Lambda

1. Install AWS CLI and Serverless Framework
2. Create Lambda function
3. Set environment variables
4. Deploy with serverless CLI

**Your backend URL:** `https://festo-oauth-backend-xxx.herokuapp.com`

### Mobile App Deployment

#### Build with EAS (Recommended)

```bash
cd festo-mobile

# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Update redirect URI for production
# In app.json, add your production URL

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

#### Update PingOne for Production

1. Go to PingOne Admin Console
2. Your application settings
3. Under OAuth Configuration → Redirect URIs
4. Add production redirect URIs:

   ```
   exp://your-app-name.exp.direct/--/pingone-callback
   https://your-deployed-url/pingone-callback
   ```

#### Update Mobile .env for Production

```env
EXPO_PUBLIC_PINGONE_ENV_ID=<same>
EXPO_PUBLIC_PINGONE_CLIENT_ID=<same>
EXPO_PUBLIC_BACKEND_URL=https://festo-oauth-backend-xxx.herokuapp.com
```

### Security Checklist

- ✅ Client Secret only in backend
- ✅ Backend running on HTTPS (production)
- ✅ Environment variables not committed to Git
- ✅ CORS properly configured for production domains
- ✅ Rate limiting enabled on backend
- ✅ Tokens stored securely on mobile
- ✅ Refresh token rotation enabled
- ✅ Token expiration enforced

---

## Architecture Diagram

```
┌─────────────────────┐
│   Festo Mobile App  │
│   (React Native)    │
└──────────┬──────────┘
           │
           │ 1. Request login
           │    (via Expo AuthSession)
           ▼
┌─────────────────────┐
│  PingOne OAuth      │
│  Authorization      │
│  (User Login)       │
└──────────┬──────────┘
           │
           │ 2. Redirect with auth code
           │
           ▼
┌──────────────────────────┐
│   Backend Server         │
│   (Express + Node.js)    │
│   http://localhost:3001  │
└──────────┬───────────────┘
           │
           │ 3. Exchange code for tokens
           │    (using client_secret)
           │
           ▼
┌──────────────────────┐
│  PingOne API         │
│  Token Endpoint      │
└──────────┬───────────┘
           │
           │ 4. Return access + refresh tokens
           │
           ▼
┌──────────────────────┐
│  Backend            │
│  Stores user info   │
└──────────┬──────────┘
           │
           │ 5. Return to mobile app
           │
           ▼
┌──────────────────────┐
│  Mobile App         │
│  Dashboard Screen   │
│  Shows User Profile │
└──────────────────────┘
```

---

## Next Steps

1. ✅ Configure PingOne OAuth
2. ✅ Set up and run backend
3. ✅ Set up and run mobile app
4. ✅ Test the login flow
5. ✅ Review user profile display
6. 🚀 Deploy to production

## Support & Resources

- **PingOne Docs:** <https://docs.pingidentity.com/>
- **Expo Guide:** <https://docs.expo.dev/>
- **React Native:** <https://reactnative.dev/>
- **OAuth 2.0:** <https://tools.ietf.org/html/rfc6749>
- **Backend README:** See `festo-backend/README.md`
- **Mobile README:** See `festo-mobile/README.md`

## Quick Reference Commands

```bash
# Start backend
cd festo-backend && npm start

# Start mobile app
cd festo-mobile && npm start

# Install dependencies
npm install

# See mobile app logs
# Press 'j' in Expo terminal

# Test backend health
curl http://localhost:3001/health

# Clear Expo cache
expo start -c

# Build for production
eas build --platform ios   # or android
```

Good luck! Your authentication system is now ready! 🎉
