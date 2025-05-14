// js/state.js
import {
    STORAGE_KEY,
    DEFAULT_DISPLAY_CURRENCY,
    DEFAULT_CATEGORIES,
    DEFAULT_EXCHANGE_RATES,
    DEFAULT_FINANCIAL_MONTH_START_DAY,
    CURRENCY_SYMBOLS,
    DEFAULT_THEME, // New
    AVAILABLE_THEMES // New
} from './config.js';
import { generateId } from './utils.js';

let state = {
    profiles: [],
    activeProfileId: 'all',
    editingProfileId: null,
    editingTransactionId: null,
    displayCurrency: DEFAULT_DISPLAY_CURRENCY,
    categories: [...DEFAULT_CATEGORIES],
    editingCategoryId: null,
    exchangeRates: { ...DEFAULT_EXCHANGE_RATES },
    projectionDate: null,
    currentTheme: DEFAULT_THEME, // New state property for theme
    // activeProfileIdForTransactionModal is a temporary UI state, might not need to be saved in localStorage
    // but can be part of the runtime state object if ui.js needs it across calls.
    // For now, it's handled as a transient update.
};

function initializeDefaultState() {
    state.profiles = [];
    state.activeProfileId = 'all';
    state.displayCurrency = DEFAULT_DISPLAY_CURRENCY;
    state.categories = [...DEFAULT_CATEGORIES.map(c => ({...c}))];
    state.editingCategoryId = null;
    state.exchangeRates = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
    state.projectionDate = null;
    state.currentTheme = DEFAULT_THEME; // Initialize theme
    console.log("State initialized with defaults.");
}

export function loadData() {
    console.log(`Attempting to load data from localStorage with key: ${STORAGE_KEY}`);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            if (parsedData && Array.isArray(parsedData.profiles) && typeof parsedData.activeProfileId !== 'undefined') {
                state.profiles = parsedData.profiles.map(profile => ({
                    ...profile,
                    id: profile.id || generateId(),
                    financialMonthStartDay: profile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY,
                    transactions: Array.isArray(profile.transactions) ? profile.transactions.map(tx => ({
                        ...tx,
                        id: tx.id || generateId(),
                        categoryId: tx.categoryId || 'cat_uncategorized',
                        isReimbursed: tx.isReimbursed || false,
                    })) : []
                }));
                state.activeProfileId = parsedData.activeProfileId;
                if (!getProfileById(state.activeProfileId) && state.activeProfileId !== 'all') {
                    state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
                }
                state.displayCurrency = parsedData.displayCurrency || DEFAULT_DISPLAY_CURRENCY;
                state.categories = Array.isArray(parsedData.categories) && parsedData.categories.length > 0
                                   ? parsedData.categories.map(cat => ({ ...cat, id: cat.id || generateId() }))
                                   : [...DEFAULT_CATEGORIES.map(c => ({...c}))];
                state.exchangeRates = parsedData.exchangeRates
                                   ? {
                                       base: parsedData.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base,
                                       rates: parsedData.exchangeRates.rates || { ...DEFAULT_EXCHANGE_RATES.rates },
                                       lastUpdated: parsedData.exchangeRates.lastUpdated || new Date().toISOString()
                                     }
                                   : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
                state.projectionDate = parsedData.projectionDate || null;
                // Load theme, ensure it's a valid one
                const loadedTheme = parsedData.currentTheme || DEFAULT_THEME;
                state.currentTheme = AVAILABLE_THEMES.some(t => t.value === loadedTheme) ? loadedTheme : DEFAULT_THEME;
                state.editingCategoryId = null;
                console.log("Data loaded successfully from localStorage:", state);
            } else {
                console.warn("Loaded data from localStorage is not in the expected format. Initializing with defaults.");
                initializeDefaultState();
            }
        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            initializeDefaultState();
        }
    } else {
        console.log("No data found in localStorage. Initializing with defaults.");
        initializeDefaultState();
    }
}

