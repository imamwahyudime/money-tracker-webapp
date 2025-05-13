// js/state.js
import { STORAGE_KEY, DEFAULT_DISPLAY_CURRENCY, DEFAULT_CATEGORIES, DEFAULT_EXCHANGE_RATES, CURRENCY_SYMBOLS } from './config.js';
import { generateId } from './utils.js';

let state = {
    profiles: [], 
    activeProfileId: 'all', 
    editingProfileId: null, 
    editingTransactionId: null, 
    displayCurrency: DEFAULT_DISPLAY_CURRENCY, 
    categories: [...DEFAULT_CATEGORIES], 
    editingCategoryId: null,
    exchangeRates: { ...DEFAULT_EXCHANGE_RATES } 
};

function initializeDefaultState() {
    state.profiles = [];
    state.activeProfileId = 'all'; 
    state.displayCurrency = DEFAULT_DISPLAY_CURRENCY;
    state.categories = [...DEFAULT_CATEGORIES]; 
    state.editingCategoryId = null;
    state.exchangeRates = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES)); 
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
                    transactions: Array.isArray(profile.transactions) ? profile.transactions.map(tx => ({
                        ...tx,
                        id: tx.id || generateId(),
                        categoryId: tx.categoryId || 'cat_uncategorized' 
                    })) : []
                }));
                state.activeProfileId = parsedData.activeProfileId;
                if (!getProfileById(state.activeProfileId) && state.activeProfileId !== 'all') {
                    state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
                }
                state.displayCurrency = parsedData.displayCurrency || DEFAULT_DISPLAY_CURRENCY;
                state.categories = Array.isArray(parsedData.categories) && parsedData.categories.length > 0 
                                   ? parsedData.categories.map(cat => ({ ...cat, id: cat.id || generateId() })) 
                                   : [...DEFAULT_CATEGORIES]; 
                state.exchangeRates = parsedData.exchangeRates 
                                   ? { 
                                       base: parsedData.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base,
                                       rates: parsedData.exchangeRates.rates || { ...DEFAULT_EXCHANGE_RATES.rates },
                                       lastUpdated: parsedData.exchangeRates.lastUpdated || new Date().toISOString()
                                     }
                                   : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
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
        const stateToSave = { 
            profiles: state.profiles,
            activeProfileId: state.activeProfileId,
            displayCurrency: state.displayCurrency,
            categories: state.categories,
            exchangeRates: state.exchangeRates 
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
    if (key in state) {
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
        state.profiles = newState.profiles.map(p => ({...p, id: p.id || generateId(), transactions: Array.isArray(p.transactions) ? p.transactions.map(tx => ({...tx, id: tx.id||generateId(), categoryId: tx.categoryId||'cat_uncategorized'})) : [] }));
        state.activeProfileId = newState.activeProfileId;
        if (!getProfileById(state.activeProfileId) && state.activeProfileId !== 'all') { state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all'; }
        state.displayCurrency = newState.displayCurrency || DEFAULT_DISPLAY_CURRENCY;
        state.categories = Array.isArray(newState.categories) && newState.categories.length > 0 ? newState.categories.map(c => ({...c, id: c.id||generateId()})) : [...DEFAULT_CATEGORIES];
        state.exchangeRates = newState.exchangeRates ? { base: newState.exchangeRates.base || DEFAULT_EXCHANGE_RATES.base, rates: newState.exchangeRates.rates || {...DEFAULT_EXCHANGE_RATES.rates}, lastUpdated: newState.exchangeRates.lastUpdated || new Date().toISOString() } : JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_RATES));
        state.editingCategoryId = null; 
        console.log("App state replaced by import:", state); return true;
    } console.error("Invalid import data structure for full app data.", newState); return false;
}

