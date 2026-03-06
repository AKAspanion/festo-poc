# Quick Reference Guide

## Start Everything in 3 Steps

### Terminal 1: Start Backend

```bash
cd /Users/ankitkumarpandit/Documents/work/festo/festo-backend
npm install  # First time only
npm start    # or 'npm run dev' for auto-reload
```

Expect to see:

```
🚀 OAuth Backend Server running on http://localhost:3001
✅ Server is ready to handle OAuth callbacks
```

### Terminal 2: Start Mobile App

```bash
cd /Users/ankitkumarpandit/Documents/work/festo/festo-mobile
npm install  # First time only
npm start
```

Expect to see:

```
Expo development server running on http://localhost:19000
Scan the QR code above
```

### Terminal 3: Run App

- **iOS Simulator:** Press `i` in Terminal 2
- **Android Emulator:** Press `a` in Terminal 2
- **Web Browser:** Press `w` in Terminal 2
- **Physical Device:** Scan QR code with Expo Go app

---

## Configuration Files Location

### Backend Configuration

- **Environment:** `/Users/ankitkumarpandit/Documents/work/festo/festo-backend/.env`
- **Server Code:** `/Users/ankitkumarpandit/Documents/work/festo/festo-backend/index.ts`

### Mobile Configuration

- **Environment:** `/Users/ankitkumarpandit/Documents/work/festo/festo-mobile/.env`
- **Main App:** `/Users/ankitkumarpandit/Documents/work/festo/festo-mobile/App.tsx`
- **Login Screen:** `/Users/ankitkumarpandit/Documents/work/festo/festo-mobile/src/screens/LoginScreen.tsx`
- **Dashboard:** `/Users/ankitkumarpandit/Documents/work/festo/festo-mobile/src/screens/DashboardScreen.tsx`
- **Auth Logic:** `/Users/ankitkumarpandit/Documents/work/festo/festo-mobile/src/context/AuthContext.tsx`

---

## Environment Variables

### What You Need to Fill In

1. **Get from PingOne Admin Console:**
   - Environment ID
   - Client ID
   - Client Secret

2. **In `festo-backend/.env`:**

   ```
   PINGONE_ENV_ID=<your_environment_id>
   PINGONE_CLIENT_ID=<your_client_id>
   PINGONE_CLIENT_SECRET=<your_client_secret>
   ```

3. **In `festo-mobile/.env`:**

   ```
   EXPO_PUBLIC_PINGONE_ENV_ID=<same_as_backend>
   EXPO_PUBLIC_PINGONE_CLIENT_ID=<same_as_backend>
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

---

## Key Features Implemented

### ✅ Authentication

- PingOne OAuth 2.0 integration
- Secure token exchange via backend
- Token refresh mechanism
- Secure token storage (Expo Secure Store)

### ✅ User Interface

- Login screen with PingOne button
- Dashboard showing user details:
  - Name, email, profile picture
  - First/last name, locale
  - Phone numbers (if available)
  - Addresses (if available)
- Logout functionality

### ✅ Backend Server

- Token exchange endpoint (`POST /exchange-code`)
- Token refresh endpoint (`POST /refresh-token`)
- Token revocation endpoint (`POST /revoke`)
- User info endpoint (`GET /user-info`)
- CORS support for development and production

### ✅ Navigation

- Stack navigator
- Conditional rendering (login vs logged-in)
- Automatic redirect after login

### ✅ Documentation

- Comprehensive README files
- Setup guide with step-by-step instructions
- Backend API documentation
- Troubleshooting guides

---

## Testing the App

### Test 1: Check Backend is Running

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"OK","message":"OAuth backend server is running"}`

### Test 2: Open App and See Login Screen

- Should see "Festo Mobile" title
- Should see "Login with PingOne" button

### Test 3: Login with PingOne

1. Tap login button
2. PingOne login page opens
3. Enter your PingOne credentials
4. Grant permissions
5. Get redirected back to app

### Test 4: See Dashboard

1. Should see your profile information
2. Should see "Logout" button
3. Try logging out and going back to login

---

## Project Structure

