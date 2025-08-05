import { createReducer, on } from '@ngrx/store';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  applicationId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  totalSubscriptions: number;
  currentPage: number;
  totalPages: number;
}

export const initialState: SubscriptionState = {
  subscriptions: [],
  selectedSubscription: null,
  isLoading: false,
  error: null,
  totalSubscriptions: 0,
  currentPage: 1,
  totalPages: 0,
};

// Basic reducer structure - actions will be added later
export const subscriptionReducer = createReducer(initialState);
