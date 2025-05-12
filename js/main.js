// js/main.js
import * as dom from './domElements.js';
import * as state from './state.js';
import * as ui from './ui.js'; // Import all UI functions

/**
 * Initializes the application.
 */
function initializeApp() {
    console.log("Money Tracker App Initializing (Modular with Category Management)...");
    state.loadData(); 
    ui.renderApp(); 
    setupEventListeners();
    console.log("Application Initialized.");
}

/**
 * Sets up global event listeners.
 */
function setupEventListeners() {
    // Profile Modal Triggers & Form Submission
    dom.addProfileBtn.addEventListener('click', () => ui.openProfileModal());
    dom.profileForm.addEventListener('submit', ui.handleProfileFormSubmit);
    dom.closeProfileModalBtn.addEventListener('click', ui.closeProfileModal);
    dom.cancelProfileModalBtn.addEventListener('click', ui.closeProfileModal);
    
    // Transaction Modal Triggers & Form Submission
    dom.addIncomeBtn.addEventListener('click', () => ui.openTransactionModal('income'));
    dom.addOutcomeBtn.addEventListener('click', () => ui.openTransactionModal('outcome'));
    dom.transactionForm.addEventListener('submit', ui.handleTransactionFormSubmit);
    dom.closeTransactionModalBtn.addEventListener('click', ui.closeTransactionModal);
    dom.cancelTransactionModalBtn.addEventListener('click', ui.closeTransactionModal);

    // Category Management Modal Triggers & Form Submission (New)
    dom.manageCategoriesBtn.addEventListener('click', ui.openCategoryModal);
    dom.categoryForm.addEventListener('submit', ui.handleCategoryFormSubmit);
    dom.closeCategoryModalBtn.addEventListener('click', ui.closeCategoryModal);
    dom.cancelEditCategoryBtn.addEventListener('click', ui.resetCategoryForm); // Use reset function

    // View All Profiles
    dom.viewAllProfilesBtn.addEventListener('click', () => {
        state.updateState('activeProfileId', 'all');
        state.saveData();
        ui.renderApp(); 
    });

    // App Settings: Default Currency Change
    dom.appCurrencySelect.addEventListener('change', (e) => {
        state.updateState('globalDefaultCurrency', e.target.value);
        state.saveData();
        ui.renderApp(); 
        console.log('Global default currency changed to:', state.getState().globalDefaultCurrency);
    });

    // Import/Export
    dom.importDataBtn.addEventListener('click', () => dom.importFile.click());
    dom.importFile.addEventListener('change', ui.handleImportData); 
    dom.exportDataBtn.addEventListener('click', ui.handleExportData); 

    // Close modals on Escape key or outside click
    window.addEventListener('click', (event) => {
        if (event.target === dom.profileModal) ui.closeProfileModal();
        if (event.target === dom.transactionModal) ui.closeTransactionModal();
        if (event.target === dom.categoryModal) ui.closeCategoryModal(); // New
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (dom.profileModal.classList.contains('modal-open')) ui.closeProfileModal();
            if (dom.transactionModal.classList.contains('modal-open')) ui.closeTransactionModal();
            if (dom.categoryModal.classList.contains('modal-open')) ui.closeCategoryModal(); // New
        }
    });

    console.log("Global event listeners set up.");
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', initializeApp);
