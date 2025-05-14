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
 * Adjusts for local timezone offset to display correctly in HTML input.
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

        // Create a new date object that represents the local time
        // by subtracting the timezone offset. This ensures that when
        // toISOString() is called (which outputs UTC), the parts of
        // the string (year, month, day, time) match the user's local date/time.
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);


    if (startDateObj && endDateObj) {
        const isEndDateToday = endDateObj.getFullYear() === endOfToday.getFullYear() &&
                               endDateObj.getMonth() === endOfToday.getMonth() &&
                               endDateObj.getDate() === endOfToday.getDate();

        const isStartDateCurrentFinancialMonth = startDateObj <= today &&
                                              (startDateObj.getMonth() === today.getMonth() || startDateObj.getMonth() === (today.getMonth()-1+12)%12 );


        if (isEndDateToday && isStartDateCurrentFinancialMonth && startDateObj <= endDateObj) {
            const startStr = startDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
            return `Current Period: ${startStr} - Today`;
        }
        if (startDateObj.toDateString() === endDateObj.toDateString()) {
            return `On ${startDateObj.toLocaleDateString(undefined, options)}`;
        }
        return `${startDateObj.toLocaleDateString(undefined, options)} - ${endDateObj.toLocaleDateString(undefined, options)}`;
    } else if (endDateObj) {
        return `Until ${endDateObj.toLocaleDateString(undefined, options)}`;
    } else if (startDateObj) {
        return `From ${startDateObj.toLocaleDateString(undefined, options)} - Present`;
    } else {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${firstDayCurrentMonth.toLocaleDateString(undefined, options)} - ${now.toLocaleDateString(undefined, options)} (Default Range)`;
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

    if (!rates) {
        console.warn(`Exchange rates data is missing. Cannot convert. Returning original amount.`);
        return amount;
    }

    const effectiveRates = { ...rates };
    if (effectiveRates[base] === undefined) { // Ensure base currency has a rate (implicitly 1 if it's the base)
        effectiveRates[base] = 1;
    }

    if (!effectiveRates[fromCurrency] || !effectiveRates[toCurrency]) {
        console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency} using base ${base}. Rates:`, effectiveRates, `Returning original amount.`);
        return amount;
    }

    let amountInBase;
    if (fromCurrency === base) {
        amountInBase = amount;
    } else {
        amountInBase = amount / effectiveRates[fromCurrency];
    }

    let finalAmount;
    if (toCurrency === base) {
        finalAmount = amountInBase;
    } else {
        finalAmount = amountInBase * effectiveRates[toCurrency];
    }
    return finalAmount;
}