export function saveData() {
    try {
        // Create a slimmed-down version of state for saving, excluding transient UI states if any
        const stateToSave = {
            profiles: state.profiles,
            activeProfileId: state.activeProfileId,
            displayCurrency: state.displayCurrency,
            categories: state.categories,
            exchangeRates: state.exchangeRates,
            projectionDate: state.projectionDate,
            currentTheme: state.currentTheme, // Save current theme
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("Data saved to localStorage:", stateToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        alert("Error: Could not save data. Your browser's local storage might be full or disabled.");
    }
}

export function getState() {
    return JSON.parse(JSON.stringify(state));
}

export function updateState(key, value) {
    if (Object.prototype.hasOwnProperty.call(state, key)) { // Check if key is a direct property of state
        state[key] = value;
        console.log(`State updated: ${key} =`, value);
    } else {
        console.warn(`Attempted to update non-existent state key: ${key}`);
    }
}

export function replaceState(newState) {
    if (newState && Array.isArray(newState.profiles) &&
        typeof newState.activeProfileId !== 'undefined' &&
        typeof newState.displayCurrency !== 'undefined') {
        state.profiles = newState.profiles.map(p => ({
            ...p,
            id: p.id || generateId(),
            financialMonthStartDay: p.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY,
            transactions: Array.isArray(p.transactions) ? p.transactions.map(tx => ({
                ...tx,
                id: tx.id || generateId(),
                categoryId: tx.categoryId || 'cat_uncategorized',
                isReimbursed: tx.isReimbursed || false,
            })) : []
        }));
        state.activeProfileId = newState.activeProfileId;
        if (!getProfileById(state.activeProfileId) && state.activeProfileId !== 'all') {
            state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
        }
        state.displayCurrency = newState.displayCurrency || DEFAULT_DISPLAY_CURRENCY;
        state.categories = Array.isArray(newState.categories) && newState.categories.length > 0
                           ? newState.categories.map(c => ({ ...c, id: c.id || generateId() }))
                           : [...DEFAULT_CATEGORIES.map(c => ({...c}))];
        state.exchangeRates = newState.exchangeRates
                           ? {
                               base: newState.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base,
                               rates: newState.exchangeRates.rates || { ...DEFAULT_EXCHANGE_RATES.rates },
                               lastUpdated: newState.exchangeRates.lastUpdated || new Date().toISOString()
                             }
                           : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
        state.projectionDate = newState.projectionDate || null;
        const importedTheme = newState.currentTheme || DEFAULT_THEME;
        state.currentTheme = AVAILABLE_THEMES.some(t => t.value === importedTheme) ? importedTheme : DEFAULT_THEME;
        state.editingCategoryId = null;
        console.log("App state replaced by import:", state);
        return true;
    }
    console.error("Invalid import data structure for full app data.", newState);
    return false;
}

// --- Profile Management ---
export function addProfile(name, currency, financialMonthStartDay = DEFAULT_FINANCIAL_MONTH_START_DAY) {
    const p = {
        id: generateId(),
        name: name.trim(),
        currency,
        financialMonthStartDay: parseInt(financialMonthStartDay, 10) || DEFAULT_FINANCIAL_MONTH_START_DAY,
        transactions: []
    };
    state.profiles.push(p);
    state.activeProfileId = p.id;
    return p;
}

export function updateProfile(id, { name, currency, financialMonthStartDay }) {
    const i = state.profiles.findIndex(p => p.id === id);
    if (i !== -1) {
        if (name !== undefined) state.profiles[i].name = name.trim();
        if (currency !== undefined) state.profiles[i].currency = currency;
        if (financialMonthStartDay !== undefined) state.profiles[i].financialMonthStartDay = parseInt(financialMonthStartDay, 10);
        return state.profiles[i];
    }
    return null;
}

export function deleteProfile(id) {
    const i = state.profiles.findIndex(p => p.id === id);
    if (i !== -1) {
        state.profiles.splice(i, 1);
        if (state.activeProfileId === id) {
            state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
        }
        return true;
    }
    return false;
}

export function getProfileById(id) {
    return state.profiles.find(p => p.id === id);
}
export function getProfiles() { // Added to get all profiles, e.g. for checking length
    return state.profiles;
}

export function getActiveProfile() {
    if (state.activeProfileId === 'all' || !state.activeProfileId) return null;
    return getProfileById(state.activeProfileId);
}

// --- Transaction Management ---
export function addTransaction(profileId, { type, description, amount, date, categoryId, isReimbursed = false }) {
    const p = getProfileById(profileId);
    if (p) {
        const tx = {
            id: generateId(),
            type,
            description: description.trim(),
            amount: parseFloat(amount),
            date,
            categoryId: categoryId || 'cat_uncategorized',
            isReimbursed: type === 'outcome' ? isReimbursed : false,
        };
        p.transactions.push(tx);
        return tx;
    }
    return null;
}

export function updateTransaction(profileId, txId, { type, description, amount, date, categoryId, isReimbursed }) {
    const p = getProfileById(profileId);
    if (p) {
        const i = p.transactions.findIndex(t => t.id === txId);
        if (i !== -1) {
            const tx = p.transactions[i];
            if(type !== undefined) tx.type = type;
            if(description !== undefined) tx.description = description.trim();
            if(amount !== undefined) tx.amount = parseFloat(amount);
            if(date !== undefined) tx.date = date;
            if(categoryId !== undefined) tx.categoryId = categoryId || 'cat_uncategorized';
            if(isReimbursed !== undefined) tx.isReimbursed = tx.type === 'outcome' ? isReimbursed : false;
            return tx;
        }
    }
    return null;
}

export function deleteTransaction(profileId, txId) {
    const p = getProfileById(profileId);
    if (p) {
        const l = p.transactions.length;
        p.transactions = p.transactions.filter(t => t.id !== txId);
        return p.transactions.length < l;
    }
    return false;
}

// --- Category Management ---
export function getCategoryById(id) {
    return state.categories.find(c => c.id === id);
}

export function addCategory(name, type) {
    const tN = name.trim();
    const eC = state.categories.find(c => c.name.toLowerCase() === tN.toLowerCase() && c.type === type);
    if (eC) return null;
    const nC = { id: `cat_${generateId()}`, name: tN, type };
    state.categories.push(nC);
    return nC;
}

export function updateCategory(id, { name, type }) {
    const i = state.categories.findIndex(c => c.id === id);
    if (i === -1) return null;
    const tN = name.trim();
    const dE = state.categories.some(c =>
        c.id !== id &&
        c.name.toLowerCase() === tN.toLowerCase() &&
        c.type === type
    );
    if (dE) return null;
    if (name !== undefined && tN) state.categories[i].name = tN; // Check name !== undefined
    if (type !== undefined) state.categories[i].type = type;
    return state.categories[i];
}

export function deleteCategory(id) {
    if (id === 'cat_uncategorized') return false;
    const i = state.categories.findIndex(c => c.id === id);
    if (i !== -1) {
        state.categories.splice(i, 1);
        state.profiles.forEach(p => {
            p.transactions.forEach(tx => {
                if (tx.categoryId === id) {
                    tx.categoryId = 'cat_uncategorized';
                }
            });
        });
        return true;
    }
    return false;
}


// --- Exchange Rate Management ---
export function updateExchangeRates(newBaseCurrency, formRates) {
    const oldBase = state.exchangeRates.base;
    const oldRates = { ...state.exchangeRates.rates };
    const newCalculatedRates = {};

    if (newBaseCurrency === oldBase) {
        for (const currency in formRates) {
            if (Object.prototype.hasOwnProperty.call(formRates, currency)) {
                const rateValue = parseFloat(formRates[currency]);
                if (!isNaN(rateValue) && rateValue > 0) {
                    newCalculatedRates[currency] = rateValue;
                } else {
                    newCalculatedRates[currency] = oldRates[currency] !== undefined ? oldRates[currency] : 1;
                }
            }
        }
        newCalculatedRates[newBaseCurrency] = 1;
    } else {
        const newBaseToOldBaseRateFromForm = parseFloat(formRates[newBaseCurrency]);

        if (isNaN(newBaseToOldBaseRateFromForm) || newBaseToOldBaseRateFromForm <= 0) {
            console.error(`Invalid rate for the new base currency (${newBaseCurrency}) against the old base (${oldBase}). Cannot recalculate.`);
            alert(`Error: The rate for the new base currency (${newBaseCurrency}) is invalid in the form. It must be a positive number.`);
            return false;
        }
        
        Object.keys(CURRENCY_SYMBOLS).forEach(currencyCode => {
            const rateVsOldBase = parseFloat(formRates[currencyCode]);
            if (currencyCode === newBaseCurrency) {
                newCalculatedRates[currencyCode] = 1;
            } else if (!isNaN(rateVsOldBase) && rateVsOldBase > 0) {
                newCalculatedRates[currencyCode] = rateVsOldBase / newBaseToOldBaseRateFromForm;
            } else if (oldRates[currencyCode] !== undefined) {
                 newCalculatedRates[currencyCode] = oldRates[currencyCode] / newBaseToOldBaseRateFromForm;
                 console.warn(`Invalid or missing form rate for ${currencyCode} during base change. Used old rate for conversion.`);
            }
            else {
                newCalculatedRates[currencyCode] = 1 / newBaseToOldBaseRateFromForm;
                console.warn(`Rate for ${currencyCode} not found or invalid in form during base change, defaulted based on new base rate.`);
            }
        });
        newCalculatedRates[newBaseCurrency] = 1;
    }

    state.exchangeRates.base = newBaseCurrency;
    state.exchangeRates.rates = newCalculatedRates;
    state.exchangeRates.lastUpdated = new Date().toISOString();
    console.log("Exchange rates updated in state:", state.exchangeRates);
    // saveData(); // saveData is usually called by the handler function after this returns true
    return true;
}

export function replaceExchangeRates(importedRatesData) {
    if (importedRatesData && importedRatesData.base && importedRatesData.rates &&
        typeof importedRatesData.rates === 'object' && importedRatesData.lastUpdated) {

        for (const currency in importedRatesData.rates) {
            if (Object.prototype.hasOwnProperty.call(importedRatesData.rates, currency)) {
                if (parseFloat(importedRatesData.rates[currency]) <= 0 || isNaN(parseFloat(importedRatesData.rates[currency]))) {
                    console.error("Invalid rate value in imported exchange rates file for currency:", currency);
                    return false;
                }
            }
        }
        if (importedRatesData.rates[importedRatesData.base] !== 1) {
            console.warn(`Base currency ${importedRatesData.base} rate in imported file is not 1. Normalizing rates.`);
            const baseCorrectionFactor = importedRatesData.rates[importedRatesData.base];
            if (baseCorrectionFactor <= 0 || isNaN(baseCorrectionFactor)) {
                 console.error("Invalid base correction factor in imported rates."); return false;
            }
            for (const curr in importedRatesData.rates) {
                 if (Object.prototype.hasOwnProperty.call(importedRatesData.rates, curr)) {
                    importedRatesData.rates[curr] = importedRatesData.rates[curr] / baseCorrectionFactor;
                 }
            }
        }
        importedRatesData.rates[importedRatesData.base] = 1; // Ensure base is exactly 1 after normalization

        state.exchangeRates.base = importedRatesData.base;
        state.exchangeRates.rates = { ...importedRatesData.rates };
        state.exchangeRates.lastUpdated = importedRatesData.lastUpdated;
        console.log("Exchange rates replaced with imported data:", state.exchangeRates);
        // saveData(); // saveData is usually called by the handler function after this returns true
        return true;
    }
    console.error("Invalid data structure for replacing exchange rates.", importedRatesData);
    return false;
}

export function getExchangeRatesState() {
    return JSON.parse(JSON.stringify(state.exchangeRates));
}