// js/state.js
import { STORAGE_KEY, DEFAULT_GLOBAL_CURRENCY, DEFAULT_CATEGORIES } from './config.js';
import { generateId } from './utils.js';

let state = {
    profiles: [], 
    activeProfileId: 'all', 
    editingProfileId: null, 
    editingTransactionId: null, 
    globalDefaultCurrency: DEFAULT_GLOBAL_CURRENCY,
    categories: DEFAULT_CATEGORIES,
    editingCategoryId: null // New: Track category being edited
};

function initializeDefaultState() {
    state.profiles = [];
    state.activeProfileId = 'all'; 
    state.globalDefaultCurrency = DEFAULT_GLOBAL_CURRENCY;
    state.categories = [...DEFAULT_CATEGORIES]; // Use spread to ensure it's a new array
    state.editingCategoryId = null;
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
                state.globalDefaultCurrency = parsedData.globalDefaultCurrency || DEFAULT_GLOBAL_CURRENCY;
                state.categories = Array.isArray(parsedData.categories) && parsedData.categories.length > 0 
                                   ? parsedData.categories.map(cat => ({ ...cat, id: cat.id || generateId() })) // Ensure category IDs exist
                                   : [...DEFAULT_CATEGORIES]; // Use spread for default
                state.editingCategoryId = null; // Reset editing state on load
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
        // Create a state object without the editing IDs for saving
        const stateToSave = { ...state };
        delete stateToSave.editingCategoryId; 
        delete stateToSave.editingProfileId;
        delete stateToSave.editingTransactionId;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("Data saved to localStorage:", stateToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        alert("Error: Could not save data. Your browser's local storage might be full or disabled.");
    }
}

export function getState() {
    // Return a deep copy to prevent accidental modification of the state object elsewhere
    // Although currently mutations are handled via specific functions, this is safer.
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
        typeof newState.globalDefaultCurrency !== 'undefined') {
        
        state.profiles = newState.profiles.map(profile => ({
            ...profile,
            id: profile.id || generateId(), 
            transactions: Array.isArray(profile.transactions) ? profile.transactions.map(tx => ({
                ...tx,
                id: tx.id || generateId(),
                categoryId: tx.categoryId || 'cat_uncategorized' 
            })) : []
        }));
        state.activeProfileId = newState.activeProfileId;
        if (!getProfileById(state.activeProfileId) && state.activeProfileId !== 'all') {
            state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
        }
        state.globalDefaultCurrency = newState.globalDefaultCurrency;
        state.categories = Array.isArray(newState.categories) && newState.categories.length > 0
                           ? newState.categories.map(cat => ({ ...cat, id: cat.id || generateId() }))
                           : [...DEFAULT_CATEGORIES];
        state.editingCategoryId = null; // Reset editing state
        
        console.log("Application state replaced with imported data:", state);
        return true;
    }
    console.error("Invalid data structure for state replacement.", newState);
    return false;
}

// --- Profile Management ---
export function addProfile(name, currency) { /* ... (no changes) ... */ 
    const newProfile = { id: generateId(), name, currency, transactions: [] };
    state.profiles.push(newProfile);
    state.activeProfileId = newProfile.id; 
    return newProfile;
}
export function updateProfile(profileId, { name, currency }) { /* ... (no changes) ... */ 
    const profileIndex = state.profiles.findIndex(p => p.id === profileId);
    if (profileIndex !== -1) {
        if (name) state.profiles[profileIndex].name = name;
        if (currency) state.profiles[profileIndex].currency = currency;
        return state.profiles[profileIndex];
    } return null;
}
export function deleteProfile(profileId) { /* ... (no changes) ... */ 
    const profileIndex = state.profiles.findIndex(p => p.id === profileId);
    if (profileIndex !== -1) {
        state.profiles.splice(profileIndex, 1);
        if (state.activeProfileId === profileId) {
            state.activeProfileId = state.profiles.length > 0 ? state.profiles[0].id : 'all';
        } return true;
    } return false;
}
export function getProfileById(profileId) { /* ... (no changes) ... */ 
    return state.profiles.find(p => p.id === profileId);
}
export function getActiveProfile() { /* ... (no changes) ... */ 
    if (state.activeProfileId === 'all' || !state.activeProfileId) return null;
    return getProfileById(state.activeProfileId);
}

