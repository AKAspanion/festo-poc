import React, {
  createContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  AuthState,
  AuthContext as AuthContextType,
  User,
  AuthTokens,
} from "../types/auth";
import { PINGONE_CONFIG } from "../config/pingone-config";
import axios from "axios";
import { logger } from "../utils/logger";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: { user: User; tokens: AuthTokens } }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" }
  | { type: "RESTORE_TOKEN"; payload: { user: User; tokens: AuthTokens } };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isSignedIn: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isSignedIn: true,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "RESTORE_TOKEN":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isSignedIn: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app startup
  React.useEffect(() => {
    logger.info("AuthContext", "Bootstrap auth state start");

    const bootstrapAsync = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Try to restore token from secure storage
        const storedTokens = await SecureStore.getItemAsync("auth_tokens");
        const storedUser = await SecureStore.getItemAsync("auth_user");

        if (storedTokens && storedUser) {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          const user: User = JSON.parse(storedUser);

          // Verify token is still valid
          if (tokens.expiresAt && tokens.expiresAt > Date.now()) {
            dispatch({
              type: "RESTORE_TOKEN",
              payload: { user, tokens },
            });
            logger.info("AuthContext", "Restored valid session from storage", {
              userId: user.id,
            });
            return;
          }

          // If token expired, try to refresh
          if (tokens.refreshToken) {
            logger.info("AuthContext", "Stored session expired, refreshing");
            await refreshToken();
            return;
          }
        }

        dispatch({ type: "SET_LOADING", payload: false });
      } catch (error) {
        logger.error("AuthContext", "Failed to restore token", {
          error: String(error),
        });
        dispatch({ type: "SET_ERROR", payload: "Failed to restore session" });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    bootstrapAsync();
  }, []);

  const login = useCallback(async () => {
    // This will be handled by AuthSession in the Login screen
    // We just need the placeholder here
  }, []);

  const logout = useCallback(async () => {
    try {
      logger.info("AuthContext", "Logout requested");
      dispatch({ type: "SET_LOADING", payload: true });

      // Call backend to revoke refresh token if available
      if (state.tokens?.refreshToken) {
        try {
          await axios.post(`${PINGONE_CONFIG.backendUrl}/revoke`, {
            token: state.tokens.refreshToken,
            token_type_hint: "refresh_token",
          });
        } catch (error) {
          logger.warn("AuthContext", "Failed to revoke token on backend", {
            error: String(error),
          });
        }
      }

      // Clear tokens from secure storage
      await SecureStore.deleteItemAsync("auth_tokens");
      await SecureStore.deleteItemAsync("auth_user");

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to logout",
      });
    } finally {
      logger.info("AuthContext", "Logout flow completed");
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.tokens]);

  const refreshToken = useCallback(async () => {
    try {
      if (!state.tokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

       logger.info("AuthContext", "Refreshing access token");

      const response = await axios.post(
        `${PINGONE_CONFIG.backendUrl}/refresh-token`,
        {
          refreshToken: state.tokens.refreshToken,
        },
      );

      const { accessToken, expiresIn } = response.data;
      const newTokens: AuthTokens = {
        ...state.tokens,
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      };

      // Save updated tokens
      await SecureStore.setItemAsync("auth_tokens", JSON.stringify(newTokens));

      dispatch({
        type: "SET_USER",
        payload: {
          user: state.user!,
          tokens: newTokens,
        },
      });
      logger.info("AuthContext", "Access token refreshed", {
        userId: state.user?.id,
      });
    } catch (error) {
      logger.error("AuthContext", "Failed to refresh token", {
        error: String(error),
      });
      // On refresh failure, logout the user
      dispatch({ type: "LOGOUT" });
    }
  }, [state.tokens, state.user]);

  // Expose method to set user after successful login
  const setUserAfterLogin = useCallback(
    async (user: User, tokens: AuthTokens) => {
      try {
        await SecureStore.setItemAsync("auth_tokens", JSON.stringify(tokens));
        await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
        dispatch({
          type: "SET_USER",
          payload: { user, tokens },
        });
        logger.info("AuthContext", "Stored user after login", {
          userId: user.id,
        });
      } catch (error) {
        logger.error("AuthContext", "Failed to save user after login", {
          error: String(error),
        });
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to save user data",
        });
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const authContext: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    clearError,
    setUserAfterLogin,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
