# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Festo Mobile App                            │
│                   (React Native Expo)                           │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐         │
│  │   Login Screen       │      │  Dashboard Screen    │         │
│  │ - PingOne button     │  ──→ │ - User info          │         │
│  │ - OAuth flow         │      │ - Profile picture    │         │
│  │ - Error handling     │      │ - Logout button      │         │
│  └──────────────────────┘      └──────────────────────┘         │
│                │                          ▲                      │
│                │ Auth Context             │                     │
│                └──────────────┬───────────┘                      │
│                               │                                  │
│         ┌─────────────────────┴─────────────────────┐            │
│         │  Auth Context                             │            │
│         │  - Manage login state                     │            │
│         │  - Store tokens in Secure Store           │            │
│         │  - Handle token refresh                   │            │
│         │  - Manage user data                       │            │
│         └─────────────────────┬─────────────────────┘            │
│                               │                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ API Calls via Axios
                                │
┌───────────────────────────────▼──────────────────────────────┐
│                   Backend OAuth Server                        │
│                    (Express.js Node.js)                       │
│                   http://localhost:3001                       │
│                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │ POST /exchange-code  │         │ POST /refresh-token  │   │
│  │ - Receives auth code │         │ - Takes refresh token│   │
│  │ - Calls PingOne API  │         │ - Returns new token  │   │
│  │ - Returns tokens     │         └──────────────────────┘   │
│  └──────────────────────┘                                     │
│                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │ POST /revoke         │         │ GET /user-info       │   │
│  │ - Revokes token      │         │ - Gets user details  │   │
│  │ - Called on logout   │         │ - Returns user data  │   │
│  └──────────────────────┘         └──────────────────────┘   │
│                                                               │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                │ HTTPS/REST API
                                │
┌───────────────────────────────▼──────────────────────────────┐
│                      PingOne OAuth Service                    │
│              https://auth.pingone.com/{ENV_ID}/as             │
│                                                               │
│  Endpoints:                                                   │
│  - /authorization (browser redirect)                          │
│  - /token (OAuth token exchange)                              │
│  - /revoke (token revocation)                                 │
│  - /userinfo (user information)                               │
│                                                               │
│  Optional: PingOne API for additional user data               │
│  https://api.pingone.com/v1/environments/{ENV_ID}/users       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow - Authentication Process

### Step 1: User Initiates Login

```
User taps "Login with PingOne" button
         │
         ▼
    React Native App initiates OAuth request using Expo AuthSession
         │
         ├─ Client ID: From pingone-config.ts
         ├─ Scopes: ['openid', 'profile', 'email']
         ├─ Redirect URL: festo-mobile://callback
         │
         ▼
    Browser opens PingOne OAuth endpoint
```

### Step 2: User Authentication with PingOne

```
PingOne Shows Login Screen
         │
         ├─ User enters email/password
         ├─ User grants app permissions
         │
         ▼
    PingOne generates Authorization Code
         │
         ▼
    PingOne redirects to mobile app with code parameter
```

### Step 3: Code Exchange (Secure Backend)

```
Mobile App receives authorization code
         │
         ├─ NOT the actual token (code is temporary)
         │
         ▼
    App sends code to Backend via HTTPS
         │
         ├─ POST /exchange-code
         ├─ Body: { code, redirectUrl }
         │
         ▼
    Backend receives code
         │
         ├─ Backend has Client Secret (never exposed in app)
         ├─ Backend calls PingOne token endpoint
         │
         ├─ Sends:
         │  - Authorization Code
         │  - Client ID
         │  - Client Secret (secure)
         │  - Redirect URI
         │
         ▼
    PingOne validates and returns:
         - Access Token (for API calls)
         - Refresh Token (for token renewal)
         - ID Token (contains user info)
         - Expires In (lifetime in seconds)
         │
         ▼
    Backend decodes ID Token to extract user info
         │
         ├─ User ID
         ├─ Email
         ├─ Name
         ├─ Profile Picture
         │
         ▼
    Backend returns to Mobile App:
         - All tokens
         - Decoded user information
```

### Step 4: Store and Use

```
Mobile App receives tokens + user info
         │
         ├─ Store in Secure Store (encrypted)
         │  - auth_tokens
         │  - auth_user
         │
         ▼
    Auth Context updates state
         │
         ├─ isSignedIn = true
         ├─ user = { ... }
         ├─ tokens = { accessToken, refreshToken, ... }
         │
         ▼
    Navigation shows Dashboard Screen
         │
         ├─ Display user profile
         ├─ Show user information
         ├─ Enable logout
```

