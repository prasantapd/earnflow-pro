import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  t,
} from '../../utils/translations.js';

describe('Unit Tests: Multi-Language Translation System (English, Hindi, Bengali)', () => {
  describe('Supported Languages Definition', () => {
    it('supports English (en), Hindi (hi), and Bengali (bn)', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'hi', 'bn']);
    });

    it('provides clear native display names for language picker', () => {
      expect(LANGUAGE_OPTIONS).toEqual([
        { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
        { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
        { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
      ]);
    });
  });

  describe('Key Parity Across All 3 Languages', () => {
    it('contains all essential translation keys in English, Hindi, and Bengali', () => {
      const enKeys = Object.keys(TRANSLATIONS.en);
      const hiKeys = Object.keys(TRANSLATIONS.hi);
      const bnKeys = Object.keys(TRANSLATIONS.bn);

      // Verify that major keys exist across all 3 languages
      const essentialKeys = [
        'nav_dashboard',
        'nav_plans',
        'nav_tasks',
        'nav_withdraw',
        'nav_network',
        'nav_history',
        'nav_economics',
        'nav_admin',
        'action_login',
        'action_register',
        'action_logout',
        'action_deposit',
        'action_withdraw',
        'wallet_task_rewards',
        'wallet_active_deposit',
        'trial_pass_badge',
        'zero_min_withdrawal',
        'daily_login_bonus',
        'streak_day',
        'task_claim_reward',
        'task_completed',
      ];

      essentialKeys.forEach((key) => {
        expect(enKeys).toContain(key);
        expect(hiKeys).toContain(key);
        expect(bnKeys).toContain(key);
      });
    });
  });

  describe('Translation Resolution & Interpolation', () => {
    it('returns English text when lang is en', () => {
      expect(t('nav_dashboard', 'en')).toBe('Dashboard');
      expect(t('nav_plans', 'en')).toBe('Plans & Tiers');
      expect(t('nav_tasks', 'en')).toBe('Task Center');
      expect(t('nav_withdraw', 'en')).toBe('Withdraw');
    });

    it('returns Hindi text when lang is hi', () => {
      expect(t('nav_dashboard', 'hi')).toBe('डैशबोर्ड');
      expect(t('nav_plans', 'hi')).toBe('योजनाएं और स्तर');
      expect(t('nav_tasks', 'hi')).toBe('टास्क केंद्र');
      expect(t('nav_withdraw', 'hi')).toBe('निकासी');
    });

    it('returns Bengali text when lang is bn', () => {
      expect(t('nav_dashboard', 'bn')).toBe('ড্যাশবোর্ড');
      expect(t('nav_plans', 'bn')).toBe('প্ল্যান ও মেম্বারশিপ');
      expect(t('nav_tasks', 'bn')).toBe('টাস্ক সেন্টার');
      expect(t('nav_withdraw', 'bn')).toBe('উইথড্রয়াল');
    });

    it('falls back to English when key is missing or language is unsupported', () => {
      expect(t('nav_dashboard', 'unknown_lang')).toBe('Dashboard');
      expect(t('non_existent_key', 'bn')).toBe('non_existent_key');
    });

    it('interpolates parameters correctly in all languages', () => {
      expect(t('streak_day_progress', 'en', { day: 3, total: 30 })).toBe('Day 3 of 30');
      expect(t('streak_day_progress', 'hi', { day: 3, total: 30 })).toBe('दिन 3 / 30');
      expect(t('streak_day_progress', 'bn', { day: 3, total: 30 })).toBe('দিন 3 / 30');
    });
  });
});
