
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadKanbanBoard } from '../LeadKanbanBoard';
import { createTestLead } from '../../../tests/utils';

// Mock the hooks
vi.mock('../../../hooks/useKanbanBoard', () => ({
  useKanbanBoard: () => ({
    columns: [
      {
        id: 'new',
        title: 'Nye ✨',
        leads: [createTestLead({ id: 'test-1', status: 'new', title: 'Test Lead 1' })]
      }
    ],
    isLoading: false,
    updateLeadStatus: vi.fn(),
    refreshLeads: vi.fn()
  })
}));

describe('LeadKanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render kanban board with columns', () => {
    render(<LeadKanbanBoard />);
    expect(screen.getByText('Nye ✨')).toBeInTheDocument();
    expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
  });
});
