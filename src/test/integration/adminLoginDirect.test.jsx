import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLoginModal from '../../components/AdminLoginModal';
import * as AppContextModule from '../../context/AppContext';

describe('Integration Tests: Admin Login with Master Key (admin123)', () => {
  let mockSwitchRole;
  let mockShowToast;

  beforeEach(() => {
    mockSwitchRole = vi.fn();
    mockShowToast = vi.fn();

    const mockContext = {
      switchRole: mockSwitchRole,
      showToast: mockShowToast,
      adminPassword: 'admin123',
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);
  });

  it('rejects authentication when wrong master key is entered', () => {
    render(<AdminLoginModal isOpen={true} onClose={vi.fn()} />);

    const passwordInput = screen.getByPlaceholderText(/Enter admin passcode/i);
    fireEvent.change(passwordInput, { target: { value: 'wrongPass' } });

    const submitBtn = screen.getByRole('button', { name: /Authenticate Admin/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Unauthorized: Invalid administrator master key/i)).toBeInTheDocument();
    expect(mockSwitchRole).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('Access denied: Incorrect administrative key.', 'error');
  });

  it('directly authenticates and unlocks admin with admin123', () => {
    const mockSuccess = vi.fn();
    const mockClose = vi.fn();

    render(<AdminLoginModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />);

    const passwordInput = screen.getByPlaceholderText(/Enter admin passcode/i);
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    const submitBtn = screen.getByRole('button', { name: /Authenticate Admin/i });
    fireEvent.click(submitBtn);

    expect(mockSwitchRole).toHaveBeenCalledWith('admin');
    expect(mockSuccess).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('🛡️ Administrator verified. Control center unlocked.');
  });
});
