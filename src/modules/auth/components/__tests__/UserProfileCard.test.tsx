import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UserProfileCard } from '../UserProfileCard';
import { createMockAuthContext } from '@/test/factories/userFactory';

// Mock the auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderUserProfileCard = (authContext = createMockAuthContext()) => {
  const { useAuth } = require('../../hooks/useAuth');
  useAuth.mockReturnValue(authContext);

  return render(
    <BrowserRouter>
      <UserProfileCard />
    </BrowserRouter>
  );
};

describe('UserProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when no user or profile', () => {
    renderUserProfileCard(createMockAuthContext({
      user: null,
      profile: null
    }));

    expect(screen.getByText('Laster profilinformasjon...')).toBeInTheDocument();
  });

  it('displays user profile information', () => {
    renderUserProfileCard(createMockAuthContext({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: {
        id: 'test-profile',
        full_name: 'Test User',
        role: 'user',
        email: 'test@example.com',
        phone: '+47 12345678'
      }
    }));

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+47 12345678')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('shows fallback name when full_name is missing', () => {
    renderUserProfileCard(createMockAuthContext({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: {
        id: 'test-profile',
        full_name: '',
        role: 'user',
        email: 'test@example.com'
      }
    }));

    expect(screen.getByText('Ingen navn satt')).toBeInTheDocument();
  });

  it('generates correct initials for avatar', () => {
    renderUserProfileCard(createMockAuthContext({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: {
        id: 'test-profile',
        full_name: 'Ola Nordmann',
        role: 'user',
        email: 'test@example.com'
      }
    }));

    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('navigates to profile page when edit button is clicked', () => {
    renderUserProfileCard();

    const editButton = screen.getByText('Rediger profil');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('displays address when available in metadata', () => {
    renderUserProfileCard(createMockAuthContext({
      profile: {
        ...createMockAuthContext().profile!,
        metadata: {
          address: 'Storgata 1, 0123 Oslo'
        }
      }
    }));

    expect(screen.getByText('Storgata 1, 0123 Oslo')).toBeInTheDocument();
  });
});