### Step 5: Token Refresh (Automatic)

```
When Access Token expires:
         │
         ├─ Token has expiration time (expiresAt)
         │
         ▼
    Auth Context detects expiration
         │
         ▼
    Calls POST /refresh-token
         │
         ├─ Sends: refreshToken
         │
         ▼
    Backend exchanges refresh token for new access token
         │
         ├─ Sends refresh token to PingOne
         │
         ▼
    PingOne returns new access token
         │
         ▼
    Backend returns to app
         │
         ▼
    App updates stored token silently
         │
         ├─ No user intervention needed
         ├─ User stays logged in
```

## Technology Stack

### Frontend (Mobile App)

```
┌─────────────────────────────────────────────────┐
│ React Native 0.83.2                              │
│ - Cross-platform native mobile framework         │
│                                                  │
├─────────────────────────────────────────────────┤
│ Expo 55.0.5                                      │
│ - Development & deployment platform              │
│ - Managed app infrastructure                     │
│                                                  │
├─────────────────────────────────────────────────┤
│ Expo Auth Session ~55.0.0                        │
│ - OAuth 2.0 authentication                       │
│ - Browser-based OAuth flow                       │
│                                                  │
├─────────────────────────────────────────────────┤
│ Expo Secure Store ~14.0.0                        │
│ - Encrypted token storage                        │
│ - Platform: iOS Keychain, Android Keystore      │
│                                                  │
├─────────────────────────────────────────────────┤
│ React Navigation                                 │
│ - Stack-based navigation                         │
│ - Screen management                              │
│                                                  │
├─────────────────────────────────────────────────┤
│ Axios ~1.6.2                                     │
│ - HTTP client                                    │
│ - Backend API calls                              │
│                                                  │
├─────────────────────────────────────────────────┤
│ TypeScript ~5.9.2                                │
│ - Type safety                                    │
│ - Better IDE support                             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Backend (OAuth Server)

```
┌─────────────────────────────────────────────────┐
│ Node.js                                          │
│ - JavaScript runtime                             │
│                                                  │
├─────────────────────────────────────────────────┤
│ Express 4.18.2                                   │
│ - Web framework                                  │
│ - HTTP routing                                   │
│                                                  │
├─────────────────────────────────────────────────┤
│ Axios 1.6.2                                      │
│ - HTTP client                                    │
│ - PingOne API calls                              │
│                                                  │
├─────────────────────────────────────────────────┤
│ CORS 2.8.5                                       │
│ - Cross-Origin Resource Sharing                 │
│ - Mobile to backend communication                │
│                                                  │
├─────────────────────────────────────────────────┤
│ Body-Parser 1.20.2                               │
│ - HTTP body parsing                              │
│ - JSON support                                   │
│                                                  │
├─────────────────────────────────────────────────┤
│ JSONWebToken 9.0.0                               │
│ - JWT parsing & validation                       │
│ - Token extraction                               │
│                                                  │
├─────────────────────────────────────────────────┤
│ Dotenv 16.0.3                                    │
│ - Environment variable management                │
│ - Secure configuration                           │
│                                                  │
└─────────────────────────────────────────────────┘
```

### OAuth Provider

```
PingOne Authentication Platform
│
├─ OAuth 2.0 Server
│  - Authorization endpoint
│  - Token endpoint
│  - Revocation endpoint
│
├─ User Management API
│  - User data retrieval
│  - Profile information
│
└─ Identity Services
   - Multi-factor authentication
   - Password policies
   - Session management
```

## Security Layers

### Layer 1: OAuth 2.0 Protocol

```
- Authorization Code Flow (most secure)
- Client credentials never exposed in browser/app
- Authorization code is temporary and single-use
- Server-to-server token exchange
```

### Layer 2: HTTPS/TLS Encryption

```
- All API calls encrypted in transit
- Backend ↔ Mobile: Encrypted
- Backend ↔ PingOne: Encrypted
```

### Layer 3: Secure Token Storage

```
Mobile App:
├─ iOS: Keychain encryption
├─ Android: Android Keystore encryption
├─ Tokens never in unencrypted storage
└─ Cleared on logout

