// js/domElements.js

/**
 * Selects and exports all necessary DOM elements for the application.
 */

// Profile Sidebar Elements
export const addProfileBtn = document.getElementById('addProfileBtn');
export const profilesListEl = document.getElementById('profilesListEl'); 
export const viewAllProfilesBtn = document.getElementById('viewAllProfilesBtn');
export const appCurrencySelect = document.getElementById('appCurrencySelect'); 
export const manageCategoriesBtn = document.getElementById('manageCategoriesBtn'); // New

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
export const transactionsListEl = document.getElementById('transactionsListEl'); 
export const noTransactionsMessage = document.getElementById('noTransactionsMessage');

// Profile Modal Elements
export const profileModal = document.getElementById('profileModal');
export const profileModalTitle = document.getElementById('profileModalTitle');
export const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
export const profileForm = document.getElementById('profileForm');
export const profileIdInput = document.getElementById('profileIdInput'); 
export const profileNameInput = document.getElementById('profileNameInput');
export const profileCurrencyInput = document.getElementById('profileCurrencyInput'); 
export const cancelProfileModalBtn = document.getElementById('cancelProfileModalBtn');
export const saveProfileBtn = document.getElementById('saveProfileBtn');

// Transaction Modal Elements
export const transactionModal = document.getElementById('transactionModal');
export const transactionModalTitle = document.getElementById('transactionModalTitle');
export const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
export const transactionForm = document.getElementById('transactionForm');
export const transactionIdInput = document.getElementById('transactionIdInput'); 
export const transactionTypeInput = document.getElementById('transactionTypeInput'); 
export const transactionDescriptionInput = document.getElementById('transactionDescriptionInput');
export const transactionAmountInput = document.getElementById('transactionAmountInput');
export const transactionCategoryInput = document.getElementById('transactionCategoryInput'); 
export const transactionDateInput = document.getElementById('transactionDateInput');
export const cancelTransactionModalBtn = document.getElementById('cancelTransactionModalBtn');
export const saveTransactionBtn = document.getElementById('saveTransactionBtn');

// Category Management Modal Elements (New)
export const categoryModal = document.getElementById('categoryModal');
export const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
export const categoryForm = document.getElementById('categoryForm');
export const categoryIdInput = document.getElementById('categoryIdInput');
export const categoryNameInput = document.getElementById('categoryNameInput');
export const categoryTypeInput = document.getElementById('categoryTypeInput');
export const saveCategoryBtn = document.getElementById('saveCategoryBtn');
export const saveCategoryBtnText = document.getElementById('saveCategoryBtnText');
export const cancelEditCategoryBtn = document.getElementById('cancelEditCategoryBtn');
export const categoriesList = document.getElementById('categoriesList');

// Data Management Buttons
export const importDataBtn = document.getElementById('importDataBtn');
export const importFile = document.getElementById('importFile'); 
export const exportDataBtn = document.getElementById('exportDataBtn');
