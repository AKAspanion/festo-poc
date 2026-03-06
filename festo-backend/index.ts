import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios, { AxiosError } from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logDebug, logError, logInfo, logWarn, requestSummary } from "./logger";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Type definitions
interface PingOneConfig {
  environmentId: string;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  apiUrl: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type?: string;
}

interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
  emailVerified?: boolean;
  emails?: Array<{
    value: string;
    primary?: boolean;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  addresses?: Array<{
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
  [key: string]: any;
}

interface DecodedToken {
  sub?: string;
  user_id?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  email_verified?: boolean;
  [key: string]: any;
}

// Configuration from environment variables
const PINGONE_CONFIG: PingOneConfig = {
  environmentId: process.env.PINGONE_ENV_ID || "YOUR_ENVIRONMENT_ID",
  clientId: process.env.PINGONE_CLIENT_ID || "YOUR_CLIENT_ID",
  clientSecret: process.env.PINGONE_CLIENT_SECRET || "YOUR_CLIENT_SECRET",
  baseUrl: `${process.env.PINGONE_AUTH_URL || "https://auth.pingone.com"}/${
    process.env.PINGONE_ENV_ID
  }/as`,
  apiUrl: `${process.env.PINGONE_API_URL || "https://api.pingone.com"}/v1/environments/${
    process.env.PINGONE_ENV_ID
  }`,
};

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:19000",
      "http://localhost:19001",
      "http://localhost:3000",
      "http://127.0.0.1:19000",
      /^exp:\/\/.*/,
    ],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  logDebug(`Incoming request ${method} ${originalUrl}`, {
    origin: req.headers.origin,
  });

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    requestSummary({
      method,
      path: originalUrl,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "OK", message: "OAuth backend server is running" });
});

/**
 * HTTPS redirect target for PingOne.
 *
 * PingOne requires an HTTPS redirect URI. This endpoint is registered in
 * PingOne. We return 200 with an HTML page so the in-app browser "lands" on
 * this URL (with code/state in the query). That lets expo-auth-session detect
 * the redirect and return success. The HTML then redirects to the app deep link
 * so the browser closes.
 *
 * Redirect chain:
 *   PingOne → GET /pingone/callback?code=...&state=...
 *           → 200 HTML (browser stays on this URL briefly; AuthSession can capture it)
 *           → client-side redirect → festo-mobile://callback?...
 */
app.get("/pingone/callback", (req: Request, res: Response): void => {
  const queryParams = req.query as Record<string, string | string[] | undefined>;

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) {
          searchParams.append(key, v);
        }
      });
    } else if (value != null) {
      searchParams.append(key, value);
    }
  });

  const mobileRedirectBase = "festo-mobile://callback";
  const redirectTarget = searchParams.toString()
    ? `${mobileRedirectBase}?${searchParams.toString()}`
    : mobileRedirectBase;

  logInfo("PingOne callback: serving HTML so browser lands on redirect URI", {
    target: redirectTarget,
  });

  const escapedRedirect = redirectTarget
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  res.status(200).set("Content-Type", "text/html; charset=utf-8").send(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="1;url=${escapedRedirect}">
  <title>Redirecting to app</title>
</head>
<body>
  <p>Sign-in successful. Redirecting to app...</p>
  <script>window.location.href = ${JSON.stringify(redirectTarget)};</script>
</body>
</html>`,
  );
});

/**
 * POST /exchange-code
 * Exchange authorization code for tokens
 */
app.post(
  "/exchange-code",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, redirectUrl, codeVerifier } = req.body as {
        code?: string;
        redirectUrl?: string;
        codeVerifier?: string;
      };

      if (!code) {
        logWarn("Exchange-code called without auth code");
        res.status(400).json({ error: "Missing authorization code" });
        return;
      }

      logInfo("Exchanging authorization code for tokens", {
        hasRedirectUrl: Boolean(redirectUrl),
      });

      // Exchange code for tokens
      const tokenPayload: Record<string, string> = {
        grant_type: "authorization_code",
        code,
        client_id: PINGONE_CONFIG.clientId,
        client_secret: PINGONE_CONFIG.clientSecret,
        redirect_uri: redirectUrl ?? "",
      };

      if (codeVerifier) {
        tokenPayload.code_verifier = codeVerifier;
      }

      logDebug("Token request payload (sanitized)", {
        hasCodeVerifier: Boolean(tokenPayload.code_verifier),
      });

      const formBody = new URLSearchParams(tokenPayload);

      const tokenResponse = await axios.post<TokenResponse>(
        `${PINGONE_CONFIG.baseUrl}/token`,
        formBody.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token, refresh_token, id_token, expires_in } =
        tokenResponse.data;

      // Decode ID token to get user info
      let userInfo: UserInfo = { id: "unknown" };
      if (id_token) {
        try {
          const decoded = jwt.decode(id_token) as DecodedToken | null;
          if (decoded) {
            userInfo = {
              id: decoded.sub || decoded.user_id || "unknown",
              email: decoded.email,
              name: decoded.name,
              givenName: decoded.given_name,
              familyName: decoded.family_name,
              picture: decoded.picture,
              locale: decoded.locale,
              emailVerified: decoded.email_verified,
            };
          }
        } catch (decodeError) {
          logWarn("Failed to decode ID token", {
            error: (decodeError as Error).message,
          });
        }
      }

      // Fetch additional user details from PingOne OIDC userinfo endpoint if we have an access token
      if (access_token) {
        try {
          const userInfoResponse = await axios.get<UserInfo>(
            `${PINGONE_CONFIG.baseUrl}/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (userInfoResponse.data) {
            userInfo = { ...userInfo, ...userInfoResponse.data };
          }
        } catch (userError) {
          logWarn("Failed to fetch userinfo from OIDC endpoint", {
            error: (userError as Error).message,
            userId: userInfo.id,
          });
        }
      }

      // Normalize common PingOne shapes into flat fields expected by the mobile app
      if (!userInfo.email && Array.isArray(userInfo.emails)) {
        const primaryEmail =
          userInfo.emails.find((e) => e.primary)?.value ||
          userInfo.emails[0]?.value;
        if (primaryEmail) {
          userInfo.email = primaryEmail;
        }
      }

      if (!userInfo.name && (userInfo.givenName || userInfo.familyName)) {
        userInfo.name = [userInfo.givenName, userInfo.familyName]
          .filter(Boolean)
          .join(" ");
      }

      res.json({
        accessToken: access_token,
        refreshToken: refresh_token,
        idToken: id_token,
        expiresIn: expires_in,
        user: userInfo,
        message: "Successfully exchanged code for tokens",
      });
      logInfo("Successfully exchanged code for tokens", {
        hasRefreshToken: Boolean(refresh_token),
        hasIdToken: Boolean(id_token),
        userId: userInfo.id,
      });
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      logError("Error exchanging code", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      const message =
        axiosError.response?.data?.error_description ||
        axiosError.message ||
        "Failed to exchange code";
      res.status(axiosError.response?.status || 500).json({
        error: message,
        details: axiosError.response?.data,
      });
    }
  },
);

