import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { PINGONE_CONFIG } from "../config/pingone-config";
import { logger } from "../utils/logger";

// Ensure the web browser is available
WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const { clearError } = auth;

  const redirectUri = PINGONE_CONFIG.redirectUrl;

  const handleAuthResponse = async (
    authCode: string,
    codeVerifier?: string | null,
  ) => {
    try {
      logger.info("LoginScreen", "Exchanging auth code for tokens", {
        redirectUri,
        hasCodeVerifier: Boolean(codeVerifier),
      });

      // Exchange code for tokens via backend
      const tokenResponse = await axios.post(
        `${PINGONE_CONFIG.backendUrl}/exchange-code`,
        {
          code: authCode,
          redirectUrl: redirectUri,
          codeVerifier: codeVerifier ?? undefined,
        },
      );

      const { accessToken, refreshToken, idToken, expiresIn, user } =
        tokenResponse.data;

      // Store tokens and user info
      const tokens = {
        accessToken,
        refreshToken,
        idToken,
        expiresAt: Date.now() + expiresIn * 1000,
        tokenType: "Bearer",
      };

      if (auth.setUserAfterLogin) {
        await auth.setUserAfterLogin(user, tokens);
        logger.info("LoginScreen", "User successfully logged in", {
          userId: user?.id,
          hasRefreshToken: Boolean(tokens.refreshToken),
        });
      }
    } catch (error) {
      logger.error("LoginScreen", "Failed to handle auth response", {
        error:
          axios.isAxiosError(error) && error.response
            ? error.response.data
            : String(error),
      });
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : String(error);
      auth.clearError();
    }
  };

  const handleLoginPress = async () => {
    try {
      setIsLoading(true);
      clearError();

      const request = new AuthSession.AuthRequest({
        clientId: PINGONE_CONFIG.clientId,
        scopes: PINGONE_CONFIG.scopes,
        redirectUri,
        extraParams: {
          prompt: "login",
        },
      });

      const discovery: AuthSession.DiscoveryDocument = {
        authorizationEndpoint: PINGONE_CONFIG.authorizationEndpoint,
        tokenEndpoint: PINGONE_CONFIG.tokenEndpoint,
      };

      logger.info("LoginScreen", "Starting AuthSession with AuthRequest", {
        hasCodeVerifier: Boolean(request.codeVerifier),
      });

      const result = await request.promptAsync(discovery);

      logger.info("LoginScreen", "AuthSession result", {
        type: result.type,
      });

      if (result.type === "success") {
        const params = (result as any).params as
          | Record<string, string>
          | undefined;
        const authCode = params?.code;

        if (!authCode) {
          logger.warn("LoginScreen", "Auth session success without auth code");
          return;
        }

        await handleAuthResponse(authCode, request.codeVerifier);
        return;
      }

      if (result.type === "error") {
        const errorCode = (result as any).errorCode ?? "Unknown auth error";
        logger.error("LoginScreen", "AuthSession error", {
          errorCode,
        });
      }
    } catch (error) {
      logger.error("LoginScreen", "AuthSession start failed", {
        error: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Festo Mobile</Text>
        <Text style={styles.subtitle}>Secure Login with PingOne</Text>

        {auth.state.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{auth.state.error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.loginButton,
            isLoading && styles.loginButtonDisabled,
          ]}
          onPress={handleLoginPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login with PingOne</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This app uses PingOne for secure authentication. Your credentials
            are protected by industry-standard security measures.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderColor: "#f88",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
