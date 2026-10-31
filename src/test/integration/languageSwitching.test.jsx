import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import MobileBottomNav from '../../components/MobileBottomNav';
import * as AppContextModule from '../../context/AppContext';
import { t } from '../../utils/translations';

describe('Integration Tests: Language Switching across UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders language selector and switches active language between EN, HI, and BN', () => {
    let currentLang = 'en';
    const mockSetLanguage = vi.fn((newLang) => {
      currentLang = newLang;
    });

    const mockContext = {
      user: { name: 'Test Member', email: 'test@example.com' },
      rewardWallet: 500,
      totalLockedPrincipal: 2000,
      isWithdrawalAllowed: true,
      sundayStatus: { isOpen: false, formattedCountdown: '2d 4h' },
      forceSunday: false,
      toggleForceSunday: vi.fn(),
      currentRole: 'investor',
      switchRole: vi.fn(),
      logoutUser: vi.fn(),
      language: 'en',
      setLanguage: mockSetLanguage,
      t: (key, params) => t(key, currentLang, params),
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

    const { rerender } = render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={vi.fn()}
        onOpenAuth={vi.fn()}
        onOpenPayout={vi.fn()}
        onOpenDeposit={vi.fn()}
        onOpenAdminLogin={vi.fn()}
      />
    );

    // Initial English check
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Task Center/i)).toBeInTheDocument();

    // Now switch to Hindi
    currentLang = 'hi';
    mockContext.language = 'hi';
    rerender(
      <Navbar
        activeTab="dashboard"
        setActiveTab={vi.fn()}
        onOpenAuth={vi.fn()}
        onOpenPayout={vi.fn()}
        onOpenDeposit={vi.fn()}
        onOpenAdminLogin={vi.fn()}
      />
    );

    expect(screen.getByText('डैशबोर्ड')).toBeInTheDocument();
    expect(screen.getByText('टास्क केंद्र')).toBeInTheDocument();

    // Now switch to Bengali
    currentLang = 'bn';
    mockContext.language = 'bn';
    rerender(
      <Navbar
        activeTab="dashboard"
        setActiveTab={vi.fn()}
        onOpenAuth={vi.fn()}
        onOpenPayout={vi.fn()}
        onOpenDeposit={vi.fn()}
        onOpenAdminLogin={vi.fn()}
      />
    );

    expect(screen.getByText('ড্যাশবোর্ড')).toBeInTheDocument();
    expect(screen.getByText('টাস্ক সেন্টার')).toBeInTheDocument();
  });

  it('renders translated tabs in MobileBottomNav', () => {
    const mockContext = {
      language: 'bn',
      t: (key, params) => t(key, 'bn', params),
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

    render(
      <MobileBottomNav
        activeTab="dashboard"
        setActiveTab={vi.fn()}
      />
    );

    // Check Bengali labels
    expect(screen.getByText('ড্যাশবোর্ড')).toBeInTheDocument();
    expect(screen.getByText('টাস্ক')).toBeInTheDocument();
    expect(screen.getByText('প্ল্যান')).toBeInTheDocument();
  });
});
