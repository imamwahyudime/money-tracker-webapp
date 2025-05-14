// js/config.js

export const STORAGE_KEY = 'moneyTrackerData_v3.0_modular'; // Updated version for new structure

export const CURRENCY_SYMBOLS = {
    IDR: 'Rp',
    USD: '$',
    JPY: '¥',
    EUR: '€',
    SGD: 'S$'
};

export const DEFAULT_DISPLAY_CURRENCY = 'IDR';

export const DEFAULT_CATEGORIES = [
    { id: 'cat_income_salary', name: 'Salary', type: 'income' },
    { id: 'cat_income_freelance', name: 'Freelance/Contract', type: 'income' },
    { id: 'cat_income_investment', name: 'Investment', type: 'income' },
    { id: 'cat_income_gifts', name: 'Gifts Received', type: 'income' },
    { id: 'cat_income_other', name: 'Other Income', type: 'income' },
    { id: 'cat_outcome_housing', name: 'Housing', type: 'outcome' },
    { id: 'cat_outcome_utilities', name: 'Utilities', type: 'outcome' },
    { id: 'cat_outcome_groceries', name: 'Groceries', type: 'outcome' },
    { id: 'cat_outcome_transport', name: 'Transportation', type: 'outcome' },
    { id: 'cat_outcome_health', name: 'Healthcare', type: 'outcome' },
    { id: 'cat_outcome_insurance', name: 'Insurance', type: 'outcome' },
    { id: 'cat_outcome_education', name: 'Education', type: 'outcome' },
    { id: 'cat_outcome_dining', name: 'Dining Out', type: 'outcome' },
    { id: 'cat_outcome_entertainment', name: 'Entertainment', type: 'outcome' },
    { id: 'cat_outcome_shopping', name: 'Shopping', type: 'outcome' },
    { id: 'cat_outcome_travel', name: 'Travel', type: 'outcome' },
    { id: 'cat_outcome_gifts_donations', name: 'Gifts/Donations', type: 'outcome' },
    { id: 'cat_outcome_debt', name: 'Debt Repayment', type: 'outcome' },
    { id: 'cat_outcome_personal_care', name: 'Personal Care', type: 'outcome' },
    { id: 'cat_outcome_misc', name: 'Miscellaneous', type: 'outcome' },
    { id: 'cat_uncategorized', name: 'Uncategorized', type: 'universal' }
];

export const DEFAULT_EXCHANGE_RATES = {
    base: 'USD',
    rates: {
        'USD': 1,
        'IDR': 16200,
        'EUR': 0.92,
        'JPY': 155,
        'SGD': 1.35
    },
    lastUpdated: new Date().toISOString()
};

export const DEFAULT_FINANCIAL_MONTH_START_DAY = 1;

export const DEFAULT_THEME = 'light';
export const AVAILABLE_THEMES = [
    { value: 'light', name: 'Light Mode' },
    { value: 'dark', name: 'Dark Mode' },
    { value: 'sepia', name: 'Sepia (Eye-Friendly)' }
];