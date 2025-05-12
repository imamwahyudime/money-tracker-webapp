// js/state.js
import { STORAGE_KEY, DEFAULT_GLOBAL_CURRENCY } from './config.js';
import { generateId } from './utils.js';

/**
 * Manages the application's state, including profiles, transactions,
 * and interactions with localStorage.
 */

// The main application state object.
let state = {
    profiles: [], // Array of profile objects: { id, name, currency, transactions: [] }
                  // Transaction object: { id, type, description, amount, date }
    activeProfileId: 'all', // ID of the currently active profile, or 'all'
    editingProfileId: null, // ID of the profile currently being edited
    editingTransactionId: null, // ID of the transaction currently being edited
    globalDefaultCurrency: DEFAULT_GLOBAL_CURRENCY, // Default currency for new profiles
};

/**
 * Initializes the default state if no data is found in localStorage or if data is invalid.
 */
function initializeDefaultState() {
    state.profiles = [];
    state.activeProfileId = 'all'; // Default to 'all' view
    state.globalDefaultCurrency = DEFAULT_GLOBAL_CURRENCY;
    // Optionally, create a default "Personal" profile on first ever load
    // if (state.profiles.length === 0) {
    //     const personalProfileId = generateId();
    //     state.profiles.push({
    //         id: personalProfileId,
    //         name: "Personal",
    //         currency: state.globalDefaultCurrency,
    //         transactions: []
    //     });
    //     state.activeProfileId = personalProfileId;
    // }
    console.log("State initialized with defaults.");
}

/**
 * Loads application data from localStorage.
 * If no data is found or data is corrupted, it initializes with a default state.
 */
export function loadData() {
    console.log(`Attempting to load data from localStorage with key: ${STORAGE_KEY}`);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            // Basic validation of the loaded data structure
            if (parsedData && Array.isArray(parsedData.profiles) && typeof parsedData.activeProfileId !== 'undefined') {
                state.profiles = parsedData.profiles.map(profile => ({
                    ...profile,
                    // Ensure transactions array exists and is an array for each profile
                    transactions: Array.isArray(profile.transactions) ? profile.transactions : []
                }));
                state.activeProfileId = parsedData.activeProfileId;
                state.globalDefaultCurrency = parsedData.globalDefaultCurrency || DEFAULT_GLOBAL_CURRENCY;
                console.log("Data loaded successfully from localStorage:", state);
            } else {
                console.warn("Loaded data from localStorage is not in the expected format. Initializing with defaults.");
                initializeDefaultState();
            }
        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            initializeDefaultState(); // Fallback to default state on parsing error
        }
    } else {
        console.log("No data found in localStorage. Initializing with defaults.");
        initializeDefaultState();
    }
}

/**
 * Saves the current application state to localStorage.
 */
export function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log("Data saved to localStorage:", state);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        // Potentially notify the user if storage is full or disabled
        alert("Error: Could not save data. Your browser's local storage might be full or disabled.");
    }
}

/**
 * Returns a copy of the current state.
 * @returns {object} The current application state.
 */
export function getState() {
    // Return a deep copy if complex mutations are expected elsewhere,
    // for now, a shallow copy of the main object is fine as sub-objects are managed via specific functions.
    return { ...state };
}

/**
 * Updates a specific part of the state.
 * @param {string} key - The top-level key in the state object to update.
 * @param {*} value - The new value for the key.
 */
export function updateState(key, value) {
    if (key in state) {
        state[key] = value;
        console.log(`State updated: ${key} =`, value);
    } else {
        console.warn(`Attempted to update non-existent state key: ${key}`);
    }
}


// --- Profile Specific State Functions ---

/**
 * Adds a new profile to the state.
 * @param {string} name - The name of the new profile.
 * @param {string} currency - The currency for the new profile.
 * @returns {object} The newly created profile object.
 */
