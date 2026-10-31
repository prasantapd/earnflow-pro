// Multi-Language Translation System for TaskCoin Pro / EarnFlow Pro
// Supported languages: English (en), Hindi (hi), Bengali (bn)

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn'];

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_plans: 'Plans & Tiers',
    nav_tasks: 'Task Center',
    nav_withdraw: 'Withdraw',
    nav_network: 'Affiliate Network',
    nav_history: 'Ledger History',
    nav_economics: 'Fund Reserve',
    nav_admin: 'Admin Console',

    // Mobile nav short labels
    mobile_nav_dashboard: 'Dashboard',
    mobile_nav_tasks: 'Tasks',
    mobile_nav_plans: 'Plans',
    mobile_nav_withdraw: 'Withdraw',
    mobile_nav_history: 'History',

    // Common Actions
    action_login: 'Login',
    action_register: 'Create Account',
    action_logout: 'Sign Out',
    action_deposit: 'Deposit / Join',
    action_withdraw: 'Withdraw Earnings',
    action_cancel: 'Cancel',
    action_confirm: 'Confirm',
    action_submit: 'Submit',
    action_change: 'Change',
    action_upgrade: 'Upgrade Plan',
    action_view_details: 'View Details',
    action_claim_bonus: 'Claim Daily Login Bonus',

    // Language
    language_select: 'Language',
    language_en: 'English',
    language_hi: 'हिंदी (Hindi)',
    language_bn: 'বাংলা (Bengali)',

    // Wallets & Headers
    wallet_task_rewards: 'Task Rewards Wallet',
    wallet_active_deposit: 'Active Deposit',
    wallet_available_balance: 'Available Balance',
    wallet_payout_destination: 'Payout Destination',

    // Trial Pass
    trial_pass_badge: '⚡ 3-Day Trial Pass (₹300)',
    trial_pass_desc: 'Introductory 3-day pass with full ₹2,000 base rewards and 1-time lifetime zero minimum withdrawal.',
    trial_pass_once_rule: 'Once per mobile number only',
    zero_min_withdrawal: 'Zero Minimum Withdrawal',
    zero_min_badge: '⚡ Trial Pass: Zero Min Requirement',
    zero_min_desc: 'Withdraw whatever amount you want • 1 Lifetime Payout',

    // Free Registration Pass
    free_pass_badge: '🎁 Free Registration Pass',
    free_pass_locked: '🔒 Free Pass: Withdrawals Locked',
    free_pass_locked_desc: 'Activate ₹300 Trial or Membership Plan to cash out',

    // Daily Login Streak
    daily_login_bonus: 'Daily Login Streak Bonus',
    streak_day: 'Day {day}',
    streak_day_progress: 'Day {day} of {total}',
    streak_claimed: 'Claimed',
    streak_claim_now: 'Claim Day {day} Bonus',
    streak_claimed_today: 'Bonus Claimed Today',

    // Task Center
    task_center_title: 'Daily Task Reward Center',
    task_center_subtitle: 'Complete daily brand verification tasks to earn continuous cash rewards',
    task_available: 'Available Tasks',
    task_completed: 'Completed',
    task_start: 'Start Task',
    task_claim_reward: 'Claim Reward',
    task_multiplier_badge: '{mult}× Multiplier',
    task_custom_booster: '⭐ Special Task Booster',
    task_watch_video: 'Watch Video Ad',
    task_solve_quiz: 'Solve Quiz',
    task_play_puzzle: 'Slide Puzzle',
    task_walking_step: 'Walking Steps Counter',
    task_music_stream: 'Listen & Review Audio',

    // Withdrawal View & Modal
    withdrawal_title: '24/7 Instant Reward Withdrawal',
    withdrawal_subtitle: 'Instant IMPS / UPI payout anytime, any day (Min ₹100 • 1 withdrawal / 24h)',
    withdrawal_gross: 'Gross Withdrawal',
    withdrawal_fee: 'Platform Fee (Zero Fee)',
    withdrawal_net: 'Net Disbursed to Account',
    withdrawal_remaining_wallet: 'Remaining Task Wallet',
    withdrawal_sunday_badge: 'Sunday Payout Gateway Active',
    withdrawal_instant_gateway: '24/7 Payout Gateway Active',

    // General & Alerts
    account_pending: 'Account Pending Admin Activation',
    account_suspended: 'Account Suspended',
    sunday_window_notice: 'Sunday Payouts Open (00:00 - 23:59 IST)',
    admin_control: 'Admin Control',
    plan_multipliers: 'Plan Multipliers',
    base_anchor_note: 'Base Authoring Rate: ₹2,000 Plan = 1.0×',
  },

  hi: {
    // Navigation
    nav_dashboard: 'डैशबोर्ड',
    nav_plans: 'योजनाएं और स्तर',
    nav_tasks: 'टास्क केंद्र',
    nav_withdraw: 'निकासी',
    nav_network: 'एफिलिएट नेटवर्क',
    nav_history: 'खाता इतिहास',
    nav_economics: 'फंड रिजर्व',
    nav_admin: 'एडमिन पैनल',

    // Mobile nav short labels
    mobile_nav_dashboard: 'डैशबोर्ड',
    mobile_nav_tasks: 'टास्क',
    mobile_nav_plans: 'प्लान',
    mobile_nav_withdraw: 'निकासी',
    mobile_nav_history: 'इतिहास',

    // Common Actions
    action_login: 'लॉग इन करें',
    action_register: 'खाता बनाएं',
    action_logout: 'साइन आउट',
    action_deposit: 'जमा करें / जुड़ें',
    action_withdraw: 'कमाई निकालें',
    action_cancel: 'रद्द करें',
    action_confirm: 'पुष्टि करें',
    action_submit: 'जमा करें',
    action_change: 'बदलें',
    action_upgrade: 'प्लान अपग्रेड करें',
    action_view_details: 'विवरण देखें',
    action_claim_bonus: 'दैनिक लॉगिन बोनस प्राप्त करें',

    // Language
    language_select: 'भाषा (Language)',
    language_en: 'English',
    language_hi: 'हिंदी (Hindi)',
    language_bn: 'বাংলা (Bengali)',

    // Wallets & Headers
    wallet_task_rewards: 'टास्क रिवॉर्ड वॉलेट',
    wallet_active_deposit: 'सक्रिय जमा',
    wallet_available_balance: 'उपलब्ध शेष राशि',
    wallet_payout_destination: 'भुगतान गंतव्य',

    // Trial Pass
    trial_pass_badge: '⚡ 3-दिवसीय ट्रायल पास (₹300)',
    trial_pass_desc: 'परिचयात्मक 3-दिवसीय पास, पूरे ₹2,000 आधार रिवॉर्ड और 1 बार जीवनभर के लिए बिना न्यूनतम सीमा निकासी।',
    trial_pass_once_rule: 'केवल एक मोबाइल नंबर पर एक बार',
    zero_min_withdrawal: 'शून्य न्यूनतम निकासी',
    zero_min_badge: '⚡ ट्रायल पास: शून्य न्यूनतम सीमा',
    zero_min_desc: 'जितनी चाहें उतनी राशि निकालें • जीवन में 1 बार निकासी',

    // Free Registration Pass
    free_pass_badge: '🎁 नि:शुल्क पंजीकरण पास',
    free_pass_locked: '🔒 फ्री पास: निकासी लॉक है',
    free_pass_locked_desc: 'पैसे निकालने के लिए ₹300 ट्रायल या सदस्यता प्लान सक्रिय करें',

    // Daily Login Streak
    daily_login_bonus: 'दैनिक लॉगिन स्ट्रीक बोनस',
    streak_day: 'दिन {day}',
    streak_day_progress: 'दिन {day} / {total}',
    streak_claimed: 'प्राप्त किया',
    streak_claim_now: 'दिन {day} का बोनस लें',
    streak_claimed_today: 'आज का बोनस ले लिया गया है',

    // Task Center
    task_center_title: 'दैनिक टास्क रिवॉर्ड केंद्र',
    task_center_subtitle: 'दैनिक ब्रांड सत्यापन टास्क पूरे करें और निरंतर नकद पुरस्कार अर्जित करें',
    task_available: 'उपलब्ध टास्क',
    task_completed: 'पूर्ण हुआ',
    task_start: 'टास्क शुरू करें',
    task_claim_reward: 'रिवॉर्ड प्राप्त करें',
    task_multiplier_badge: '{mult}× गुणक',
    task_custom_booster: '⭐ विशेष टास्क बूस्टर',
    task_watch_video: 'वीडियो विज्ञापन देखें',
    task_solve_quiz: 'क्विज हल करें',
    task_play_puzzle: 'स्लाइड पहेली खेलें',
    task_walking_step: 'कदम ट्रैकर टास्क',
    task_music_stream: 'ऑडियो सुनें और समीक्षा करें',

    // Withdrawal View & Modal
    withdrawal_title: '24/7 त्वरित रिवॉर्ड निकासी',
    withdrawal_subtitle: 'किसी भी समय, किसी भी दिन त्वरित IMPS / UPI भुगतान (न्यूनतम ₹100 • 24 घंटे में 1 बार)',
    withdrawal_gross: 'सकल निकासी',
    withdrawal_fee: 'प्लेटफ़ॉर्म शुल्क (शून्य शुल्क)',
    withdrawal_net: 'खाते में वितरित शुद्ध राशि',
    withdrawal_remaining_wallet: 'शेष टास्क वॉलेट',
    withdrawal_sunday_badge: 'रविवार भुगतान गेटवे सक्रिय',
    withdrawal_instant_gateway: '24/7 भुगतान गेटवे सक्रिय',

    // General & Alerts
    account_pending: 'खाता एडमिन सक्रियण के लिए लंबित है',
    account_suspended: 'खाता निलंबित कर दिया गया है',
    sunday_window_notice: 'रविवार निकासी खुली है (00:00 - 23:59 IST)',
    admin_control: 'एडमिन नियंत्रण',
    plan_multipliers: 'प्लान गुणक',
    base_anchor_note: 'आधार दर: ₹2,000 प्लान = 1.0×',
  },

  bn: {
    // Navigation
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_plans: 'প্ল্যান ও মেম্বারশিপ',
    nav_tasks: 'টাস্ক সেন্টার',
    nav_withdraw: 'উইথড্রয়াল',
    nav_network: 'অ্যাফিলিয়েট নেটওয়ার্ক',
    nav_history: 'লেনদেন ইতিহাস',
    nav_economics: 'ফান্ড রিজার্ভ',
    nav_admin: 'অ্যাডমিন প্যানেল',

    // Mobile nav short labels
    mobile_nav_dashboard: 'ড্যাশবোর্ড',
    mobile_nav_tasks: 'টাস্ক',
    mobile_nav_plans: 'প্ল্যান',
    mobile_nav_withdraw: 'উইথড্র',
    mobile_nav_history: 'ইতিহাস',

    // Common Actions
    action_login: 'লগইন করুন',
    action_register: 'অ্যাকাউন্ট তৈরি করুন',
    action_logout: 'সাইন আউট',
    action_deposit: 'ডিপোজিট / যুক্ত হন',
    action_withdraw: 'উপার্জন উইথড্র করুন',
    action_cancel: 'বাতিল',
    action_confirm: 'নিশ্চিত করুন',
    action_submit: 'সাবমিট করুন',
    action_change: 'পরিবর্তন করুন',
    action_upgrade: 'প্ল্যান আপগ্রেড করুন',
    action_view_details: 'বিস্তারিত দেখুন',
    action_claim_bonus: 'দৈনিক লগইন বোনাস নিন',

    // Language
    language_select: 'ভাষা (Language)',
    language_en: 'English',
    language_hi: 'हिंदी (Hindi)',
    language_bn: 'বাংলা (Bengali)',

    // Wallets & Headers
    wallet_task_rewards: 'টাস্ক রিওয়ার্ড ওয়ালেট',
    wallet_active_deposit: 'সক্রিয় ডিপোজিট',
    wallet_available_balance: 'উপলব্ধ ব্যালেন্স',
    wallet_payout_destination: 'পেমেন্ট গ্রহণের মাধ্যম',

    // Trial Pass
    trial_pass_badge: '⚡ ৩-দিনের ট্রায়াল পাস (₹৩০০)',
    trial_pass_desc: 'সূচনামূলক ৩ দিনের পাস, পুরো ₹২,০০০ প্ল্যানের সমপরিমাণ বেস রিওয়ার্ড এবং ১ বার আজীবনে কোনো সর্বনিম্ন সীমা ছাড়াই উইথড্র সুবিধা।',
    trial_pass_once_rule: 'প্রতি মোবাইল নম্বরে জীবনে মাত্র একবার',
    zero_min_withdrawal: 'জিরো মিনিমাম উইথড্রয়াল',
    zero_min_badge: '⚡ ট্রায়াল পাস: জিরো মিনিমাম সুবিধা',
    zero_min_desc: 'যত খুশি তত টাকা তুলুন • আজীবনে ১ বার উইথড্র',

    // Free Registration Pass
    free_pass_badge: '🎁 ফ্রি রেজিস্ট্রেশন পাস',
    free_pass_locked: '🔒 ফ্রি পাস: উইথড্র লক করা আছে',
    free_pass_locked_desc: 'টাকা তুলতে ₹৩০০ ট্রায়াল বা মূল মেম্বারশিপ প্ল্যান সক্রিয় করুন',

    // Daily Login Streak
    daily_login_bonus: 'দৈনিক লগইন স্ট্রিক বোনাস',
    streak_day: 'দিন {day}',
    streak_day_progress: 'দিন {day} / {total}',
    streak_claimed: 'গৃহীত',
    streak_claim_now: 'দিন {day}-এর বোনাস নিন',
    streak_claimed_today: 'আজকের বোনাস নেওয়া হয়ে গেছে',

    // Task Center
    task_center_title: 'দৈনিক টাস্ক রিওয়ার্ড সেন্টার',
    task_center_subtitle: 'প্রতিদিনের ব্র্যান্ড ভেরিফিকেশন টাস্ক সম্পূর্ণ করে নগদ টাকা উপার্জন করুন',
    task_available: 'উপলব্ধ টাস্ক',
    task_completed: 'সম্পন্ন হয়েছে',
    task_start: 'টাস্ক শুরু করুন',
    task_claim_reward: 'রিওয়ার্ড নিন',
    task_multiplier_badge: '{mult}× মাল্টিপ্লায়ার',
    task_custom_booster: '⭐ স্পেশাল টাস্ক বুস্টার',
    task_watch_video: 'ভিডিও বিজ্ঞাপন দেখুন',
    task_solve_quiz: 'কুইজের উত্তর দিন',
    task_play_puzzle: 'স্লাইড পাজল খেলুন',
    task_walking_step: 'হাঁটার স্টেপ কাউন্টার টাস্ক',
    task_music_stream: 'অডিও শুনুন ও রিভিউ দিন',

    // Withdrawal View & Modal
    withdrawal_title: '২৪/৭ ইনস্ট্যান্ট রিওয়ার্ড উইথড্রয়াল',
    withdrawal_subtitle: 'যে কোনো দিন যে কোনো সময় ইনস্ট্যান্ট IMPS / UPI পেআউট (সর্বনিম্ন ₹১০০ • ২৪ ঘণ্টায় ১ বার)',
    withdrawal_gross: 'মোট উইথড্রয়াল',
    withdrawal_fee: 'প্ল্যাটফর্ম ফি (সম্পূর্ণ ফ্রি)',
    withdrawal_net: 'অ্যাকাউন্টে জমা হওয়া নেট টাকা',
    withdrawal_remaining_wallet: 'অবশিষ্ট টাস্ক ওয়ালেট',
    withdrawal_sunday_badge: 'রবিবার পেআউট গেটওয়ে সক্রিয়',
    withdrawal_instant_gateway: '২৪/৭ পেআউট গেটওয়ে সক্রিয়',

    // General & Alerts
    account_pending: 'অ্যাকাউন্টটি অ্যাডমিন অনুমোদনের অপেক্ষায় আছে',
    account_suspended: 'অ্যাকাউন্টটি স্থগিত করা হয়েছে',
    sunday_window_notice: 'রবিবার উইথড্রয়াল খোলা আছে (০০:০০ - ২৩:৫৯ IST)',
    admin_control: 'অ্যাডমিন কন্ট্রোল',
    plan_multipliers: 'প্ল্যান মাল্টিপ্লায়ার',
    base_anchor_note: 'বেস রেট: ₹২,০০০ প্ল্যান = ১.০×',
  },
};

/**
 * Translation helper function.
 * @param {string} key - The translation key.
 * @param {string} lang - Language code ('en', 'hi', or 'bn').
 * @param {object} params - Optional interpolation parameters (e.g. { day: 3, mult: 5.5 }).
 * @returns {string} The localized string.
 */
export function t(key, lang = 'en', params = {}) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  let str = TRANSLATIONS[targetLang]?.[key];

  // Fallback to English if key is missing in target language
  if (str === undefined) {
    str = TRANSLATIONS.en?.[key];
  }

  // If still not found, return the key itself
  if (str === undefined) {
    return key;
  }

  // Parameter interpolation: replace {paramName} with value
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return str;
}
