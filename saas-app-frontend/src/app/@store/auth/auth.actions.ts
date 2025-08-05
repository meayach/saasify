import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../../@core/models/user.model';

// Login Actions
export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: AuthUser }>());

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Token Actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string; refreshToken?: string }>(),
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>(),
);

// User Profile Actions
export const loadUserProfile = createAction('[Auth] Load User Profile');

export const loadUserProfileSuccess = createAction(
  '[Auth] Load User Profile Success',
  props<{ user: AuthUser }>(),
);

export const loadUserProfileFailure = createAction(
  '[Auth] Load User Profile Failure',
  props<{ error: string }>(),
);

// Keycloak Actions
export const initKeycloak = createAction('[Auth] Init Keycloak');

export const keycloakReady = createAction(
  '[Auth] Keycloak Ready',
  props<{ authenticated: boolean }>(),
);

export const keycloakError = createAction('[Auth] Keycloak Error', props<{ error: string }>());
