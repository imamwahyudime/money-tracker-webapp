// js/state/categoryState.js
import { getAppState, updateAppState, saveAppState } from './appState.js';
import { generateId } from '../utils.js';
import { DEFAULT_CATEGORIES } from '../config.js'; // To reset transactions

/**
 * Retrieves all categories from the application state.
 * @returns {Array<object>} A list of category objects.
 */
export function getCategories() {
    return getAppState().categories;
}

/**
 * Retrieves a category by its ID.
 * @param {string} id - The ID of the category.
 * @returns {object | undefined} The category object or undefined if not found.
 */
export function getCategoryById(id) {
    const { categories } = getAppState();
    return categories.find(c => c.id === id);
}

/**
 * Adds a new category to the application state.
 * Prevents adding duplicate category (name and type combination).
 * @param {string} name - The name of the category.
 * @param {string} type - The type of the category ('income', 'outcome', 'universal').
 * @returns {object | null} The newly created category object, or null if a duplicate exists.
 */
export function addCategory(name, type) {
    const appState = getAppState();
    const trimmedName = name.trim();
    const existingCategory = appState.categories.find(
        c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === type
    );

    if (existingCategory) {
        console.warn(`Category with name "${trimmedName}" and type "${type}" already exists.`);
        return null;
    }

    const newCategory = { id: `cat_${generateId()}`, name: trimmedName, type };
    const updatedCategories = [...appState.categories, newCategory];
    updateAppState('categories', updatedCategories);
    saveAppState();
    return newCategory;
}

/**
 * Updates an existing category.
 * Prevents updating to a duplicate category (name and type combination, excluding self).
 * @param {string} id - The ID of the category to update.
 * @param {object} updateData - An object containing { name, type } to update.
 * @returns {object | null} The updated category object, or null if not found or if update creates a duplicate.
 */
export function updateCategory(id, { name, type }) {
    const appState = getAppState();
    const categoryIndex = appState.categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) return null;

    const trimmedName = name.trim();
    const isDuplicate = appState.categories.some(
        c => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === type
    );

    if (isDuplicate) {
        console.warn(`Cannot update category: duplicate name "${trimmedName}" and type "${type}" would be created.`);
        return null;
    }

    const updatedCategories = [...appState.categories];
    const categoryToUpdate = { ...updatedCategories[categoryIndex] };

    if (name !== undefined && trimmedName) categoryToUpdate.name = trimmedName;
    if (type !== undefined) categoryToUpdate.type = type;

    updatedCategories[categoryIndex] = categoryToUpdate;
    updateAppState('categories', updatedCategories);
    saveAppState();
    return categoryToUpdate;
}

/**
 * Deletes a category. Transactions using this category will be reassigned to 'cat_uncategorized'.
 * The 'cat_uncategorized' category itself cannot be deleted.
 * @param {string} id - The ID of the category to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteCategory(id) {
    if (id === 'cat_uncategorized') {
        console.warn("Cannot delete the 'Uncategorized' category.");
        return false;
    }

    const appState = getAppState();
    const categoryIndex = appState.categories.findIndex(c => c.id === id);

    if (categoryIndex !== -1) {
        const updatedCategories = appState.categories.filter(c => c.id !== id);
        updateAppState('categories', updatedCategories);

        // Reassign transactions from the deleted category to 'cat_uncategorized'
        const updatedProfiles = appState.profiles.map(profile => {
            const newTransactions = profile.transactions.map(tx => {
                if (tx.categoryId === id) {
                    return { ...tx, categoryId: 'cat_uncategorized' };
                }
                return tx;
            });
            return { ...profile, transactions: newTransactions };
        });
        updateAppState('profiles', updatedProfiles);

        saveAppState();
        return true;
    }
    return false;
}