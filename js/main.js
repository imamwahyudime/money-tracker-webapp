// js/main.js
import * as dom from './domElements.js';
import { loadData, saveData, getState, updateState, getActiveProfile, getProfileById } from './state.js';
// The UI module will be created in the next step. For now, we'll prepare for it.
// import { renderApp, openProfileModal, openTransactionModal } from './ui.js'; // Placeholder for ui.js imports

// --- TEMPORARY UI Function Placeholders (to be moved to ui.js) ---
// These are simplified versions. The full ui.js will handle rendering and complex interactions.
function renderApp() {
    console.log("renderApp called (placeholder - full implementation in ui.js)");
    // In a real scenario, this would call functions to render profiles, dashboard, transactions
    // For now, let's just log the current state to see if data loading works.
    console.log("Current App State:", getState());

    // Example: update dashboard header based on active profile (simplified)
    const activeProfile = getActiveProfile();
    const appState = getState();

    if (appState.activeProfileId === 'all') {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - All Profiles';
        dom.profileCurrencyInfoDisplay.textContent = `Summary across all profiles. Default currency: ${appState.globalDefaultCurrency}`;
    } else if (activeProfile) {
        dom.currentProfileNameDisplay.textContent = `Dashboard - ${activeProfile.name}`;
        dom.profileCurrencyInfoDisplay.textContent = `Currency: ${activeProfile.currency}`;
    } else {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - Profile Not Found';
        dom.profileCurrencyInfoDisplay.textContent = 'Please select a valid profile.';
    }
    // Update app currency select
    dom.appCurrencySelect.value = appState.globalDefaultCurrency;

    // Actual rendering of profiles list and transactions list will be in ui.js
    // For now, just clear them to show the structure is ready
    dom.profilesListEl.innerHTML = '<p class="text-sm text-slate-500 px-3 py-2">Profiles will load here...</p>';
    dom.transactionsListEl.innerHTML = '<div id="noTransactionsMessage" class="p-4 text-center text-slate-500">Transactions will load here...</div>';
}

function openProfileModal(profileToEdit = null) {
    console.log("openProfileModal called (placeholder)", profileToEdit);
    updateState('editingProfileId', profileToEdit ? profileToEdit.id : null);
    dom.profileModalTitle.textContent = profileToEdit ? 'Edit Profile' : 'Add New Profile';
    dom.profileForm.reset();
    if (profileToEdit) {
        dom.profileIdInput.value = profileToEdit.id;
        dom.profileNameInput.value = profileToEdit.name;
        dom.profileCurrencyInput.value = profileToEdit.currency;
    } else {
        dom.profileIdInput.value = '';
        dom.profileCurrencyInput.value = getState().globalDefaultCurrency;
    }
    dom.profileModal.classList.add('modal-open');
    dom.profileNameInput.focus();
}

