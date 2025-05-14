// js/main.js
import * as dom from './domElements.js';
import * as state from './state.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    state.loadData(); // Load data first
    ui.renderApp(); // Then render the app with loaded data

    // --- Sidebar Profile Listeners ---
    dom.addProfileBtn.addEventListener('click', () => ui.openProfileModal());
    dom.viewAllProfilesBtn.addEventListener('click', () => {
        state.updateState('activeProfileId', 'all');
        state.saveData();
        ui.renderApp();
    });

    // --- Sidebar App Settings Listeners ---
    dom.appDisplayCurrencySelect.addEventListener('change', (event) => {
        state.updateState('displayCurrency', event.target.value);
        state.saveData();
        ui.renderApp(); // Re-render to reflect currency changes in summaries if 'All Profiles' is active
    });
    dom.manageCategoriesBtn.addEventListener('click', ui.openCategoryModal);
    dom.manageExchangeRatesBtn.addEventListener('click', ui.openExchangeRatesModal);

    // --- Main Header Date Projection Listeners (NEW) ---
    dom.projectionDateInput.addEventListener('change', (event) => {
        const newProjectionDate = event.target.value ? new Date(event.target.value).toISOString() : null;
        state.updateState('projectionDate', newProjectionDate);
        state.saveData();
        ui.renderApp();
    });

    dom.resetProjectionDateBtn.addEventListener('click', () => {
        state.updateState('projectionDate', null);
        dom.projectionDateInput.value = ''; // Clear the input field visually
        state.saveData();
        ui.renderApp();
    });


    // --- Main Content Transaction Buttons ---
    dom.addIncomeBtn.addEventListener('click', () => {
        const activeProfileId = state.getState().activeProfileId;
        if (activeProfileId === 'all' || !state.getProfileById(activeProfileId)) {
            alert("Please select a specific profile to add income.");
            return;
        }
        ui.openTransactionModal('income', null, activeProfileId);
    });
    dom.addOutcomeBtn.addEventListener('click', () => {
        const activeProfileId = state.getState().activeProfileId;
        if (activeProfileId === 'all' || !state.getProfileById(activeProfileId)) {
            alert("Please select a specific profile to add an outcome.");
            return;
        }
        ui.openTransactionModal('outcome', null, activeProfileId);
    });


    // --- Profile Modal Listeners ---
    dom.profileForm.addEventListener('submit', ui.handleProfileFormSubmit);
    dom.closeProfileModalBtn.addEventListener('click', ui.closeProfileModal);
    dom.cancelProfileModalBtn.addEventListener('click', ui.closeProfileModal);

    // --- Transaction Modal Listeners ---
    dom.transactionForm.addEventListener('submit', ui.handleTransactionFormSubmit);
    dom.closeTransactionModalBtn.addEventListener('click', ui.closeTransactionModal);
    dom.cancelTransactionModalBtn.addEventListener('click', ui.closeTransactionModal);

    // --- Category Modal Listeners ---
    dom.categoryForm.addEventListener('submit', ui.handleCategoryFormSubmit);
    dom.closeCategoryModalBtn.addEventListener('click', ui.closeCategoryModal);
    dom.cancelEditCategoryBtn.addEventListener('click', ui.resetCategoryForm);

    // --- Exchange Rate Modal Listeners ---
    dom.exchangeRateForm.addEventListener('submit', ui.handleSaveExchangeRates);
    dom.closeExchangeRateModalBtn.addEventListener('click', ui.closeExchangeRatesModal);
    dom.cancelExchangeRateModalBtn.addEventListener('click', ui.closeExchangeRatesModal);
    dom.importRatesBtn.addEventListener('click', () => dom.importRatesFile.click());
    dom.importRatesFile.addEventListener('change', ui.handleImportExchangeRatesFile);
    dom.exportRatesBtn.addEventListener('click', ui.handleExportExchangeRatesFile);


    // --- Data Management Listeners ---
    dom.importDataBtn.addEventListener('click', () => dom.importFile.click());
    dom.importFile.addEventListener('change', ui.handleImportData);
    dom.exportDataBtn.addEventListener('click', ui.handleExportData);


    // Initial call to Lucide after app render (already in renderApp)
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        // lucide.createIcons(); // This is now called at the end of renderApp()
    }

    // Handle Escape key for modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (dom.profileModal.classList.contains('modal-open')) ui.closeProfileModal();
            if (dom.transactionModal.classList.contains('modal-open')) ui.closeTransactionModal();
            if (dom.categoryModal.classList.contains('modal-open')) ui.closeCategoryModal();
            if (dom.exchangeRateModal.classList.contains('modal-open')) ui.closeExchangeRatesModal();
        }
    });
    console.log("Initial setup and event listeners attached.");
});