// --- Profile Management (no changes) ---
export function addProfile(name, currency) { const p = { id: generateId(), name: name.trim(), currency, transactions: [] }; state.profiles.push(p); state.activeProfileId = p.id; return p; }
export function updateProfile(id, { name, currency }) { const i = state.profiles.findIndex(p => p.id === id); if (i!==-1) { if(name) state.profiles[i].name = name.trim(); if(currency) state.profiles[i].currency = currency; return state.profiles[i]; } return null; }
export function deleteProfile(id) { const i = state.profiles.findIndex(p => p.id === id); if (i!==-1) { state.profiles.splice(i,1); if(state.activeProfileId === id) state.activeProfileId = state.profiles.length>0 ? state.profiles[0].id : 'all'; return true; } return false; }
export function getProfileById(id) { return state.profiles.find(p => p.id === id); }
export function getActiveProfile() { if (state.activeProfileId === 'all' || !state.activeProfileId) return null; return getProfileById(state.activeProfileId); }

// --- Transaction Management (no changes) ---
export function addTransaction(profileId, { type, description, amount, date, categoryId }) { const p = getProfileById(profileId); if(p){ const tx = {id:generateId(),type,description:description.trim(),amount:parseFloat(amount),date,categoryId:categoryId||'cat_uncategorized'}; p.transactions.push(tx); return tx; } return null; }
export function updateTransaction(profileId, txId, { type, description, amount, date, categoryId }) { const p = getProfileById(profileId); if(p){ const i = p.transactions.findIndex(t=>t.id===txId); if(i!==-1){ const tx=p.transactions[i]; tx.type=type;tx.description=description.trim();tx.amount=parseFloat(amount);tx.date=date;tx.categoryId=categoryId||'cat_uncategorized'; return tx; }} return null; }
export function deleteTransaction(profileId, txId) { const p = getProfileById(profileId); if(p){ const l=p.transactions.length; p.transactions=p.transactions.filter(t=>t.id!==txId); return p.transactions.length<l; } return false; }

// --- Category Management (no changes) ---
export function getCategoryById(id) { return state.categories.find(c => c.id === id); }
export function addCategory(name, type) { const tN=name.trim(); const eC=state.categories.find(c=>c.name.toLowerCase()===tN.toLowerCase()&&c.type===type); if(eC)return null; const nC={id:`cat_${generateId()}`,name:tN,type}; state.categories.push(nC); return nC; }
export function updateCategory(id, { name, type }) { const i=state.categories.findIndex(c=>c.id===id); if(i===-1)return null; const tN=name.trim(); const dE=state.categories.some(c=>c.id!==id&&c.name.toLowerCase()===tN.toLowerCase()&&c.type===type); if(dE)return null; if(tN)state.categories[i].name=tN; if(type)state.categories[i].type=type; return state.categories[i]; }
export function deleteCategory(id) { if(id==='cat_uncategorized')return false; const i=state.categories.findIndex(c=>c.id===id); if(i!==-1){ state.categories.splice(i,1); state.profiles.forEach(p=>p.transactions.forEach(tx=>{if(tx.categoryId===id)tx.categoryId='cat_uncategorized';})); return true; } return false; }

