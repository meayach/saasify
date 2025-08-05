import { ActionReducerMap } from '@ngrx/store';
import { userReducer, UserState } from './user/user.reducer';
import { applicationReducer, ApplicationState } from './application/application.reducer';
import { subscriptionReducer, SubscriptionState } from './subscription/subscription.reducer';
import { authReducer, AuthState } from './auth/auth.reducer';

export interface AppState {
  auth: AuthState;
  user: UserState;
  application: ApplicationState;
  subscription: SubscriptionState;
}

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  user: userReducer,
  application: applicationReducer,
  subscription: subscriptionReducer,
};
