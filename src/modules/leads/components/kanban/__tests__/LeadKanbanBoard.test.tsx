
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeadKanbanBoard } from '../LeadKanbanBoard';
import { KanbanColumn } from '../../../hooks/useKanbanBoard';
import { Lead } from '@/types/leads';

// Import vitest directly
import { describe, it, expect, vi } from 'vitest';

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-drop-context">{children}</div>,
  Droppable: ({ children }: { children: (provided: any) => React.ReactNode }) => 
    <div data-testid="droppable">
      {children({
        innerRef: () => {},
        droppableProps: {},
        placeholder: null,
      })}
    </div>,
  Draggable: ({ children }: { children: (provided: any) => React.ReactNode }) => 
    <div data-testid="draggable">
      {children({
        innerRef: () => {},
        draggableProps: {},
        dragHandleProps: {},
      })}
    </div>
}));

describe('LeadKanbanBoard', () => {
  const mockLead: Lead = {
    id: '123',
    title: 'Test Lead',
    description: 'This is a test lead',
    category: 'Insurance',
    status: '📥 new',
    created_at: new Date().toISOString(),
    submitted_by: 'user-123',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '123-456-7890',
    service_type: 'Insurance Quote',
  };

  const mockColumns: KanbanColumn[] = [
    { id: '📥 new', title: 'Nye', leads: [mockLead] },
    { id: '🚀 in_progress', title: 'I gang', leads: [] },
    { id: '🏆 won', title: 'Vunnet', leads: [] },
    { id: '❌ lost', title: 'Tapt', leads: [] },
  ];

  const mockHandleStatusChange = vi.fn();

  it('renders the correct number of columns', () => {
    render(
      <LeadKanbanBoard 
        columns={mockColumns} 
        onLeadStatusChange={mockHandleStatusChange}
      />
    );

    // Should render 4 columns
    expect(screen.getAllByText(/Nye|Pågående|Vunnet|Tapt/).length).toBe(4);
  });

  it('displays leads in the correct column', () => {
    render(
      <LeadKanbanBoard 
        columns={mockColumns} 
        onLeadStatusChange={mockHandleStatusChange}
      />
    );

    // The test lead should appear under the "New" column
    const newColumn = screen.getByText('Nye').closest('div');
    expect(newColumn).toBeInTheDocument();
    expect(screen.getByText('Test Lead')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <LeadKanbanBoard 
        columns={mockColumns} 
        onLeadStatusChange={mockHandleStatusChange}
        isLoading={true}
      />
    );

    expect(screen.getByText('Laster inn leads...')).toBeInTheDocument();
  });
});