function openTransactionModal(type, transactionToEdit = null) {
    console.log("openTransactionModal called (placeholder)", type, transactionToEdit);
    const activeProfile = getActiveProfile();
    if (!activeProfile) {
        alert("Please select a specific profile to add or edit transactions.");
        return;
    }
    updateState('editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    dom.transactionModalTitle.textContent = transactionToEdit 
        ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` 
        : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    dom.transactionForm.reset();
    dom.transactionTypeInput.value = type;
    dom.transactionAmountInput.placeholder = `Amount in ${activeProfile.currency}`;

    if (transactionToEdit) {
        dom.transactionIdInput.value = transactionToEdit.id;
        dom.transactionDescriptionInput.value = transactionToEdit.description;
        dom.transactionAmountInput.value = transactionToEdit.amount;
        dom.transactionDateInput.value = transactionToEdit.date;
    } else {
        dom.transactionIdInput.value = '';
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dom.transactionDateInput.value = now.toISOString().slice(0, 16);
    }
    dom.transactionModal.classList.add('modal-open');
    dom.transactionDescriptionInput.focus();
}
// --- END OF TEMPORARY UI Function Placeholders ---


/**
 * Initializes the application.
 * Loads data, sets up global event listeners, and performs initial rendering.
 */
functioninitializeApp() {
    console.log("Money Tracker App Initializing (Modular)...");
    loadData(); // Load data from localStorage

    // Initial render of the application UI
    // This will be more comprehensive once ui.js is implemented
    renderApp(); 

    // Setup global event listeners
    setupEventListeners();

    console.log("Application Initialized.");
}

/**
 * Sets up global event listeners for the application.
 */
function setupEventListeners() {
    // Profile Modal Triggers
    dom.addProfileBtn.addEventListener('click', () => openProfileModal());
    
    // Transaction Modal Triggers
    dom.addIncomeBtn.addEventListener('click', () => openTransactionModal('income'));
    dom.addOutcomeBtn.addEventListener('click', () => openTransactionModal('outcome'));

    // View All Profiles
    dom.viewAllProfilesBtn.addEventListener('click', () => {
        updateState('activeProfileId', 'all');
        saveData();
        renderApp(); // Re-render the application with the new state
    });

    // App Settings: Default Currency Change
    dom.appCurrencySelect.addEventListener('change', (e) => {
        updateState('globalDefaultCurrency', e.target.value);
        saveData();
        // If 'all' profiles view is active, its currency display might need update
        if (getState().activeProfileId === 'all') {
            renderApp();
        }
        console.log('Global default currency changed to:', getState().globalDefaultCurrency);
    });

    // Import/Export (Basic placeholders, full implementation later)
    dom.importDataBtn.addEventListener('click', () => {
        dom.importFile.click(); // Trigger hidden file input
    });
    dom.importFile.addEventListener('change', (event) => {
        // TODO: Implement import logic in a future step (e.g., in ui.js or a dedicated import/export module)
        console.log('File selected for import:', event.target.files[0]);
        alert("Import functionality will be implemented in a future update.");
        event.target.value = null; // Reset file input
    });
    dom.exportDataBtn.addEventListener('click', () => {
        // TODO: Implement export logic (e.g., in ui.js or a dedicated import/export module)
        console.log('Export Data clicked');
        alert("Export functionality will be implemented in a future update.");
    });

    // More event listeners (like form submissions, modal close buttons)
    // will be handled within the ui.js module or by functions it exports and main.js calls.
    // For example, modal close buttons:
    dom.closeProfileModalBtn.addEventListener('click', () => dom.profileModal.classList.remove('modal-open'));
    dom.cancelProfileModalBtn.addEventListener('click', () => dom.profileModal.classList.remove('modal-open'));
    dom.closeTransactionModalBtn.addEventListener('click', () => dom.transactionModal.classList.remove('modal-open'));
    dom.cancelTransactionModalBtn.addEventListener('click', () => dom.transactionModal.classList.remove('modal-open'));

    window.addEventListener('click', (event) => {
        if (event.target === dom.profileModal) dom.profileModal.classList.remove('modal-open');
        if (event.target === dom.transactionModal) dom.transactionModal.classList.remove('modal-open');
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (dom.profileModal.classList.contains('modal-open')) dom.profileModal.classList.remove('modal-open');
            if (dom.transactionModal.classList.contains('modal-open')) dom.transactionModal.classList.remove('modal-open');
        }
    });

    // Form submissions will be handled by functions imported from ui.js
    // dom.profileForm.addEventListener('submit', handleProfileFormSubmit);
    // dom.transactionForm.addEventListener('submit', handleTransactionFormSubmit);
    // These handlers will call state functions and then trigger re-renders via renderApp() or specific render functions.
    console.log("Global event listeners set up.");
}

// --- Application Entry Point ---
// Wait for the DOM to be fully loaded before initializing the application.
document.addEventListener('DOMContentLoaded', initializeApp);
