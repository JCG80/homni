/**
 * Common hook-related types used across modules
 */

import { UserLeadFilter } from '@/modules/leads/types/user-filters';

/**
 * Common props for filter management hooks
 */
export interface UseFilterHookProps {
  filters: UserLeadFilter[];
  setFilters: (filters: UserLeadFilter[] | ((prev: UserLeadFilter[]) => UserLeadFilter[])) => void;
  activeFilter: UserLeadFilter | null;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError?: (error: string | null) => void;
}

/**
 * Props for filter fetch hook
 */
export interface UseFilterFetchProps {
  setFilters: (filters: UserLeadFilter[]) => void;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Props for kanban board hook
 */
export interface UseKanbanBoardProps {
  companyId?: string;
  userId?: string;
}

/**
 * Props for login form hook
 */
export interface UseLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

/**
 * Props for role checking hook
 */
export interface UseRoleCheckProps {
  role?: string | null;
}