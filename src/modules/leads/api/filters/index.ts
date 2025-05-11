
import { getUserFilters, getDefaultFilter } from './get-filters';
import { createUserFilter } from './create-filter';
import { updateUserFilter } from './update-filter';
import { deleteUserFilter } from './delete-filter';

/**
 * Export all user filters API functions
 */
export const userFiltersApi = {
  getUserFilters,
  getDefaultFilter,
  createUserFilter,
  updateUserFilter,
  deleteUserFilter,
};