/**
 * POST /refresh-token
 * Refresh access token using refresh token
 */
app.post(
  "/refresh-token",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };

      if (!refreshToken) {
        logWarn("Refresh-token called without refresh token");
        res.status(400).json({ error: "Missing refresh token" });
        return;
      }

      const refreshPayload: Record<string, string> = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: PINGONE_CONFIG.clientId,
        client_secret: PINGONE_CONFIG.clientSecret,
      };

      const refreshBody = new URLSearchParams(refreshPayload);

      const tokenResponse = await axios.post<TokenResponse>(
        `${PINGONE_CONFIG.baseUrl}/token`,
        refreshBody.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      res.json({
        accessToken: access_token,
        refreshToken: refresh_token || refreshToken,
        expiresIn: expires_in,
        message: "Successfully refreshed token",
      });
      logInfo("Successfully refreshed token", {
        hasNewRefreshToken: Boolean(refresh_token),
      });
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      logError("Error refreshing token", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      const message =
        axiosError.response?.data?.error_description ||
        axiosError.message ||
        "Failed to refresh token";
      res.status(axiosError.response?.status || 401).json({
        error: message,
        details: axiosError.response?.data,
      });
    }
  },
);

/**
 * POST /revoke
 * Revoke an access token
 */
app.post("/revoke", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, token_type_hint } = req.body as {
      token?: string;
      token_type_hint?: string;
    };

    if (!token) {
      logWarn("Revoke called without token");
      res.status(400).json({ error: "Missing token" });
      return;
    }

    const revokePayload: Record<string, string> = {
      token,
      client_id: PINGONE_CONFIG.clientId,
      client_secret: PINGONE_CONFIG.clientSecret,
    };

    if (token_type_hint) {
      revokePayload.token_type_hint = token_type_hint;
    }

    const revokeBody = new URLSearchParams(revokePayload);

    try {
      await axios.post(
        `${PINGONE_CONFIG.baseUrl}/revoke`,
        revokeBody.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      logInfo("Token revoked successfully", { token_type_hint });
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      logWarn("PingOne revoke returned non-success", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      // Even if PingOne rejects (e.g. token already revoked/expired),
      // treat this as best-effort and continue logout.
    }

    res.json({ message: "Logout completed (revoke best-effort)" });
  } catch (error) {
    logError("Error revoking token", {
      error: (error as Error).message,
    });
    res.status(500).json({
      error: "Failed to revoke token",
    });
  }
});

/**
 * GET /user-info
 * Get user information using access token
 */
app.get("/user-info", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }

    const accessToken = authHeader.substring(7);

    // Verify and decode token
    let userId: string | null = null;
    try {
      const decoded = jwt.decode(accessToken) as DecodedToken | null;
      userId = decoded?.sub || (decoded?.user_id as string) || null;
    } catch (error) {
      logWarn("Failed to decode access token in /user-info", {
        error: (error as Error).message,
      });
    }

    if (!userId) {
      logWarn("User-info called with invalid token");
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Fetch user details from PingOne API
    const userResponse = await axios.get<UserInfo>(
      `${PINGONE_CONFIG.apiUrl}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    logInfo("Fetched user info from PingOne", { userId });
    res.json(userResponse.data);
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    logError("Error fetching user info", {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
    });
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Failed to fetch user info";
    res.status(axiosError.response?.status || 500).json({
      error: message,
    });
  }
});

// Error handling middleware
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logError("Unhandled error", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  },
);

// Start server
app.listen(PORT, (): void => {
  logInfo(
    `🚀 OAuth Backend Server running on http://localhost:${PORT}`,
    undefined,
  );
  logInfo("📋 Configuration", {
    environmentId: PINGONE_CONFIG.environmentId,
    clientId: PINGONE_CONFIG.clientId,
  });
  logInfo("✅ Server is ready to handle OAuth callbacks");
  logInfo("Available endpoints", {
    endpoints: [
      "POST   /exchange-code    - Exchange auth code for tokens",
      "POST   /refresh-token    - Refresh access token",
      "POST   /revoke           - Revoke access token",
      "GET    /user-info        - Get authenticated user info",
      "GET    /health           - Health check",
    ],
  });
});

export default app;
