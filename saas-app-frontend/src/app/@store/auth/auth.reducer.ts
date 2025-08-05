import { createReducer, on } from '@ngrx/store';
import { AuthUser } from '../../@core/models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token: user.token,
    refreshToken: user.refreshToken || null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, () => initialState),

  // Token refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.refreshTokenSuccess, (state, { token, refreshToken }) => ({
    ...state,
    token,
    refreshToken: refreshToken || state.refreshToken,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  // User profile
  on(AuthActions.loadUserProfile, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.loadUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  // Keycloak
  on(AuthActions.keycloakReady, (state, { authenticated }) => ({
    ...state,
    isAuthenticated: authenticated,
    isLoading: false,
  })),

  on(AuthActions.keycloakError, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),
);
