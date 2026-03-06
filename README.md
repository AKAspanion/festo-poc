# Festo Mobile - Complete OAuth Implementation

A production-ready React Native + Expo mobile application with **PingOne OAuth 2.0** authentication and secure user profile management.

## 🚀 Quick Start

### 1. **Read the Setup Guide** (5 minutes)

```bash
cat SETUP_GUIDE.md
```

### 2. **Configure PingOne**

- Go to <https://admin.pingone.com>
- Create OAuth application
- Get: Environment ID, Client ID, Client Secret

### 3. **Configure & Run Backend** (Terminal 1)

```bash
cd festo-backend
npm install
# Edit .env with PingOne credentials
npm start
```

### 4. **Configure & Run Mobile App** (Terminal 2)

```bash
cd festo-mobile
npm install
# Edit .env with PingOne credentials
npm start
# Press 'i' (iOS) or 'a' (Android)
```

**That's it!** Your app is running with OAuth login! ✨

---

## 📋 What's Included

### ✅ Mobile App (React Native Expo)

- Professional login screen with PingOne OAuth
- User dashboard showing full profile info
- Secure token storage (encrypted)
- Token refresh mechanism
- Navigation between login and dashboard
- TypeScript for type safety
- Responsive UI for all screens

### ✅ Backend OAuth Server (Express.js)

- Secure token exchange endpoint
- Token refresh endpoint
- Token revocation endpoint
- User info endpoint
- CORS support for development & production
- Error handling & logging

### ✅ Complete Documentation

- **SETUP_GUIDE.md** - Step-by-step setup (START HERE)
- **QUICK_REFERENCE.md** - Commands & quick answers
- **ARCHITECTURE.md** - System design & flow diagrams
- **IMPLEMENTATION_SUMMARY.md** - What's been built
- **festo-backend/README.md** - Backend API documentation
- **festo-mobile/README.md** - Mobile app documentation

---

## 📁 Project Structure

```
festo/
├── 📖 SETUP_GUIDE.md              ← START HERE
├── 📖 QUICK_REFERENCE.md
├── 📖 ARCHITECTURE.md
├── 📖 IMPLEMENTATION_SUMMARY.md    ← Overview of what's built
│
├── 📂 festo-backend/              # OAuth Server (Node.js Express, TypeScript)
│   ├── index.ts
│   ├── package.json
│   ├── .env (FILL IN)
│   └── README.md
│
└── 📂 festo-mobile/               # Mobile App (React Native)
    ├── App.tsx
    ├── package.json
    ├── .env (FILL IN)
    ├── src/
    │   ├── config/
    │   ├── context/
    │   ├── screens/
    │   └── types/
    └── README.md
```

---

## 🔐 Security Features

- **OAuth 2.0 Authorization Code Flow** - Most secure method
- **Client Secret Protection** - Never exposed in mobile app
- **Encrypted Token Storage** - iOS Keychain, Android Keystore
- **Token Expiration** - Auto refresh before expiration
- **HTTPS Transport** - All connections encrypted
- **CORS Protection** - Origin validation

---

## 📚 Documentation Guide

| Document | Read When | Time |
|----------|-----------|------|
| **SETUP_GUIDE.md** | You want to set up the app | 15 min |
| **QUICK_REFERENCE.md** | You need quick commands | 5 min |
| **ARCHITECTURE.md** | You want to understand the system | 10 min |
| **IMPLEMENTATION_SUMMARY.md** | You want an overview | 5 min |
| **festo-backend/README.md** | You need backend details | 10 min |
| **festo-mobile/README.md** | You need mobile app details | 10 min |

---

## 🎯 What You Can Do

✅ **User Authentication**

- Secure OAuth login with PingOne
- Automatic token refresh
- Safe logout

✅ **User Profile**

- Display user information
- Show profile picture
- Show all user details (email, name, etc.)

✅ **Session Management**

- Persistent login (auto-restore)
- Token expiration handling
- Secure logout

✅ **Backend Services**

- Secure token exchange
- Token refresh & revocation
- User info retrieval

✅ **Deployment**

- iOS & Android builds
- Web version
- Production deployment to cloud

---

## 🚀 Getting Started (Simple Version)

### Prerequisites

- Node.js 18+ installed
- PingOne account (free tier available)
- Expo Go app on your phone (optional, for testing)

### Setup Steps

**Step 1: Get Credentials from PingOne**

1. Go to <https://admin.pingone.com>
2. Create new OAuth application (Native type)
3. Copy: Environment ID, Client ID, Client Secret
4. Add redirect URI: `festo-mobile://callback`

**Step 2: Configure Backend**

```bash
cd festo-backend
npm install
# Edit .env file:
# PINGONE_ENV_ID=<your_env_id>
# PINGONE_CLIENT_ID=<your_client_id>
# PINGONE_CLIENT_SECRET=<your_secret>
npm start
```

