// js/state/exchangeRateState.js
import { getAppState, updateAppState, saveAppState } from './appState.js';
import { CURRENCY_SYMBOLS, DEFAULT_EXCHANGE_RATES } from '../config.js';

/**
 * Retrieves the current exchange rates state.
 * @returns {object} The exchange rates object { base, rates, lastUpdated }.
 */
export function getExchangeRates() {
    return getAppState().exchangeRates;
}

/**
 * Updates exchange rates based on form input.
 * Handles recalculation if the base currency is changed.
 * @param {string} newBaseCurrency - The new base currency selected in the form.
 * @param {object} formRates - An object of rates from the form (currencyCode: rateValue).
 * @returns {boolean} True if rates were successfully updated, false otherwise.
 */
export function updateExchangeRates(newBaseCurrency, formRates) {
    const currentExchangeRates = getExchangeRates();
    const oldBase = currentExchangeRates.base;
    const oldRates = { ...currentExchangeRates.rates };
    const newCalculatedRates = {};

    if (newBaseCurrency === oldBase) {
        // Base currency hasn't changed, just update rates relative to the current base
        for (const currency in formRates) {
            if (Object.prototype.hasOwnProperty.call(formRates, currency)) {
                const rateValue = parseFloat(formRates[currency]);
                if (!isNaN(rateValue) && rateValue > 0) {
                    newCalculatedRates[currency] = rateValue;
                } else {
                    // Fallback to old rate if new one is invalid, or 1 if no old rate (should not happen for known currencies)
                    newCalculatedRates[currency] = oldRates[currency] !== undefined ? oldRates[currency] : 1;
                }
            }
        }
    } else {
        // Base currency has changed, recalculate all rates
        const newBaseToOldBaseRateFromForm = parseFloat(formRates[newBaseCurrency]);

        if (isNaN(newBaseToOldBaseRateFromForm) || newBaseToOldBaseRateFromForm <= 0) {
            console.error(`Invalid rate for the new base currency (${newBaseCurrency}) against the old base (${oldBase}). Cannot recalculate.`);
            alert(`Error: The rate for the new base currency (${newBaseCurrency}) is invalid. It must be a positive number when changing base.`);
            return false;
        }

        Object.keys(CURRENCY_SYMBOLS).forEach(currencyCode => {
            const rateVsOldBaseFromForm = parseFloat(formRates[currencyCode]);
            if (currencyCode === newBaseCurrency) {
                newCalculatedRates[currencyCode] = 1;
            } else if (!isNaN(rateVsOldBaseFromForm) && rateVsOldBaseFromForm > 0) {
                // Convert rate (vs old base) to rate (vs new base)
                newCalculatedRates[currencyCode] = rateVsOldBaseFromForm / newBaseToOldBaseRateFromForm;
            } else if (oldRates[currencyCode] !== undefined) {
                // Fallback to old rate if form rate is invalid/missing
                newCalculatedRates[currencyCode] = oldRates[currencyCode] / newBaseToOldBaseRateFromForm;
                console.warn(`Invalid or missing form rate for ${currencyCode} during base change. Used old rate for conversion.`);
            } else {
                // Fallback if currency is new and not in old rates (should ideally not happen if form is comprehensive)
                newCalculatedRates[currencyCode] = 1 / newBaseToOldBaseRateFromForm; // Simplistic fallback
                console.warn(`Rate for ${currencyCode} not found in old rates or form during base change.`);
            }
        });
    }
    newCalculatedRates[newBaseCurrency] = 1; // Ensure base is always 1

    const updatedExchangeRateState = {
        base: newBaseCurrency,
        rates: newCalculatedRates,
        lastUpdated: new Date().toISOString()
    };
    updateAppState('exchangeRates', updatedExchangeRateState);
    saveAppState();
    return true;
}

/**
 * Replaces the entire exchange rates object, typically from an imported file.
 * Validates and normalizes the imported data.
 * @param {object} importedRatesData - The exchange rates data to import ({ base, rates, lastUpdated }).
 * @returns {boolean} True if replacement was successful, false otherwise.
 */
export function replaceExchangeRates(importedRatesData) {
    if (importedRatesData && importedRatesData.base && importedRatesData.rates &&
        typeof importedRatesData.rates === 'object' && importedRatesData.lastUpdated) {

        // Validate rates: must be positive numbers
        for (const currency in importedRatesData.rates) {
            if (Object.prototype.hasOwnProperty.call(importedRatesData.rates, currency)) {
                const rate = parseFloat(importedRatesData.rates[currency]);
                if (isNaN(rate) || rate <= 0) {
                    console.error("Invalid rate value in imported exchange rates for currency:", currency);
                    alert(`Error: Imported rate for ${currency} is invalid. Rates must be positive numbers.`);
                    return false;
                }
            }
        }

        const normalizedRates = { ...importedRatesData.rates };
        const newBase = importedRatesData.base;

        // Ensure the base currency itself has a rate of 1
        if (normalizedRates[newBase] !== undefined && normalizedRates[newBase] !== 1) {
            console.warn(`Base currency ${newBase} rate in imported file is not 1. Normalizing all rates.`);
            const baseCorrectionFactor = normalizedRates[newBase];
            if (baseCorrectionFactor <= 0 || isNaN(baseCorrectionFactor)) {
                 console.error("Invalid base correction factor in imported rates."); return false;
            }
            for (const curr in normalizedRates) {
                 if (Object.prototype.hasOwnProperty.call(normalizedRates, curr)) {
                    normalizedRates[curr] = normalizedRates[curr] / baseCorrectionFactor;
                 }
            }
        }
        normalizedRates[newBase] = 1; // Explicitly set base to 1

        const newExchangeRateState = {
            base: newBase,
            rates: normalizedRates,
            lastUpdated: importedRatesData.lastUpdated
        };
        updateAppState('exchangeRates', newExchangeRateState);
        saveAppState();
        return true;
    }
    console.error("Invalid data structure for replacing exchange rates.", importedRatesData);
    alert("Import failed: Invalid structure for exchange rates file.");
    return false;
}