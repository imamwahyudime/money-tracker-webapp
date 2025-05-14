// js/domElements.js

// --- Sidebar Elements ---
// Profile Sidebar
export const addProfileBtn = document.getElementById('addProfileBtn');
export const profilesListEl = document.getElementById('profilesListEl');
export const viewAllProfilesBtn = document.getElementById('viewAllProfilesBtn');

// App Settings Sidebar
export const appDisplayCurrencySelect = document.getElementById('appDisplayCurrencySelect');
export const themeSelector = document.getElementById('themeSelector');
export const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');

// Exchange Rate Info Display (Sidebar)
export const exchangeRateBaseDisplay = document.getElementById('exchangeRateBaseDisplay');
export const exchangeRateTimestampDisplay = document.getElementById('exchangeRateTimestampDisplay');
export const manageExchangeRatesBtn = document.getElementById('manageExchangeRatesBtn');

// Data Management (Sidebar)
export const importDataBtn = document.getElementById('importDataBtn');
export const importFile = document.getElementById('importFile'); // Input type file for app data
export const exportDataBtn = document.getElementById('exportDataBtn');


// --- Main Content Area Elements ---
// Header
export const currentProfileNameDisplay = document.getElementById('currentProfileNameDisplay');
export const profileCurrencyInfoDisplay = document.getElementById('profileCurrencyInfoDisplay');
export const activeDateRangeDisplay = document.getElementById('activeDateRangeDisplay');

// Date Projection
export const projectionDateInput = document.getElementById('projectionDateInput');
export const resetProjectionDateBtn = document.getElementById('resetProjectionDateBtn');

// Summary Section
export const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
export const totalOutcomeDisplay = document.getElementById('totalOutcomeDisplay');
export const netBalanceDisplay = document.getElementById('netBalanceDisplay');

// Transaction Buttons
export const addIncomeBtn = document.getElementById('addIncomeBtn');
export const addOutcomeBtn = document.getElementById('addOutcomeBtn');

// Transactions List
export const transactionsListEl = document.getElementById('transactionsListEl');
export const noTransactionsMessage = document.getElementById('noTransactionsMessage');


// --- Modal Elements ---
// Profile Modal
export const profileModal = document.getElementById('profileModal');
export const profileModalTitle = document.getElementById('profileModalTitle');
export const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
export const profileForm = document.getElementById('profileForm');
export const profileIdInput = document.getElementById('profileIdInput');
export const profileNameInput = document.getElementById('profileNameInput');
export const profileCurrencyInput = document.getElementById('profileCurrencyInput');
export const profileFinancialMonthStartDayInput = document.getElementById('profileFinancialMonthStartDayInput');
export const cancelProfileModalBtn = document.getElementById('cancelProfileModalBtn');
export const saveProfileBtn = document.getElementById('saveProfileBtn');

// Transaction Modal
export const transactionModal = document.getElementById('transactionModal');
export const transactionModalTitle = document.getElementById('transactionModalTitle');
export const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
export const transactionForm = document.getElementById('transactionForm');
export const transactionIdInput = document.getElementById('transactionIdInput');
export const transactionTypeInput = document.getElementById('transactionTypeInput'); // Hidden input for type
export const transactionDescriptionInput = document.getElementById('transactionDescriptionInput');
export const transactionAmountInput = document.getElementById('transactionAmountInput');
export const transactionCategoryInput = document.getElementById('transactionCategoryInput');
export const transactionDateInput = document.getElementById('transactionDateInput');
export const reimbursementSection = document.getElementById('reimbursementSection');
export const transactionIsReimbursedInput = document.getElementById('transactionIsReimbursedInput');
export const cancelTransactionModalBtn = document.getElementById('cancelTransactionModalBtn');
export const saveTransactionBtn = document.getElementById('saveTransactionBtn');

// Category Management Modal
export const categoryModal = document.getElementById('categoryModal');
export const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
export const categoryForm = document.getElementById('categoryForm');
export const categoryIdInput = document.getElementById('categoryIdInput'); // Hidden input for ID
export const categoryNameInput = document.getElementById('categoryNameInput');
export const categoryTypeInput = document.getElementById('categoryTypeInput');
export const saveCategoryBtn = document.getElementById('saveCategoryBtn'); // The button itself
export const saveCategoryBtnText = document.getElementById('saveCategoryBtnText'); // The span inside the button
export const cancelEditCategoryBtn = document.getElementById('cancelEditCategoryBtn');
export const categoriesList = document.getElementById('categoriesList'); // Container for listing categories

// Exchange Rate Management Modal
export const exchangeRateModal = document.getElementById('exchangeRateModal');
export const closeExchangeRateModalBtn = document.getElementById('closeExchangeRateModalBtn');
export const exchangeRateForm = document.getElementById('exchangeRateForm');
export const rateBaseCurrencySelect = document.getElementById('rateBaseCurrencySelect');
export const exchangeRatesListContainer = document.getElementById('exchangeRatesListContainer');
export const formBaseCurrencyLabel = document.getElementById('formBaseCurrencyLabel'); // Label showing current base like "1 USD ="
export const importRatesBtn = document.getElementById('importRatesBtn'); // Button to trigger file input
export const importRatesFile = document.getElementById('importRatesFile'); // Input type file for rates
export const exportRatesBtn = document.getElementById('exportRatesBtn');
export const cancelExchangeRateModalBtn = document.getElementById('cancelExchangeRateModalBtn');
export const saveExchangeRatesBtn = document.getElementById('saveExchangeRatesBtn');