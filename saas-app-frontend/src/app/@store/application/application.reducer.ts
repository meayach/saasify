import { createReducer, on } from '@ngrx/store';
import { SaasApplication } from '../../@core/models/application.model';

export interface ApplicationState {
  applications: SaasApplication[];
  selectedApplication: SaasApplication | null;
  isLoading: boolean;
  error: string | null;
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}

export const initialState: ApplicationState = {
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
  totalApplications: 0,
  currentPage: 1,
  totalPages: 0,
};

// Basic reducer structure - actions will be added later
export const applicationReducer = createReducer(initialState);
