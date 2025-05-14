// js/state/appState.js
import {
    DEFAULT_DISPLAY_CURRENCY,
    DEFAULT_CATEGORIES,
    DEFAULT_EXCHANGE_RATES,
    DEFAULT_THEME,
    AVAILABLE_THEMES,
    DEFAULT_FINANCIAL_MONTH_START_DAY
} from '../config.js';
import { loadDataFromStorage, saveDataToStorage } from '../services/storageService.js';
import { generateId } from '../utils.js'; // Still needed for data integrity checks during load

// Define the initial structure of the application state
let appState = {
    profiles: [],
    activeProfileId: 'all', // Can be 'all' or a specific profile ID
    ui: { // For UI-specific states not directly part of core data
        editingProfileId: null,
        editingTransactionId: null,
        editingCategoryId: null,
        // activeProfileIdForTransactionModal: null, // Example if needed
    },
    settings: {
        displayCurrency: DEFAULT_DISPLAY_CURRENCY,
        currentTheme: DEFAULT_THEME,
        projectionDate: null, // Date for financial projections
    },
    categories: [],
    exchangeRates: {
        base: DEFAULT_EXCHANGE_RATES.base,
        rates: { ...DEFAULT_EXCHANGE_RATES.rates },
        lastUpdated: DEFAULT_EXCHANGE_RATES.lastUpdated,
    },
};

/**
 * Initializes the application state with default values.
 */
function initializeDefaultAppState() {
    appState.profiles = [];
    appState.activeProfileId = 'all';
    appState.ui = {
        editingProfileId: null,
        editingTransactionId: null,
        editingCategoryId: null,
    };
    appState.settings = {
        displayCurrency: DEFAULT_DISPLAY_CURRENCY,
        currentTheme: DEFAULT_THEME,
        projectionDate: null,
    };
    // Deep copy default categories to prevent direct modification of config objects
    appState.categories = DEFAULT_CATEGORIES.map(category => ({ ...category, id: category.id || `cat_${generateId()}` }));
    // Deep copy default exchange rates
    appState.exchangeRates = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
    console.log("Application state initialized with defaults.");
}

/**
 * Loads the application state from storage or initializes with defaults.
 * This function also performs basic validation and migration if necessary.
 */
export function loadAppState() {
    const loadedData = loadDataFromStorage();
    if (loadedData) {
        // Basic validation of loaded data structure
        // More comprehensive validation/migration logic can be added here
        appState.profiles = (loadedData.profiles || []).map(profile => ({
            ...profile,
            id: profile.id || generateId(), // Ensure ID exists
            financialMonthStartDay: profile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY,
            transactions: (profile.transactions || []).map(tx => ({
                ...tx,
                id: tx.id || generateId(), // Ensure ID exists
                categoryId: tx.categoryId || 'cat_uncategorized',
                isReimbursed: tx.isReimbursed || false,
            }))
        }));

        appState.activeProfileId = loadedData.activeProfileId || 'all';
        // Ensure activeProfileId is valid
        const profileExists = appState.profiles.some(p => p.id === appState.activeProfileId);
        if (appState.activeProfileId !== 'all' && !profileExists) {
            appState.activeProfileId = appState.profiles.length > 0 ? appState.profiles[0].id : 'all';
        }

        appState.settings = {
            displayCurrency: loadedData.displayCurrency || DEFAULT_DISPLAY_CURRENCY, // Legacy support
            currentTheme: loadedData.currentTheme || (loadedData.settings && loadedData.settings.currentTheme) || DEFAULT_THEME,
            projectionDate: (loadedData.settings && loadedData.settings.projectionDate) || loadedData.projectionDate || null,
        };
        // Ensure theme is valid
        if (!AVAILABLE_THEMES.some(t => t.value === appState.settings.currentTheme)) {
            appState.settings.currentTheme = DEFAULT_THEME;
        }

        appState.categories = Array.isArray(loadedData.categories) && loadedData.categories.length > 0
            ? loadedData.categories.map(cat => ({ ...cat, id: cat.id || `cat_${generateId()}` }))
            : DEFAULT_CATEGORIES.map(category => ({ ...category, id: category.id || `cat_${generateId()}` }));

        appState.exchangeRates = loadedData.exchangeRates
            ? {
                base: loadedData.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base,
                rates: loadedData.exchangeRates.rates || { ...DEFAULT_EXCHANGE_RATES.rates },
                lastUpdated: loadedData.exchangeRates.lastUpdated || new Date().toISOString()
              }
            : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));

        appState.ui = loadedData.ui || { editingProfileId: null, editingTransactionId: null, editingCategoryId: null };

        console.log("Application state loaded from storage:", appState);
    } else {
        initializeDefaultAppState();
    }
}