// --- Transaction Management ---
export function addTransaction(profileId, { type, description, amount, date, categoryId }) { /* ... (no changes) ... */ 
    const profile = getProfileById(profileId);
    if (profile) {
        const newTransaction = { id: generateId(), type, description, amount: parseFloat(amount), date, categoryId: categoryId || 'cat_uncategorized' };
        profile.transactions.push(newTransaction);
        return newTransaction;
    } return null;
}
export function updateTransaction(profileId, transactionId, { type, description, amount, date, categoryId }) { /* ... (no changes) ... */ 
    const profile = getProfileById(profileId);
    if (profile) {
        const transactionIndex = profile.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
            const transaction = profile.transactions[transactionIndex];
            transaction.type = type; transaction.description = description; transaction.amount = parseFloat(amount); transaction.date = date; transaction.categoryId = categoryId || 'cat_uncategorized';
            return transaction;
        }
    } return null;
}
export function deleteTransaction(profileId, transactionId) { /* ... (no changes) ... */ 
    const profile = getProfileById(profileId);
    if (profile) {
        const initialLength = profile.transactions.length;
        profile.transactions = profile.transactions.filter(t => t.id !== transactionId);
        return profile.transactions.length < initialLength;
    } return false;
}

// --- Category Management (New/Updated) ---

/**
 * Gets a category by its ID.
 * @param {string} categoryId - The ID of the category.
 * @returns {object | undefined} The category object or undefined if not found.
 */
export function getCategoryById(categoryId) {
    return state.categories.find(cat => cat.id === categoryId);
}

/**
 * Adds a new category to the state.
 * @param {string} name - The name of the new category.
 * @param {string} type - The type ('income', 'outcome', 'universal').
 * @returns {object} The newly created category object.
 */
export function addCategory(name, type) {
    // Basic validation: Check if category with the same name and type already exists
    const existingCategory = state.categories.find(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type);
    if (existingCategory) {
        console.warn(`Category "${name}" of type "${type}" already exists.`);
        return null; // Indicate failure due to duplicate
    }

    const newCategory = {
        id: `cat_${generateId()}`, // Prefix ID for clarity
        name: name.trim(),
        type: type
    };
    state.categories.push(newCategory);
    console.log("New category added to state:", newCategory);
    return newCategory;
}

/**
 * Updates an existing category in the state.
 * @param {string} categoryId - The ID of the category to update.
 * @param {object} updatedData - An object containing { name, type } to update.
 * @returns {object | null} The updated category object or null if not found or duplicate.
 */
export function updateCategory(categoryId, { name, type }) {
    const categoryIndex = state.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) {
        console.warn(`Category with ID ${categoryId} not found for update.`);
        return null;
    }

    // Check for duplicates before updating (excluding the current category itself)
    const trimmedName = name.trim();
    const duplicateExists = state.categories.some(cat => 
        cat.id !== categoryId && 
        cat.name.toLowerCase() === trimmedName.toLowerCase() && 
        cat.type === type
    );

    if (duplicateExists) {
        console.warn(`Cannot update category: Another category with name "${trimmedName}" and type "${type}" already exists.`);
        return null; // Indicate failure due to duplicate
    }

    if (trimmedName) state.categories[categoryIndex].name = trimmedName;
    if (type) state.categories[categoryIndex].type = type;
    console.log("Category updated in state:", state.categories[categoryIndex]);
    return state.categories[categoryIndex];
}

/**
 * Deletes a category from the state.
 * Also updates transactions using this category to 'Uncategorized'.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteCategory(categoryId) {
    // Prevent deleting the essential 'Uncategorized' category
    if (categoryId === 'cat_uncategorized') {
        console.warn("Cannot delete the default 'Uncategorized' category.");
        return false;
    }

    const categoryIndex = state.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex !== -1) {
        state.categories.splice(categoryIndex, 1);
        console.log(`Category with ID ${categoryId} deleted.`);

        // Reassign transactions using the deleted category to 'Uncategorized'
        let reassignedCount = 0;
        state.profiles.forEach(profile => {
            profile.transactions.forEach(transaction => {
                if (transaction.categoryId === categoryId) {
                    transaction.categoryId = 'cat_uncategorized';
                    reassignedCount++;
                }
            });
        });
        if (reassignedCount > 0) {
            console.log(`${reassignedCount} transaction(s) reassigned to 'Uncategorized'.`);
        }
        return true;
    }
    console.warn(`Category with ID ${categoryId} not found for deletion.`);
    return false;
}