Backend:
├─ Never stores tokens (stateless)
├─ No persistent database credentials
├─ Environment variables only
```

### Layer 4: Token Management

```
Access Token:
├─ Short-lived (typically 1 hour)
├─ Used for API calls
├─ Automatically refreshed
└─ Verified by backend

Refresh Token:
├─ Longer-lived (days/weeks)
├─ Only used to get new access token
├─ Stored securely
└─ Revoked on logout
```

### Layer 5: Input Validation

```
Backend validates:
├─ Authorization code validity
├─ CORS origin check
├─ Response content-type
├─ Token signatures
└─ Expiration times
```

## Deployment Architecture

### Development

```
┌─────────────────────┐
│ Developer Machine   │
├─────────────────────┤
│ Backend             │
│ :3001 (localhost)   │
│                     │
│ Mobile App          │
│ Expo Dev Server     │
│ :19000 (localhost)  │
└─────────────────────┘
```

### Production

```
┌────────────────────────────────────────────┐
│         Internet                            │
├────────────────────────────────────────────┤
│                                             │
│  App Store / Play Store                    │
│  (Deployed Expo app)                       │
│                                             │
├────────────────────────────────────────────┤
│                                             │
│  Cloud Server                              │
│  (Heroku / AWS / Railway)                  │
│  - Backend OAuth Server                    │
│  - Handles token exchange                  │
│                                             │
├────────────────────────────────────────────┤
│                                             │
│  PingOne Cloud                             │
│  - Authentication service                  │
│  - User management                         │
│  - OAuth 2.0 provider                      │
│                                             │
└────────────────────────────────────────────┘
```

## State Management

### Auth Context State

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    picture: string;
    locale: string;
  } | null;

  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresAt: number;
    tokenType: string;
  } | null;

  isLoading: boolean;      // Loading indicator
  isSignedIn: boolean;     // Auth status
  error: string | null;    // Error messages
}
```

## Configuration Management

### Environment Variables

```
Development (.env):
├─ EXPO_PUBLIC_PINGONE_ENV_ID
├─ EXPO_PUBLIC_PINGONE_CLIENT_ID
├─ EXPO_PUBLIC_BACKEND_URL (http://localhost:3001)

Backend (.env):
├─ PINGONE_ENV_ID
├─ PINGONE_CLIENT_ID
├─ PINGONE_CLIENT_SECRET
├─ PORT (3001)
└─ NODE_ENV (development)

Production (.env):
├─ PINGONE_ENV_ID (same)
├─ PINGONE_CLIENT_ID (same)
├─ PINGONE_CLIENT_SECRET (same)
├─ EXPO_PUBLIC_BACKEND_URL (https://yourdomain.com)
└─ NODE_ENV (production)
```

## Error Handling Flow

```
User Action
    │
    ▼
Try to execute operation
    │
    ├─ Success: Return data
    │
    └─ Error:
        │
        ├─ Network Error
        │  └─ Show "Connection failed" message
        │
        ├─ Auth Error (401)
        │  ├─ Try refresh token
        │  │
        │  ├─ Success: Retry original request
        │  │
        │  └─ Fail: Logout user
        │
        ├─ Server Error (5xx)
        │  └─ Show "Server error" message
        │
        └─ Other Error
           └─ Show specific error message
```

## Performance Considerations

### Token Caching

- Access tokens cached in memory during app session
- Tokens stored encrypted on device
- Only valid tokens used for API calls

### Token Refresh

- Automatic refresh before expiration
- Prevents "token expired" errors
- Transparent to user

### Network Optimization

- Single backend request for token exchange
- User info retrieved in one call
- Minimal API calls in dashboard

## Scalability

### Current Setup

- Single backend server
- Can handle 100s of concurrent users in development
- Suitable for small to medium applications

### Production Scaling (When Needed)

```
Load Balancer (AWS/Heroku)
    │
    ├─ Backend Instance 1 (Stateless)
    ├─ Backend Instance 2 (Stateless)
    └─ Backend Instance N (Stateless)
         │
         └─ PingOne (Managed service)
```

## Future Enhancements

Possible additions:

1. **Social Login** - Add Google, GitHub login
2. **MFA** - Multi-factor authentication
3. **Deep Linking** - Direct app links
4. **Biometric Auth** - Face ID / Touch ID
5. **User Preferences** - Settings screen
6. **API Calls** - Backend routes to access other services
7. **Analytics** - Track user behavior
8. **Push Notifications** - Send notifications to users