/**
 * Saves the current application state to storage.
 */
export function saveAppState() {
    // Create a slimmed-down version for saving, excluding transient UI states if necessary
    // For now, saving the entire appState structure.
    // Consider excluding parts of appState.ui if they are purely runtime.
    saveDataToStorage(appState);
}

/**
 * Returns a deep copy of the current application state.
 * @returns {object} The current application state.
 */
export function getAppState() {
    return JSON.parse(JSON.stringify(appState)); // Deep copy to prevent direct mutation
}

/**
 * Updates a specific top-level key in the application state or a nested key within settings or ui.
 * For more complex updates (e.g., adding a profile), dedicated functions in respective modules should be used.
 * @param {string} keyPath - The key or path to update (e.g., 'activeProfileId', 'settings.currentTheme', 'ui.editingProfileId').
 * @param {*} value - The new value.
 */
export function updateAppState(keyPath, value) {
    const keys = keyPath.split('.');
    let currentStatePart = appState;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!currentStatePart[keys[i]] || typeof currentStatePart[keys[i]] !== 'object') {
            console.warn(`Invalid key path for updateAppState: ${keyPath}`);
            return;
        }
        currentStatePart = currentStatePart[keys[i]];
    }

    const finalKey = keys[keys.length - 1];
    if (Object.prototype.hasOwnProperty.call(currentStatePart, finalKey) || typeof currentStatePart === 'object') {
        currentStatePart[finalKey] = value;
        console.log(`App state updated: ${keyPath} =`, value);
    } else {
        console.warn(`Attempted to update non-existent or non-object state key: ${keyPath}`);
    }
}


/**
 * Replaces the entire application state. Used for data import.
 * Performs validation before replacing.
 * @param {object} newState - The new state object to replace the current state.
 * @returns {boolean} True if replacement was successful, false otherwise.
 */
export function replaceAppState(newState) {
    // Add more robust validation here based on the expected structure of an imported state
    if (newState && newState.profiles && typeof newState.settings !== 'undefined') {
        // Create a new state object based on newState, ensuring all parts are well-defined
        // This also helps in sanitizing the input and ensuring all necessary fields are present
        appState.profiles = (newState.profiles || []).map(profile => ({
            ...profile,
            id: profile.id || generateId(),
            financialMonthStartDay: profile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY,
            transactions: (profile.transactions || []).map(tx => ({
                ...tx,
                id: tx.id || generateId(),
                categoryId: tx.categoryId || 'cat_uncategorized',
                isReimbursed: tx.isReimbursed || false,
            }))
        }));

        appState.activeProfileId = newState.activeProfileId || 'all';
        const profileExists = appState.profiles.some(p => p.id === appState.activeProfileId);
        if (appState.activeProfileId !== 'all' && !profileExists) {
            appState.activeProfileId = appState.profiles.length > 0 ? appState.profiles[0].id : 'all';
        }

        appState.settings = {
            displayCurrency: newState.settings.displayCurrency || DEFAULT_DISPLAY_CURRENCY,
            currentTheme: newState.settings.currentTheme || DEFAULT_THEME,
            projectionDate: newState.settings.projectionDate || null,
        };
        if (!AVAILABLE_THEMES.some(t => t.value === appState.settings.currentTheme)) {
            appState.settings.currentTheme = DEFAULT_THEME;
        }

        appState.categories = Array.isArray(newState.categories) && newState.categories.length > 0
            ? newState.categories.map(cat => ({ ...cat, id: cat.id || `cat_${generateId()}` }))
            : DEFAULT_CATEGORIES.map(category => ({ ...category, id: category.id || `cat_${generateId()}` }));


        appState.exchangeRates = newState.exchangeRates
            ? {
                base: newState.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base,
                rates: newState.exchangeRates.rates || { ...DEFAULT_EXCHANGE_RATES.rates },
                lastUpdated: newState.exchangeRates.lastUpdated || new Date().toISOString()
              }
            : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));

        appState.ui = newState.ui || { editingProfileId: null, editingTransactionId: null, editingCategoryId: null };

        console.log("App state replaced by import:", appState);
        saveAppState(); // Persist the newly imported state
        return true;
    }
    console.error("Invalid import data structure for replacing app state.", newState);
    return false;
}

// Initialize the state when the module loads
// loadAppState(); // This will be called from main.js after all modules are loaded