import { createReducer, on } from '@ngrx/store';
import { User } from '../../@core/models/user.model';

export interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}

export const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 0,
};

// Basic reducer structure - actions will be added later
export const userReducer = createReducer(initialState);
