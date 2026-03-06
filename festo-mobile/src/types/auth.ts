/**
 * User and Auth Type Definitions
 */

export interface User {
  id: string;
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
}

export interface AuthContext {
  state: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUserAfterLogin?: (user: User, tokens: AuthTokens) => Promise<void>;
}
