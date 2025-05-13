// js/utils.js
import { CURRENCY_SYMBOLS } from './config.js';

/**
 * Generates a unique ID.
 * @returns {string} A unique identifier.
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Formats a numeric amount as a currency string.
 * @param {number} amount - The numeric amount to format.
 * @param {string} currencyCode - The currency code (e.g., 'IDR', 'USD').
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(amount, currencyCode) {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode; 
    const options = {
        minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
        maximumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    };
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        console.warn(`Invalid amount provided to formatCurrency: ${amount}`);
        return `${symbol}0`; 
    }
    return `${symbol}${numericAmount.toLocaleString('en-US', options)}`;
}

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted date and time string.
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime())) { 
             console.warn(`Invalid dateInput provided to formatDateTime: ${dateInput}`);
            return 'Invalid Date';
        }
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${year}-${month}-${day}, ${time}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Error in Date';
    }
}

/**
 * Converts an amount from one currency to another using provided exchange rates.
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The currency code of the amount.
 * @param {string} toCurrency - The target currency code.
 * @param {object} exchangeRateData - The exchange rates object { base: 'USD', rates: { USD: 1, IDR: 15000, ... } }.
 * @returns {number} The converted amount, or the original amount if conversion is not possible.
 */
export function convertCurrency(amount, fromCurrency, toCurrency, exchangeRateData) {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    const { base, rates } = exchangeRateData;

    if (!rates[fromCurrency] || !rates[toCurrency] || !rates[base]) {
        console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency} or base ${base}. Returning original amount.`);
        return amount; // Or handle error appropriately, e.g., throw error or return NaN
    }

    // 1. Convert 'amount' from 'fromCurrency' to 'base' currency
    let amountInBase;
    if (fromCurrency === base) {
        amountInBase = amount;
    } else {
        // rates[fromCurrency] is how many 'fromCurrency' units equal 1 'base' unit.
        // So, to get base units, we divide.
        amountInBase = amount / rates[fromCurrency];
    }

    // 2. Convert 'amountInBase' from 'base' currency to 'toCurrency'
    let finalAmount;
    if (toCurrency === base) {
        finalAmount = amountInBase;
    } else {
        // rates[toCurrency] is how many 'toCurrency' units equal 1 'base' unit.
        // So, to get 'toCurrency' units from base, we multiply.
        finalAmount = amountInBase * rates[toCurrency];
    }
    
    // console.log(`Converted ${amount} ${fromCurrency} to ${finalAmount.toFixed(2)} ${toCurrency}`);
    return finalAmount;
}
