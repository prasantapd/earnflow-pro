import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthView from '../../views/AuthView';
import * as AppContextModule from '../../context/AppContext';

describe('Integration Tests: Referral Link Pre-fill and Downline Registration', () => {
  let mockRegisterUser;
  let mockShowToast;

  const mockUsers = [
    {
      id: 'USR-8725',
      name: 'Prasanta Das',
      phone: '9811223344',
      referralCode: 'PRAS858',
      status: 'ACTIVE',
    },
  ];

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    mockRegisterUser = vi.fn().mockReturnValue(true);
    mockShowToast = vi.fn();

    const mockContext = {
      registerUser: mockRegisterUser,
      loginUser: vi.fn(),
      requestPasswordReset: vi.fn(),
      showToast: mockShowToast,
      allUsers: mockUsers,
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);
  });

  it('automatically detects ?ref=PRAS858 from URL, pre-fills referralCode, and displays sponsor invitation banner', () => {
    // Simulate navigation to referral link
    delete window.location;
    window.location = new URL('https://earnflow-pro-3d5o.onrender.com/?ref=PRAS858');

    render(<AuthView onOpenAdminLogin={vi.fn()} />);

    // Check that referral banner is displayed with sponsor name
    expect(screen.getByText(/Referral Invitation Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Prasanta Das \(PRAS858\)/i)).toBeInTheDocument();

    // Check that the referral input field is pre-filled with PRAS858
    const refInput = screen.getByPlaceholderText(/e\.g\. TC100/i);
    expect(refInput.value).toBe('PRAS858');
    expect(screen.getByText(/Pre-filled from Referral Link/i)).toBeInTheDocument();
  });

  it('submits registration with prefilled referral code linked to sponsor', () => {
    delete window.location;
    window.location = new URL('https://earnflow-pro-3d5o.onrender.com/?ref=PRAS858&leg=left');

    render(<AuthView onOpenAdminLogin={vi.fn()} />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'New Downline Member' } });
    fireEvent.change(screen.getByPlaceholderText(/9876543210/i), { target: { value: '9876500000' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 6 chars/i), { target: { value: 'pass123456' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat/i), { target: { value: 'pass123456' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create Account & Start Earning/i });
    fireEvent.click(submitBtn);

    expect(mockRegisterUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Downline Member',
        phone: '9876500000',
        referralCode: 'PRAS858',
        referredBy: 'PRAS858',
        leg: 'LEFT',
      })
    );
  });
});
