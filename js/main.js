// js/main.js
import * as dom from './domElements.js'; // Still useful for some direct references if any
import { loadAppState, getAppState } from './state/appState.js';

// Services
import { applyTheme, populateThemeSelector } from './services/themeService.js';

// UI Modules
import { initializeModalEscapeListener } from './ui/modalUIs.js';
import { renderProfilesList, populateProfileModalForm } from './ui/profileUI.js';
import { renderCategoriesList, populateCategoryForm, resetCategoryFormUI } from './ui/categoryUI.js';
import { renderExchangeRateInfoSidebar, renderExchangeRatesForm } from './ui/exchangeRateUI.js';
import { renderTransactionsList } from './ui/transactionUI.js';
import { renderDashboardHeader, renderDashboardSummary } from './ui/dashboardUI.js';
import { renderAppSettingsUI } from './ui/appSettingsUI.js';

// Handler Modules & their specific action handlers that might be passed as callbacks
import * as profileHandlers from './handlers/profileHandlers.js';
import * as transactionHandlers from './handlers/transactionHandlers.js';
import * as categoryHandlers from './handlers/categoryHandlers.js';
import * as exchangeRateHandlers from './handlers/exchangeRateHandlers.js';
import * as appSettingsAndDataHandlers from './handlers/appSettingsAndDataHandlers.js';

/**
 * Main function to render the entire application UI based on the current state.
 * This function orchestrates calls to various UI rendering modules.
 */
function renderApp() {
    const currentAppState = getAppState(); // Get the latest state

    // 1. Apply Theme and Populate Theme Selector (handled by themeService)
    // Theme should be applied first as it can affect calculations or visibility.
    applyTheme(currentAppState.settings.currentTheme);
    populateThemeSelector(currentAppState.settings.currentTheme);

    // 2. Render App Settings UI elements (Display Currency, Projection Date)
    renderAppSettingsUI();

    // 3. Render Profile specific UI
    // renderProfilesList needs callbacks for edit/delete actions on items
    renderProfilesList(
        profileHandlers.handleOpenEditProfileModal,
        profileHandlers.handleDeleteProfile
    );

    // 4. Render Dashboard Header and Summary
    renderDashboardHeader();
    renderDashboardSummary();

    // 5. Render Transactions List
    // renderTransactionsList needs callbacks for edit/delete actions on items
    renderTransactionsList(
        transactionHandlers.handleOpenTransactionModal, // For editing existing
        transactionHandlers.handleDeleteTransaction
    );

    // 6. Render Exchange Rate Info in Sidebar
    renderExchangeRateInfoSidebar();

    // 7. Other UI updates if needed, e.g., modal content if they are always rendered
    // For now, modals are populated when opened. Category list in its modal is rendered when modal opens.

    // 8. Refresh Lucide icons if any were dynamically added/changed
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
    console.log("Application re-rendered.");
}

/**
 * Initializes the application.
 * Loads data, sets up event listeners, and performs the initial render.
 */
function initializeApp() {
    console.log("DOM fully loaded and parsed. Initializing application...");

    // 1. Load initial application state (from localStorage or defaults)
    loadAppState();

    // 2. Set the main renderApp callback for all handler modules
    // This allows handlers to trigger a full UI refresh when state changes.
    profileHandlers.setRenderAppCallback(renderApp);
    transactionHandlers.setRenderAppCallback(renderApp);
    categoryHandlers.setRenderAppCallback(renderApp);
    exchangeRateHandlers.setRenderAppCallback(renderApp);
    appSettingsAndDataHandlers.setRenderAppCallback(renderApp);

    // 3. Initialize all event listeners
    profileHandlers.initializeProfileEventListeners();
    transactionHandlers.initializeTransactionEventListeners();
    categoryHandlers.initializeCategoryEventListeners();
    exchangeRateHandlers.initializeExchangeRateEventListeners();
    appSettingsAndDataHandlers.initializeAppSettingsAndDataEventListeners();
    initializeModalEscapeListener(); // General Escape key for modals

    // 4. Perform the initial render of the application
    renderApp();

    console.log("Application initialized and initial render complete.");
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose renderApp globally for debugging or specific manual calls if ever needed (optional)
// window.renderApp = renderApp;