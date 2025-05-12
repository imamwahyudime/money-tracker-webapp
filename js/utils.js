// js/utils.js
import { CURRENCY_SYMBOLS } from './config.js';

/**
 * Generates a unique ID.
 * Combines a timestamp with a random string for better uniqueness.
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
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode; // Fallback to code if symbol unknown

    // Options for toLocaleString to control decimal places
    const options = {
        // For IDR, typically no decimal places are shown. For others, 2 decimal places.
        minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
        maximumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    };

    // Ensure amount is a number before formatting
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        console.warn(`Invalid amount provided to formatCurrency: ${amount}`);
        return `${symbol}0`; // Or some other error indicator like 'N/A'
    }

    return `${symbol}${numericAmount.toLocaleString('en-US', options)}`;
}

/**
 * Formats a date string or Date object into a more readable format.
 * Example: "2023-10-27, 02:30 PM"
 * @param {string | Date} dateInput - The date string (parsable by new Date()) or Date object.
 * @returns {string} Formatted date and time string.
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime())) { // Check if date is valid
             console.warn(`Invalid dateInput provided to formatDateTime: ${dateInput}`);
            return 'Invalid Date';
        }
        // Format: YYYY-MM-DD, HH:MM AM/PM
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
