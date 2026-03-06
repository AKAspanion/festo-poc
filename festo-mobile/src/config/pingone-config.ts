/**
 * PingOne OAuth Configuration
 *
 * IMPORTANT: Update these values with your actual PingOne credentials:
 * - Environment ID: Your PingOne environment ID
 * - Client ID: Your OAuth application client ID
 * - Client Secret: Your OAuth application client secret (keep secure!)
 * - Redirect URI: Must match what's configured in PingOne
 */
import * as AuthSession from "expo-auth-session";

export const PINGONE_CONFIG = {
  // PingOne environment ID
  environmentId:
    process.env.EXPO_PUBLIC_PINGONE_ENV_ID || "YOUR_ENVIRONMENT_ID",

  // OAuth Client ID from PingOne
  clientId: process.env.EXPO_PUBLIC_PINGONE_CLIENT_ID || "YOUR_CLIENT_ID",

  // OAuth Client Secret (for backend use only - never expose to frontend in production)
  clientSecret:
    process.env.EXPO_PUBLIC_PINGONE_CLIENT_SECRET || "YOUR_CLIENT_SECRET",

  // Authorization endpoint (PingOne uses /as/authorize)
  authorizationEndpoint: `${
    process.env.EXPO_PUBLIC_PINGONE_AUTH_URL || "https://auth.pingone.com"
  }/${
    process.env.EXPO_PUBLIC_PINGONE_ENV_ID || "YOUR_ENVIRONMENT_ID"
  }/as/authorize`,

  // Token endpoint
  tokenEndpoint: `${
    process.env.EXPO_PUBLIC_PINGONE_AUTH_URL || "https://auth.pingone.com"
  }/${process.env.EXPO_PUBLIC_PINGONE_ENV_ID || "YOUR_ENVIRONMENT_ID"}/as/token`,

  // User info endpoint
  userInfoEndpoint: `${
    process.env.EXPO_PUBLIC_PINGONE_API_URL || "https://api.pingone.com"
  }/v1/environments/${
    process.env.EXPO_PUBLIC_PINGONE_ENV_ID || "YOUR_ENVIRONMENT_ID"
  }/users`,

  // Redirect URI (must match PingOne configuration exactly).
  // Use a concrete path to satisfy PingOne's validation.
  redirectUrl: AuthSession.makeRedirectUri({
    scheme: "festo-mobile",
    path: "callback",
  }),

  // Scopes requested from PingOne
  scopes: ["openid", "profile", "email"],

  // Backend server URL (for token exchange)
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3001",
};

// Update these with your actual PingOne credentials
export const updatePingOneConfig = (config: Partial<typeof PINGONE_CONFIG>) => {
  Object.assign(PINGONE_CONFIG, config);
};
