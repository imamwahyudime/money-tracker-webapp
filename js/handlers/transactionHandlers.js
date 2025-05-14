// js/handlers/transactionHandlers.js
import * as dom from '../domElements.js';
import { getAppState, updateAppState } from '../state/appState.js';
import { addTransaction, updateTransaction, deleteTransaction } from '../state/transactionState.js';
import { getActiveProfileId, getProfileById } from '../state/profileState.js';
import { openTransactionModalUI, closeTransactionModalUI } from '../ui/modalUIs.js';
import { populateTransactionModalForm } from '../ui/transactionUI.js'; // For populating the form
// renderApp function will be imported in main.js and passed to handlers that need full re-render.
// We will also need a specific reference to the profileId for which a transaction is being added/edited.

let fullRenderAppCallback = () => console.warn("renderApp callback not yet initialized in transactionHandlers");

// This will store the profileId for the currently open transaction modal.
// It's a bit of a workaround for not having a more complex UI state management for modals.
// Alternatively, this could be part of appState.ui.activeProfileIdForTransactionModal
let currentProfileIdForTransactionModal = null;

/**
 * Sets the callback function for a full application re-render.
 * @param {function} renderAppFn - The main application rendering function.
 */
export function setRenderAppCallback(renderAppFn) {
    fullRenderAppCallback = renderAppFn;
}

/**
 * Handles opening the transaction modal.
 * @param {string} type - 'income' or 'outcome'.
 * @param {object | null} transactionToEdit - The transaction to edit, or null for new.
 * @param {string} contextProfileId - The ID of the profile this transaction belongs to/will belong to.
 */
export function handleOpenTransactionModal(type, transactionToEdit = null, contextProfileId) {
    const targetProfileId = transactionToEdit ? transactionToEdit.profileId : contextProfileId;

    if (!targetProfileId || targetProfileId === 'all') {
        alert("Please select a specific profile to add or edit a transaction.");
        return;
    }
    const profile = getProfileById(targetProfileId);
    if (!profile) {
        alert("Profile context for transaction not found.");
        return;
    }

    currentProfileIdForTransactionModal = targetProfileId; // Store context
    updateAppState('ui.editingTransactionId', transactionToEdit ? transactionToEdit.id : null);

    populateTransactionModalForm(type, transactionToEdit, targetProfileId);
    openTransactionModalUI(type, transactionToEdit); // This now mostly just opens the modal element
}

/**
 * Handles the submission of the transaction form.
 * @param {Event} event - The form submission event.
 */
export function handleTransactionFormSubmit(event) {
    event.preventDefault();

    const description = dom.transactionDescriptionInput.value.trim();
    const amount = parseFloat(dom.transactionAmountInput.value);
    const categoryId = dom.transactionCategoryInput.value;
    const dateString = dom.transactionDateInput.value; // YYYY-MM-DDTHH:mm
    const type = dom.transactionTypeInput.value; // Hidden input for type
    const isReimbursed = dom.transactionIsReimbursedInput.checked;

    const editingTransactionId = getAppState().ui.editingTransactionId;
    const profileIdForAction = currentProfileIdForTransactionModal; // Use the stored context

    if (!profileIdForAction || profileIdForAction === 'all') {
        alert("No specific profile context for this transaction. Please select a profile or ensure one was active.");
        return;
    }

    if (!description || isNaN(amount) || amount <= 0 || !dateString || !categoryId) {
        alert("Please fill all required fields correctly (Description, Amount > 0, Category, Date).");
        return;
    }

    // Convert local datetime-local string to ISOString for storage
    // new Date(dateString) will parse YYYY-MM-DDTHH:mm as local time.
    const date = new Date(dateString).toISOString();

    const transactionData = {
        type,
        description,
        amount,
        date,
        categoryId,
        isReimbursed: type === 'outcome' ? isReimbursed : false,
    };

    if (editingTransactionId) {
        updateTransaction(profileIdForAction, editingTransactionId, transactionData);
    } else {
        addTransaction(profileIdForAction, transactionData);
    }
    // addTransaction/updateTransaction already save state.
    closeTransactionModalUI();
    currentProfileIdForTransactionModal = null; // Reset context
    fullRenderAppCallback(); // Trigger a full re-render
}

/**
 * Handles the deletion of a transaction.
 * This is intended to be called from renderTransactionsList.
 * @param {string} profileId - The ID of the profile containing the transaction.
 * @param {string} transactionId - The ID of the transaction to delete.
 */
export function handleDeleteTransaction(profileId, transactionId) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        const success = deleteTransaction(profileId, transactionId); // deleteTransaction saves state
        if (success) {
            // alert("Transaction deleted successfully."); // Optional: too many alerts can be annoying
            fullRenderAppCallback(); // Trigger a full re-render
        } else {
            alert("Failed to delete transaction.");
        }
    }
}

/**
 * Initializes event listeners for transaction-related actions.
 */
export function initializeTransactionEventListeners() {
    // Listeners for "Add Income" / "Add Outcome" buttons in the main UI
    dom.addIncomeBtn.addEventListener('click', () => {
        const activeProfileId = getActiveProfileId();
        if (activeProfileId === 'all' || !getProfileById(activeProfileId)) {
            alert("Please select a specific profile to add income.");
            return;
        }
        handleOpenTransactionModal('income', null, activeProfileId);
    });

    dom.addOutcomeBtn.addEventListener('click', () => {
        const activeProfileId = getActiveProfileId();
        if (activeProfileId === 'all' || !getProfileById(activeProfileId)) {
            alert("Please select a specific profile to add an outcome.");
            return;
        }
        handleOpenTransactionModal('outcome', null, activeProfileId);
    });

    // Transaction Modal specific listeners
    dom.transactionForm.addEventListener('submit', handleTransactionFormSubmit);
    dom.closeTransactionModalBtn.addEventListener('click', () => {
        closeTransactionModalUI();
        currentProfileIdForTransactionModal = null; // Reset context
    });
    dom.cancelTransactionModalBtn.addEventListener('click', () => {
        closeTransactionModalUI();
        currentProfileIdForTransactionModal = null; // Reset context
    });

    // Edit and delete listeners are attached dynamically in renderTransactionsList
    // by passing handleOpenTransactionModal and handleDeleteTransaction as callbacks.
}