// --- Exchange Rate Management ---
/**
 * Updates the exchange rates, potentially recalculating if the base currency changes.
 * @param {string} newBaseCurrency - The selected new base currency.
 * @param {object} formRates - Rates entered in the form, relative to the *old* base currency if base changed, or current base if not.
 */
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
        // Base currency HAS changed. Recalculate all rates relative to the new base.
        // The `formRates` are the rates of various currencies against the `oldBase`.
        const newBaseToOldBaseRate = parseFloat(formRates[newBaseCurrency]);

        if (isNaN(newBaseToOldBaseRate) || newBaseToOldBaseRate <= 0) {
            console.error(`Invalid rate for the new base currency (${newBaseCurrency}) against the old base (${oldBase}). Cannot recalculate.`);
            alert(`Error: The rate for the new base currency (${newBaseCurrency}) is invalid. It must be a positive number representing how many units of ${newBaseCurrency} equal 1 unit of ${oldBase}.`);
            return false; 
        }

        for (const currencyCode in oldRates) { // Iterate through all known currencies based on old rates
            if (Object.prototype.hasOwnProperty.call(oldRates, currencyCode)) {
                 // oldRates[currencyCode] is units of currencyCode per 1 oldBase
                newCalculatedRates[currencyCode] = oldRates[currencyCode] / newBaseToOldBaseRate;
            }
        }
        newCalculatedRates[newBaseCurrency] = 1; 
        
        // Ensure all app-supported currencies are in the new rates object
        Object.keys(CURRENCY_SYMBOLS).forEach(appCurrency => {
            if (!newCalculatedRates.hasOwnProperty(appCurrency)) {
                // This situation implies a currency was in CURRENCY_SYMBOLS but not in oldRates.
                // Its rate against the newBase needs to be established.
                // If it was the oldBase, its rate is 1 / newBaseToOldBaseRate.
                if (appCurrency === oldBase) {
                    newCalculatedRates[appCurrency] = 1 / newBaseToOldBaseRate;
                } else {
                    // For other currencies not in oldRates, we can't directly calculate.
                    // This might happen if CURRENCY_SYMBOLS has more currencies than initially in rates.
                    // We could try to find its rate in formRates (against oldBase) and convert.
                    if (formRates[appCurrency] !== undefined) {
                        const rateVsOldBase = parseFloat(formRates[appCurrency]);
                        if (!isNaN(rateVsOldBase) && rateVsOldBase > 0) {
                            newCalculatedRates[appCurrency] = rateVsOldBase / newBaseToOldBaseRate;
                        } else {
                             newCalculatedRates[appCurrency] = 1; // Default if no other info
                             console.warn(`Rate for ${appCurrency} (not in old rates) could not be determined from form, defaulted to 1 vs new base.`);
                        }
                    } else {
                        newCalculatedRates[appCurrency] = 1; // Default if truly missing
                        console.warn(`Rate for ${appCurrency} not found after base change, defaulted to 1 vs new base.`);
                    }
                }
            }
        });
    }

    state.exchangeRates.base = newBaseCurrency;
    state.exchangeRates.rates = newCalculatedRates;
    state.exchangeRates.lastUpdated = new Date().toISOString();
    console.log("Exchange rates updated in state:", state.exchangeRates);
    saveData(); 
    return true;
}

/**
 * Replaces only the exchangeRates part of the state. (New)
 * Used for importing dedicated exchange rate files.
 * @param {object} importedRatesData - The exchange rates object { base, rates, lastUpdated }.
 * @returns {boolean} True if successful, false otherwise.
 */
export function replaceExchangeRates(importedRatesData) {
    if (importedRatesData && importedRatesData.base && importedRatesData.rates && 
        typeof importedRatesData.rates === 'object' && importedRatesData.lastUpdated) {
        
        // Validate that all rates are positive numbers
        for (const currency in importedRatesData.rates) {
            if (parseFloat(importedRatesData.rates[currency]) <= 0 || isNaN(parseFloat(importedRatesData.rates[currency]))) {
                console.error("Invalid rate value in imported exchange rates file for currency:", currency);
                return false;
            }
        }
        // Ensure base currency is in rates and is 1
        if (importedRatesData.rates[importedRatesData.base] !== 1) {
            console.warn(`Base currency ${importedRatesData.base} rate in imported file is not 1. Adjusting.`);
            importedRatesData.rates[importedRatesData.base] = 1;
        }

        state.exchangeRates.base = importedRatesData.base;
        state.exchangeRates.rates = { ...importedRatesData.rates }; // Make a copy
        state.exchangeRates.lastUpdated = importedRatesData.lastUpdated;
        console.log("Exchange rates replaced with imported data:", state.exchangeRates);
        saveData();
        return true;
    }
    console.error("Invalid data structure for replacing exchange rates.", importedRatesData);
    return false;
}

/**
 * Gets only the exchangeRates part of the state. (New)
 * Used for exporting dedicated exchange rate files.
 * @returns {object} The exchangeRates object.
 */
export function getExchangeRatesState() {
    return JSON.parse(JSON.stringify(state.exchangeRates));
}