Keep backend running! ↑

**Step 3: Configure Mobile App**

```bash
# Open new terminal
cd festo-mobile
npm install
# Edit .env file:
# EXPO_PUBLIC_PINGONE_ENV_ID=<same_as_backend>
# EXPO_PUBLIC_PINGONE_CLIENT_ID=<same_as_backend>
# EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
npm start
```

**Step 4: Run the App**

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web browser
- Or scan QR code with Expo Go app

**Step 5: Test Login**

1. See login screen
2. Tap "Login with PingOne"
3. Enter your PingOne credentials
4. See dashboard with your profile info

---

## 💡 Key Concepts

### OAuth 2.0 Flow

```
Your App → PingOne (user logs in) → Backend 
→ Exchange code for tokens → Your App (logged in)
```

### Token Types

- **Access Token** - Short-lived (1 hour), used for API calls
- **Refresh Token** - Long-lived, used to get new access token
- **ID Token** - Contains user information

### Secure Exchange

The backend exchanges the authorization code for real tokens using the Client Secret. The Client Secret never leaves the backend, so it's safe from app security breaches.

---

## 🔧 Customization

### Change Colors

Edit `festo-mobile/src/screens/DashboardScreen.tsx`

```typescript
const styles = StyleSheet.create({
  // Modify colors here
})
```

### Change OAuth Scopes

Edit `festo-mobile/src/config/pingone-config.ts`

```typescript
scopes: ['openid', 'profile', 'email', 'address']
```

### Add Backend Endpoints

Edit `festo-backend/index.ts`

```typescript
app.post("/new-endpoint", (req, res) => {
  // Your code here
});
```

---

## 🚦 Troubleshooting

### Backend won't start?

```bash
# Check if port 3001 is in use
lsof -i :3001

# Update .env with correct PingOne credentials
cat festo-backend/.env

# Reinstall dependencies
cd festo-backend && rm -rf node_modules && npm install
```

### Mobile app crashes?

```bash
# Clear Expo cache
cd festo-mobile
expo start -c

# Reinstall dependencies
rm -rf node_modules && npm install
```

### Login button doesn't work?

- Make sure backend is running (`npm start` in festo-backend/)
- Check mobile `.env` points to correct backend URL
- Verify PingOne credentials are correct
- Check redirect URI matches in PingOne config

### See logs for errors?

- **Backend logs:** Terminal 1 (where backend runs)
- **Mobile logs:** Expo terminal (press 'j' for browser console)

---

## 📦 Dependencies

### Frontend

- React Native 0.83
- Expo 55
- React Navigation
- Axios (HTTP client)

### Backend

- Express.js (web framework)
- Axios (HTTP client for PingOne)
- JSONWebToken (token handling)

---

## 📱 Platform Support

- ✅ **iOS** (iPhone/iPad)
- ✅ **Android** (phones/tablets)
- ✅ **Web** (browsers)
- ✅ **Development** (Expo Go app)

---

## 🌐 Deployment

When ready to deploy:

1. **Backend** → Heroku, AWS Lambda, Railway, etc.
2. **Mobile** → iOS App Store, Google Play Store

See **SETUP_GUIDE.md** → Production Deployment section

---

## 🎓 Learning Resources

- [PingOne Documentation](https://docs.pingidentity.com/)
- [Expo Guide](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [React Navigation](https://reactnavigation.org/)

---

## ❓ FAQ

**Q: Is my password safe?**
A: Yes! You log in directly with PingOne. Your password never touches our app.

**Q: Where are tokens stored?**
A: Encrypted on your device (Keychain on iOS, Keystore on Android).

**Q: What if my token expires?**
A: App automatically refreshes it. You stay logged in!

**Q: Can I run this on Android?**
A: Yes! Same code runs on iOS, Android, and Web.

**Q: Do I need a real PingOne account?**
A: Yes, but they have a free tier that works perfect for tests.

**Q: How do I deploy to the App Store?**
A: See SETUP_GUIDE.md → Building for Production section.

---

## 📖 Read Next

For complete instructions, read in this order:

1. **IMPLEMENTATION_SUMMARY.md** (what's built)
2. **SETUP_GUIDE.md** (how to set up)
3. **QUICK_REFERENCE.md** (quick answers)
4. **ARCHITECTURE.md** (how it works)

---

## 🎉 You're Ready

Everything you need is set up. Just follow **SETUP_GUIDE.md** and you'll have a fully functional OAuth app in 30 minutes!

**Next:** Open `SETUP_GUIDE.md` →

---

## 💬 Questions?

Check the documentation files - they have detailed explanations for everything!

- 🔐 Security questions? → ARCHITECTURE.md
- 🚀 Setup issues? → SETUP_GUIDE.md
- 🔧 Backend help? → festo-backend/README.md
- 📱 Mobile help? → festo-mobile/README.md

---

**Happy coding!** 🚀