```
festo/
├── SETUP_GUIDE.md                    # Main setup instructions
├── QUICK_REFERENCE.md                # This file
│
├── festo-backend/                          # OAuth Backend Server
│   ├── index.ts                      # Express server
│   ├── package.json                  # Dependencies
│   ├── .env                          # Configuration (fill this in)
│   ├── .gitignore                    # Git ignore
│   └── README.md                     # Backend documentation
│
└── festo-mobile/                     # React Native Mobile App
    ├── App.tsx                       # Main app component
    ├── app.json                      # Expo configuration
    ├── package.json                  # Dependencies
    ├── .env                          # Configuration (fill this in)
    ├── tsconfig.json                 # TypeScript config
    │
    ├── src/
    │   ├── config/
    │   │   └── pingone-config.ts     # PingOne configuration
    │   ├── context/
    │   │   ├── AuthContext.tsx       # Auth state management
    │   │   └── useAuth.ts            # Auth hook
    │   ├── screens/
    │   │   ├── LoginScreen.tsx       # Login page
    │   │   └── DashboardScreen.tsx   # User dashboard
    │   └── types/
    │       └── auth.ts               # TypeScript types
    │
    ├── assets/                       # App icons and images
    └── README.md                     # Mobile app documentation
```

---

## Common Commands

### Backend

```bash
cd festo-backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Check logs
npm start 2>&1 | tee server.log
```

### Mobile App

```bash
cd festo-mobile

# Install dependencies
npm install

# Start Expo dev server
npm start

# Start with specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser

# Clear cache if having issues
expo start -c
```

### Git & Version Control

```bash
# Add all files
git add .

# Commit changes
git commit -m "Setup PingOne OAuth integration"

# Push to remote
git push origin main
```

---

## Troubleshooting Checklist

### App crashes on startup?

- [ ] Backend is running on port 3001
- [ ] Mobile .env has correct values
- [ ] Run `npm install` in both directories
- [ ] Clear cache: `expo start -c`

### Login button doesn't work?

- [ ] Backend running? `curl http://localhost:3001/health`
- [ ] PingOne credentials correct in .env?
- [ ] Redirect URI in PingOne app matches?

### "Cannot read property 'user'"?

- [ ] AuthProvider wraps the app (check App.tsx)
- [ ] useAuth hook inside AuthProvider (not at top level)
- [ ] Clear AsyncStorage and restart

### On physical device?

- [ ] Use IP instead of localhost
- [ ] `EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3001`
- [ ] Both phone and computer on same WiFi

---

## Production URLs

After deployment, update these files:

### In PingOne Admin Console

```
Redirect URIs:
- https://festo-backend.herokuapp.com/callback
- exp://your-app-slug.exp.direct/--/pingone-callback
```

### In `festo-mobile/.env`

```
EXPO_PUBLIC_BACKEND_URL=https://festo-backend.herokuapp.com
```

### In `festo-backend/.env`

```
NODE_ENV=production
PORT=3001  # Or whatever your hosting provides
```

---

## File Editing Guide

### To change colors/styling

Edit `festo-mobile/src/screens/DashboardScreen.tsx`

- Look for `const styles = StyleSheet.create({...})`

### To change login button text

Edit `festo-mobile/src/screens/LoginScreen.tsx`

- Line: `<Text style={styles.loginButtonText}>Login with PingOne</Text>`

### To add new endpoints to backend

Edit `festo-backend/index.ts`

- Add new `app.post()` or `app.get()` routes
- Restart backend with `npm start`

### To change PingOne scopes

Edit `festo-mobile/src/config/pingone-config.ts`

- Update `scopes` array

---

## Support Resources

| Resource | Link |
|----------|------|
| PingOne Docs | <https://docs.pingidentity.com/> |
| Expo Guide | <https://docs.expo.dev/> |
| React Native | <https://reactnative.dev/> |
| OAuth 2.0 | <https://tools.ietf.org/html/rfc6749> |
| JWT Decoder | <https://jwt.io/> |
| Heroku Deploy | <https://devcenter.heroku.com/> |

---

## What's Next?

1. **Fill in `.env` files** with PingOne credentials
2. **Start backend** in Terminal 1
3. **Start mobile app** in Terminal 2
4. **Test login flow** in Terminal 3
5. **Deploy to production** when ready

Good luck! 🚀
