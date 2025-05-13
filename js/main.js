// js/main.js
import * as dom from './domElements.js';
import * as state from './state.js';
import * as ui from './ui.js'; 

/**
 * Initializes the application.
 */
function initializeApp() {
    console.log("Money Tracker App Initializing (Import/Export Rates)...");
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

    // Category Management Modal Triggers & Form Submission
    dom.manageCategoriesBtn.addEventListener('click', ui.openCategoryModal);
    dom.categoryForm.addEventListener('submit', ui.handleCategoryFormSubmit);
    dom.closeCategoryModalBtn.addEventListener('click', ui.closeCategoryModal);
    dom.cancelEditCategoryBtn.addEventListener('click', ui.resetCategoryForm); 

    // View All Profiles
    dom.viewAllProfilesBtn.addEventListener('click', () => {
        state.updateState('activeProfileId', 'all');
        state.saveData(); 
        ui.renderApp(); 
    });

    // App Settings: Display Currency Change
    dom.appDisplayCurrencySelect.addEventListener('change', (e) => { 
        state.updateState('displayCurrency', e.target.value); 
        state.saveData();
        ui.renderApp(); 
        console.log('Global display currency changed to:', state.getState().displayCurrency);
    });

    // Exchange Rate Management Modal Triggers & Form Submission
    dom.manageExchangeRatesBtn.addEventListener('click', ui.openExchangeRatesModal);
    dom.exchangeRateForm.addEventListener('submit', ui.handleSaveExchangeRates);
    dom.closeExchangeRateModalBtn.addEventListener('click', ui.closeExchangeRatesModal);
    dom.cancelExchangeRateModalBtn.addEventListener('click', ui.closeExchangeRatesModal);
    // New: Event listeners for import/export rates buttons within the exchange rate modal
    dom.importRatesBtn.addEventListener('click', () => dom.importRatesFile.click());
    dom.importRatesFile.addEventListener('change', ui.handleImportExchangeRatesFile);
    dom.exportRatesBtn.addEventListener('click', ui.handleExportExchangeRatesFile);


    // Import/Export Full App Data
    dom.importDataBtn.addEventListener('click', () => dom.importFile.click());
    dom.importFile.addEventListener('change', ui.handleImportData); 
    dom.exportDataBtn.addEventListener('click', ui.handleExportData); 

    // Close modals on Escape key or outside click
    window.addEventListener('click', (event) => {
        if (event.target === dom.profileModal) ui.closeProfileModal();
        if (event.target === dom.transactionModal) ui.closeTransactionModal();
        if (event.target === dom.categoryModal) ui.closeCategoryModal(); 
        if (event.target === dom.exchangeRateModal) ui.closeExchangeRatesModal(); 
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (dom.profileModal.classList.contains('modal-open')) ui.closeProfileModal();
            if (dom.transactionModal.classList.contains('modal-open')) ui.closeTransactionModal();
            if (dom.categoryModal.classList.contains('modal-open')) ui.closeCategoryModal(); 
            if (dom.exchangeRateModal.classList.contains('modal-open')) ui.closeExchangeRatesModal(); 
        }
    });

    console.log("Global event listeners set up.");
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', initializeApp);
