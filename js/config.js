// js/config.js

/**
 * Configuration constants for the Money Tracker application.
 */

// Key used for storing data in localStorage.
// Incrementing the version number in the key can help manage data migrations
// if the data structure changes significantly in future updates.
export const STORAGE_KEY = 'moneyTrackerData_v2.1_modular'; // Updated version for modular structure

// Default currency symbols for formatting.
// This can be expanded or moved to a more dynamic localization solution later.
export const CURRENCY_SYMBOLS = {
    IDR: 'Rp',
    USD: '$',
    JPY: '¥',
    EUR: '€',
    SGD: 'S$'
};

// Default global currency if none is set or loaded.
export const DEFAULT_GLOBAL_CURRENCY = 'IDR';
