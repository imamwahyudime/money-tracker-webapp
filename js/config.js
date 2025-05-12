// js/config.js

/**
 * Configuration constants for the Money Tracker application.
 */

export const STORAGE_KEY = 'moneyTrackerData_v2.2_categories'; // Incremented version

export const CURRENCY_SYMBOLS = {
    IDR: 'Rp',
    USD: '$',
    JPY: '¥',
    EUR: '€',
    SGD: 'S$'
};

export const DEFAULT_GLOBAL_CURRENCY = 'IDR';

// Default categories for transactions. Users can manage these in future updates.
export const DEFAULT_CATEGORIES = [
    // Income Categories
    { id: 'cat_income_salary', name: 'Salary', type: 'income' },
    { id: 'cat_income_freelance', name: 'Freelance/Contract', type: 'income' },
    { id: 'cat_income_investment', name: 'Investment', type: 'income' },
    { id: 'cat_income_gifts', name: 'Gifts Received', type: 'income' },
    { id: 'cat_income_other', name: 'Other Income', type: 'income' },
    // Outcome Categories
    { id: 'cat_outcome_housing', name: 'Housing (Rent/Mortgage)', type: 'outcome' },
    { id: 'cat_outcome_utilities', name: 'Utilities (Water, Electricity, Gas, Internet)', type: 'outcome' },
    { id: 'cat_outcome_groceries', name: 'Groceries', type: 'outcome' },
    { id: 'cat_outcome_transport', name: 'Transportation (Fuel, Public Transport)', type: 'outcome' },
    { id: 'cat_outcome_health', name: 'Healthcare/Medical', type: 'outcome' },
    { id: 'cat_outcome_insurance', name: 'Insurance', type: 'outcome' },
    { id: 'cat_outcome_education', name: 'Education', type: 'outcome' },
    { id: 'cat_outcome_dining', name: 'Dining Out/Takeaway', type: 'outcome' },
    { id: 'cat_outcome_entertainment', name: 'Entertainment', type: 'outcome' },
    { id: 'cat_outcome_shopping', name: 'Shopping (Clothes, Personal)', type: 'outcome' },
    { id: 'cat_outcome_travel', name: 'Travel/Vacation', type: 'outcome' },
    { id: 'cat_outcome_gifts_donations', name: 'Gifts/Donations Given', type: 'outcome' },
    { id: 'cat_outcome_debt', name: 'Debt Repayment', type: 'outcome' },
    { id: 'cat_outcome_personal_care', name: 'Personal Care', type: 'outcome' },
    { id: 'cat_outcome_misc', name: 'Miscellaneous', type: 'outcome' },
    // Universal Category (can be used for both if not specific)
    { id: 'cat_uncategorized', name: 'Uncategorized', type: 'universal' } 
];
