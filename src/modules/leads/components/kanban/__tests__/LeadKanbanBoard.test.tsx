
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadKanbanBoard } from '../LeadKanbanBoard';
import { createTestLead } from '../../../tests/utils';

describe('LeadKanbanBoard', () => {
  const mockProps = {
    columns: [
      {
        id: 'new',
        title: 'Nye ✨',
        status: 'new' as const,
        count: 1,
        leads: [
          {
            id: 'test-1',
            title: 'Test Lead 1',
            description: 'Test description',
            category: 'testing',
            status: 'new' as const,
            created_at: new Date().toISOString()
          }
        ]
      }
    ],
    onLeadStatusChange: vi.fn(),
    isLoading: false,
    isUpdating: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render kanban board with columns', () => {
    render(<LeadKanbanBoard {...mockProps} />);
    expect(screen.getByText('Nye ✨')).toBeInTheDocument();
    expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<LeadKanbanBoard {...mockProps} isLoading={true} />);
    expect(screen.getByText('Loading leads...')).toBeInTheDocument();
  });
});
