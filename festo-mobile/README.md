# Festo Mobile - PingOne OAuth Integration

A React Native Expo application with PingOne OAuth 2.0 authentication and secure user profile management.

## Features

- 🔐 **Secure OAuth 2.0 Authentication** via PingOne
- 👤 **User Profile Management** with detailed information display
- 💾 **Secure Token Storage** using Expo Secure Store
- 🔄 **Token Refresh** mechanism for extended sessions
- 📱 **Responsive UI** designed for mobile
- ⚡ **Fast Development** with Expo Go
- 🌐 **Cross-Platform** (iOS, Android, Web)

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- PingOne account and configured OAuth application
- Backend server running (see [Backend Setup](#backend-setup))

## Installation

### 1. Install Dependencies

```bash
cd festo-mobile
npm install
```

### 2. Configure Environment Variables

Edit `.env` file with your PingOne credentials:

```env
EXPO_PUBLIC_PINGONE_ENV_ID=your_environment_id
EXPO_PUBLIC_PINGONE_CLIENT_ID=your_client_id
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Update PingOne Configuration

The redirect URI is generated at runtime using Expo's `AuthSession.makeRedirectUri`, which ensures it matches the proxy URL used by Expo Go. To view the value, you can log it in your app or replicate the call:

```js
import * as AuthSession from 'expo-auth-session';
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
  projectNameForProxy: '@your-username/festo-mobile',
});
console.log(redirectUri);
```

The generated URI typically looks like:

```
festo-mobile://callback
```

Register that URI in your PingOne OAuth application settings.

For a deployed build (EAS), the exact value may vary depending on your
configuration, but it will keep the `festo-mobile://callback` scheme/path.

## Getting PingOne Credentials

1. Log in to your PingOne admin console
2. Navigate to **Applications > My Applications**
3. Create a new **Native Application** if you haven't already
4. Under **Application Details**, copy:
   - Client ID (used in the mobile app)
   - Client Secret (used **only** on the backend)
5. Under **Redirect URIs**, add your callback URL
6. Copy your **Environment ID** from the main dashboard

## Running the App

### Development with Expo Go

```bash
npm start
```

Then:

- **iOS**: Press `i` in the terminal, or scan QR code with iPhone Camera app
- **Android**: Press `a` in the terminal, or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

### Android/iOS Simulators

```bash
npm run android
# or
npm run ios
```

### Web Browser

```bash
npm run web
```

## Project Structure

```
festo-mobile/
├── src/
│   ├── config/
│   │   └── pingone-config.ts       # PingOne OAuth configuration
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state management
│   │   └── useAuth.ts              # Auth hook
│   ├── screens/
│   │   ├── LoginScreen.tsx         # Login page
│   │   └── DashboardScreen.tsx     # User dashboard (post-login)
│   └── types/
│       └── auth.ts                 # TypeScript type definitions
├── App.tsx                          # Main app component with navigation
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── .env                            # Environment variables
```

## Authentication Flow

```
┌─────────────────┐
│  Login Screen   │
│  (User clicks   │───────┐
│   login button) │       │
└─────────────────┘       │
                          ▼
                  ┌───────────────────┐
                  │   PingOne OAuth   │
                  │  Authorization    │
                  └───────────────────┘
                          │
              (User logs in and grants access)
                          │
                          ▼
                  ┌───────────────────┐
                  │ OAuth Callback    │
                  │ with Auth Code    │
                  └───────────────────┘
                          │
                          ▼
             ┌────────────────────────────┐
             │  Backend Exchanges Code    │
             │  for Tokens (secure)       │
             └────────────────────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Dashboard Screen    │
                │  (User logged in)    │
                │  Display Profile     │
                └──────────────────────┘
```

## Security Features

### Token Storage

- Access tokens stored in Expo Secure Store
- Refresh tokens encrypted and secured
- Tokens cleared on logout

### Token Refresh

- Automatic refresh before expiration
- Manual refresh capability
- Logout on refresh failure

### CORS Protection

- Backend validates origins
- Supports both development and production URLs

## Troubleshooting

### "Failed to load user info"

- Ensure backend server is running on port 3001
- Check `EXPO_PUBLIC_BACKEND_URL` in `.env`
- Verify PingOne credentials are correct

### " Auth window closed prematurely"

- Check redirect URI matches PingOne configuration
- Ensure you're using the correct Expo development URL
- Try scanner QR code again in Expo Go

### "Cannot read property 'user' of undefined"

- Clear AsyncStorage: Press `d` in Expo terminal to clear cache
- Restart the app
- Check `useAuth` hook is used within `AuthProvider`

### Token Expired Errors

- Backend refresh token endpoint should be running
- Check `EXPO_PUBLIC_BACKEND_URL` is correct
- Verify refresh token is stored properly

## Development Tips

### Debug Authentication Flow

Add logging in `src/screens/LoginScreen.tsx`:

```typescript
useEffect(() => {
  console.log('Auth Response:', response);
}, [response]);
```

### Check Stored Tokens

Use Expo DevTools to inspect SecureStore:

```bash
expo prebuild --clean
```

### View Console Logs

- Use `npx expo start --localhost to avoid tunnel mode
- Check standard React Native debugger

## Building for Production

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure app
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

Update redirect URI in PingOne for production:

```
exp://your-app-name.exp.direct/--/pingone-callback
```

## API Reference

### useAuth Hook

```typescript
const auth = useAuth();

// Check if user is logged in
auth.state.isSignedIn

// Get current user
auth.state.user

// Get tokens
auth.state.tokens

// Check loading state
auth.state.isLoading

// Get error
auth.state.error

// Functions
auth.logout()         // Logout user
auth.refreshToken()   // Refresh access token
auth.clearError()     // Clear error message
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_PINGONE_ENV_ID` | PingOne Environment ID | `a1b2c3d4-e5f6-...` |
| `EXPO_PUBLIC_PINGONE_CLIENT_ID` | OAuth Client ID | `client_xyz123` |
| `EXPO_PUBLIC_BACKEND_URL` | Backend OAuth server | `http://localhost:3001` |

## Resources

- [PingOne Documentation](https://docs.pingidentity.com/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Navigation](https://reactnavigation.org/)
- [OAuth 2.0 Spec](https://tools.ietf.org/html/rfc6749)

## License

MIT

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review PingOne documentation
3. Check application logs with Expo DevTools
4. Review backend server logs
