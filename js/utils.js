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
 * Formats a date string or Date object into a more readable format (Year-Month-Day, Time).
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
        // Use toLocaleString for a more robust localized format, then customize if needed
        // Example: "5/14/2025, 8:30 AM" (depends on locale)
        // Or specific parts:
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${year}-${month}-${day}, ${time}`;
    } catch (error) {
        console.error("Error formatting date in formatDateTime:", error, "Input:", dateInput);
        return 'Error in Date';
    }
}

/**
 * Formats a date string or Date object for HTML date or datetime-local input fields.
 * @param {string | Date} dateInput - The date string or Date object.
 * @param {boolean} includeTime - Whether to format for datetime-local (true) or date (false).
 * @returns {string} Formatted string (YYYY-MM-DD or YYYY-MM-DDTHH:mm).
 */
export function formatDateForInput(dateInput, includeTime = false) {
    if (!dateInput) return '';
    try {
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime())) {
            console.warn(`Invalid dateInput provided to formatDateForInput: ${dateInput}`);
            return '';
        }

        // Adjust for local timezone offset to display correctly in HTML input
        const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
        
        if (includeTime) {
            return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
        } else {
            return localDate.toISOString().slice(0, 10); // YYYY-MM-DD
        }
    } catch (error) {
        console.error("Error formatting date for input:", error, "Input:", dateInput);
        return '';
    }
}

/**
 * Creates a user-friendly string representation of a date range.
 * Example: "May 1, 2024 - May 15, 2024" or "Until May 15, 2024"
 * @param {Date | string | null} startDate - The start date of the range.
 * @param {Date | string | null} endDate - The end date of the range.
 * @returns {string} A formatted date range string.
 */
export function getFormattedDateRange(startDate, endDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    let startDateObj = startDate ? new Date(startDate) : null;
    let endDateObj = endDate ? new Date(endDate) : null;

    if (startDateObj && isNaN(startDateObj.getTime())) startDateObj = null;
    if (endDateObj && isNaN(endDateObj.getTime())) endDateObj = null;
    
    // Get today's date at the very beginning of the day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);


    if (startDateObj && endDateObj) {
        // If end date is effectively "today" (based on projection not being set or set to today)
        // and start date is the first of the current month, display "This Month (Day X - Today)"
        const isEndDateToday = endDateObj.getFullYear() === endOfToday.getFullYear() &&
                               endDateObj.getMonth() === endOfToday.getMonth() &&
                               endDateObj.getDate() === endOfToday.getDate();

        const isStartDateCurrentFinancialMonth = startDateObj <= today && 
                                              (startDateObj.getMonth() === today.getMonth() || startDateObj.getMonth() === (today.getMonth()-1+12)%12 );


        if (isEndDateToday && isStartDateCurrentFinancialMonth && startDateObj <= endDateObj) {
             // Check if it's the *current* financial period ending today
            const startStr = startDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
            return `Current Period: ${startStr} - Today`;
        }
        // If both dates are the same, show "On [Date]"
        if (startDateObj.toDateString() === endDateObj.toDateString()) {
            return `On ${startDateObj.toLocaleDateString(undefined, options)}`;
        }
        // Default range string
        return `${startDateObj.toLocaleDateString(undefined, options)} - ${endDateObj.toLocaleDateString(undefined, options)}`;
    } else if (endDateObj) {
        // If only end date is present (implies from beginning of time or a default start)
        return `Until ${endDateObj.toLocaleDateString(undefined, options)}`;
    } else if (startDateObj) {
        // If only start date is present (implies until "now" or indefinitely)
        return `From ${startDateObj.toLocaleDateString(undefined, options)} - Present`;
    } else {
        // If no dates, imply all time or default state (e.g., "Current Month" if that's the default logic)
        // For now, if getActiveDateWindow returns null for both, it means something is off or it's "all time"
        // Let's return a generic "All Time" or rely on a default like "Current Month"
        // This case should ideally be handled by getActiveDateWindow providing defaults
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${firstDayCurrentMonth.toLocaleDateString(undefined, options)} - ${now.toLocaleDateString(undefined, options)} (Default)`;
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

    if (!rates[fromCurrency] || !rates[toCurrency] /* removed !rates[base] as base itself might not be in rates if it's not a transaction currency */) {
        console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency} using base ${base}. Current rates:`, rates, `Returning original amount.`);
        return amount;
    }
     // Ensure base currency itself has a rate of 1 against itself if it's not explicitly in rates
    const effectiveRates = {...rates};
    if (effectiveRates[base] === undefined) {
        // This can happen if base is USD, but USD is not in the `rates` object because all rates are USD-relative.
        // It's implied that 1 USD = 1 USD.
        effectiveRates[base] = 1;
    }
     if (!effectiveRates[fromCurrency] || !effectiveRates[toCurrency]) {
        console.warn(`Effective exchange rate not found for ${fromCurrency} or ${toCurrency} using base ${base}. Returning original amount.`);
        return amount;
    }


    // 1. Convert 'amount' from 'fromCurrency' to 'base' currency
    let amountInBase;
    if (fromCurrency === base) {
        amountInBase = amount;
    } else {
        // rates[fromCurrency] is how many 'fromCurrency' units equal 1 'base' unit.
        // So, to get base units, we divide.
        amountInBase = amount / effectiveRates[fromCurrency];
    }

    // 2. Convert 'amountInBase' from 'base' currency to 'toCurrency'
    let finalAmount;
    if (toCurrency === base) {
        finalAmount = amountInBase;
    } else {
        // rates[toCurrency] is how many 'toCurrency' units equal 1 'base' unit.
        // So, to get 'toCurrency' units from base, we multiply.
        finalAmount = amountInBase * effectiveRates[toCurrency];
    }

    // console.log(`Converted ${amount} ${fromCurrency} to ${finalAmount.toFixed(2)} ${toCurrency}`);
    return finalAmount;
}