// js/state/transactionState.js
import { getAppState, updateAppState, saveAppState } from './appState.js';
import { getProfileById } from './profileState.js'; // To ensure profile exists
import { generateId } from '../utils.js';

/**
 * Adds a transaction to a specific profile.
 * @param {string} profileId - The ID of the profile to add the transaction to.
 * @param {object} transactionData - The transaction data ({ type, description, amount, date, categoryId, isReimbursed }).
 * @returns {object | null} The newly created transaction object or null if profile not found.
 */
export function addTransaction(profileId, { type, description, amount, date, categoryId, isReimbursed = false }) {
    const appState = getAppState();
    const profileIndex = appState.profiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
        console.error(`Profile with ID ${profileId} not found. Cannot add transaction.`);
        return null;
    }

    const newTransaction = {
        id: generateId(),
        type,
        description: description.trim(),
        amount: parseFloat(amount),
        date, // Should be ISO string
        categoryId: categoryId || 'cat_uncategorized',
        isReimbursed: type === 'outcome' ? isReimbursed : false,
    };

    const updatedProfiles = [...appState.profiles];
    const updatedTransactions = [...updatedProfiles[profileIndex].transactions, newTransaction];
    updatedProfiles[profileIndex] = { ...updatedProfiles[profileIndex], transactions: updatedTransactions };

    updateAppState('profiles', updatedProfiles);
    saveAppState();
    return newTransaction;
}

/**
 * Updates an existing transaction in a specific profile.
 * @param {string} profileId - The ID of the profile containing the transaction.
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {object} updateData - The transaction data to update ({ type, description, amount, date, categoryId, isReimbursed }).
 * @returns {object | null} The updated transaction object or null if profile or transaction not found.
 */
export function updateTransaction(profileId, transactionId, { type, description, amount, date, categoryId, isReimbursed }) {
    const appState = getAppState();
    const profileIndex = appState.profiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
        console.error(`Profile with ID ${profileId} not found. Cannot update transaction.`);
        return null;
    }

    const updatedProfiles = [...appState.profiles];
    const profileToUpdate = { ...updatedProfiles[profileIndex] };
    const transactionIndex = profileToUpdate.transactions.findIndex(t => t.id === transactionId);

    if (transactionIndex === -1) {
        console.error(`Transaction with ID ${transactionId} not found in profile ${profileId}.`);
        return null;
    }

    const updatedTransactions = [...profileToUpdate.transactions];
    const transactionToUpdate = { ...updatedTransactions[transactionIndex] };

    if (type !== undefined) transactionToUpdate.type = type;
    if (description !== undefined) transactionToUpdate.description = description.trim();
    if (amount !== undefined) transactionToUpdate.amount = parseFloat(amount);
    if (date !== undefined) transactionToUpdate.date = date; // Should be ISO string
    if (categoryId !== undefined) transactionToUpdate.categoryId = categoryId || 'cat_uncategorized';
    if (isReimbursed !== undefined) transactionToUpdate.isReimbursed = transactionToUpdate.type === 'outcome' ? isReimbursed : false;

    updatedTransactions[transactionIndex] = transactionToUpdate;
    profileToUpdate.transactions = updatedTransactions;
    updatedProfiles[profileIndex] = profileToUpdate;

    updateAppState('profiles', updatedProfiles);
    saveAppState();
    return transactionToUpdate;
}

/**
 * Deletes a transaction from a specific profile.
 * @param {string} profileId - The ID of the profile containing the transaction.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteTransaction(profileId, transactionId) {
    const appState = getAppState();
    const profileIndex = appState.profiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
        console.error(`Profile with ID ${profileId} not found. Cannot delete transaction.`);
        return false;
    }

    const updatedProfiles = [...appState.profiles];
    const profileToUpdate = { ...updatedProfiles[profileIndex] };
    const initialTransactionCount = profileToUpdate.transactions.length;
    
    profileToUpdate.transactions = profileToUpdate.transactions.filter(t => t.id !== transactionId);

    if (profileToUpdate.transactions.length < initialTransactionCount) {
        updatedProfiles[profileIndex] = profileToUpdate;
        updateAppState('profiles', updatedProfiles);
        saveAppState();
        return true;
    }
    return false;
}

/**
 * Retrieves all transactions for a given profile ID.
 * @param {string} profileId - The ID of the profile.
 * @returns {Array<object>} An array of transaction objects, or an empty array if profile not found.
 */
export function getTransactionsByProfileId(profileId) {
    const profile = getProfileById(profileId);
    return profile ? profile.transactions : [];
}