export function addProfile(name, currency) {
    const newProfile = {
        id: generateId(),
        name: name,
        currency: currency,
        transactions: []
    };
    state.profiles.push(newProfile);
    state.activeProfileId = newProfile.id; // Set new profile as active
    console.log("New profile added to state:", newProfile);
    return newProfile;
}

/**
 * Updates an existing profile in the state.
 * @param {string} profileId - The ID of the profile to update.
 * @param {object} updatedData - An object containing { name, currency } to update.
 * @returns {object | null} The updated profile object or null if not found.
 */
export function updateProfile(profileId, { name, currency }) {
    const profileIndex = state.profiles.findIndex(p => p.id === profileId);
    if (profileIndex !== -1) {
        if (name) state.profiles[profileIndex].name = name;
        if (currency) state.profiles[profileIndex].currency = currency;
        console.log("Profile updated in state:", state.profiles[profileIndex]);
        return state.profiles[profileIndex];
    }
    console.warn(`Profile with ID ${profileId} not found for update.`);
    return null;
}

/**
 * Gets a profile by its ID.
 * @param {string} profileId - The ID of the profile.
 * @returns {object | undefined} The profile object or undefined if not found.
 */
export function getProfileById(profileId) {
    return state.profiles.find(p => p.id === profileId);
}

/**
 * Gets the currently active profile object.
 * Returns null if activeProfileId is 'all' or profile not found.
 * @returns {object | null} The active profile object or null.
 */
export function getActiveProfile() {
    if (state.activeProfileId === 'all' || !state.activeProfileId) {
        return null;
    }
    return getProfileById(state.activeProfileId);
}


// --- Transaction Specific State Functions ---

/**
 * Adds a transaction to a specific profile.
 * @param {string} profileId - The ID of the profile to add the transaction to.
 * @param {object} transactionData - The transaction data { type, description, amount, date }.
 * @returns {object | null} The new transaction object or null if profile not found.
 */
export function addTransaction(profileId, { type, description, amount, date }) {
    const profile = getProfileById(profileId);
    if (profile) {
        const newTransaction = {
            id: generateId(),
            type,
            description,
            amount: parseFloat(amount), // Ensure amount is a number
            date
        };
        profile.transactions.push(newTransaction);
        console.log("New transaction added to profile:", profile.name, newTransaction);
        return newTransaction;
    }
    console.warn(`Profile with ID ${profileId} not found for adding transaction.`);
    return null;
}

/**
 * Updates an existing transaction within a specific profile.
 * @param {string} profileId - The ID of the profile containing the transaction.
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {object} updatedData - The transaction data to update { type, description, amount, date }.
 * @returns {object | null} The updated transaction object or null if not found.
 */
export function updateTransaction(profileId, transactionId, { type, description, amount, date }) {
    const profile = getProfileById(profileId);
    if (profile) {
        const transactionIndex = profile.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
            const transaction = profile.transactions[transactionIndex];
            transaction.type = type;
            transaction.description = description;
            transaction.amount = parseFloat(amount);
            transaction.date = date;
            console.log("Transaction updated:", transaction);
            return transaction;
        }
        console.warn(`Transaction with ID ${transactionId} not found in profile ${profileId}.`);
    } else {
        console.warn(`Profile with ID ${profileId} not found for updating transaction.`);
    }
    return null;
}

/**
 * Deletes a transaction from a specific profile.
 * @param {string} profileId - The ID of the profile.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteTransaction(profileId, transactionId) {
    const profile = getProfileById(profileId);
    if (profile) {
        const initialLength = profile.transactions.length;
        profile.transactions = profile.transactions.filter(t => t.id !== transactionId);
        if (profile.transactions.length < initialLength) {
            console.log(`Transaction ${transactionId} deleted from profile ${profileId}.`);
            return true;
        }
        console.warn(`Transaction ${transactionId} not found for deletion in profile ${profileId}.`);
    } else {
        console.warn(`Profile with ID ${profileId} not found for deleting transaction.`);
    }
    return false;
}

