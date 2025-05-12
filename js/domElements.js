// js/domElements.js

/**
 * Selects and exports all necessary DOM elements for the application.
 * This centralizes DOM selections, making it easier to manage and reducing redundancy.
 */

// Profile Sidebar Elements
export const addProfileBtn = document.getElementById('addProfileBtn');
export const profilesListEl = document.getElementById('profilesList');
export const viewAllProfilesBtn = document.getElementById('viewAllProfilesBtn');
export const appCurrencySelect = document.getElementById('appCurrencySelect'); // App settings currency

// Main Content Area Elements
export const currentProfileNameDisplay = document.getElementById('currentProfileNameDisplay');
export const profileCurrencyInfoDisplay = document.getElementById('profileCurrencyInfoDisplay');

// Summary Section Elements
export const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
export const totalOutcomeDisplay = document.getElementById('totalOutcomeDisplay');
export const netBalanceDisplay = document.getElementById('netBalanceDisplay');

// Transaction Buttons
export const addIncomeBtn = document.getElementById('addIncomeBtn');
export const addOutcomeBtn = document.getElementById('addOutcomeBtn');

// Transactions List Elements
export const transactionsListEl = document.getElementById('transactionsListEl'); // Corrected ID from HTML
export const noTransactionsMessage = document.getElementById('noTransactionsMessage');

// Profile Modal Elements
export const profileModal = document.getElementById('profileModal');
export const profileModalTitle = document.getElementById('profileModalTitle');
export const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
export const profileForm = document.getElementById('profileForm');
export const profileIdInput = document.getElementById('profileIdInput'); // Hidden input for profile ID
export const profileNameInput = document.getElementById('profileNameInput');
export const profileCurrencyInput = document.getElementById('profileCurrencyInput'); // Select element in profile modal
export const cancelProfileModalBtn = document.getElementById('cancelProfileModalBtn');
export const saveProfileBtn = document.getElementById('saveProfileBtn');

// Transaction Modal Elements
export const transactionModal = document.getElementById('transactionModal');
export const transactionModalTitle = document.getElementById('transactionModalTitle');
export const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
export const transactionForm = document.getElementById('transactionForm');
export const transactionIdInput = document.getElementById('transactionIdInput'); // Hidden input for transaction ID
export const transactionTypeInput = document.getElementById('transactionTypeInput'); // Hidden input for transaction type
export const transactionDescriptionInput = document.getElementById('transactionDescriptionInput');
export const transactionAmountInput = document.getElementById('transactionAmountInput');
export const transactionDateInput = document.getElementById('transactionDateInput');
export const cancelTransactionModalBtn = document.getElementById('cancelTransactionModalBtn');
export const saveTransactionBtn = document.getElementById('saveTransactionBtn');

// Data Management Buttons
export const importDataBtn = document.getElementById('importDataBtn');
export const importFile = document.getElementById('importFile'); // File input (hidden)
export const exportDataBtn = document.getElementById('exportDataBtn');
