// js/ui/appSettingsUI.js
import * as dom from '../domElements.js';
import { getAppState } from '../state/appState.js';
import { CURRENCY_SYMBOLS } from '../config.js';
import { formatDateForInput } from '../utils.js';

/**
 * Initializes and populates the application display currency selector.
 * Sets the selected value based on current app settings.
 */
export function initializeDisplayCurrencySelector() {
    const appSettings = getAppState().settings;
    dom.appDisplayCurrencySelect.innerHTML = ''; // Clear existing options

    Object.keys(CURRENCY_SYMBOLS).forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${CURRENCY_SYMBOLS[code]}`; // e.g., USD - $
        if (code === appSettings.displayCurrency) {
            option.selected = true;
        }
        dom.appDisplayCurrencySelect.appendChild(option);
    });
}

/**
 * Updates the display currency selector's value.
 * This is typically called after the app state's displayCurrency changes.
 */
export function updateDisplayCurrencySelector() {
    const appSettings = getAppState().settings;
    dom.appDisplayCurrencySelect.value = appSettings.displayCurrency;
}


/**
 * Initializes the projection date input field with the value from app settings.
 */
export function initializeProjectionDateInput() {
    const appSettings = getAppState().settings;
    if (appSettings.projectionDate) {
        // Ensure the date is formatted correctly for the HTML date input
        dom.projectionDateInput.value = formatDateForInput(appSettings.projectionDate, false);
    } else {
        dom.projectionDateInput.value = ''; // Clear if no projection date is set
    }
}

/**
 * Updates the projection date input field's value.
 * This is typically called if the app state's projectionDate changes not via direct input.
 */
export function updateProjectionDateInput() {
    const appSettings = getAppState().settings;
    if (appSettings.projectionDate) {
        dom.projectionDateInput.value = formatDateForInput(appSettings.projectionDate, false);
    } else {
        dom.projectionDateInput.value = '';
    }
}

/**
 * Populates and sets all application settings UI elements.
 * This can be a main function to call to refresh all settings UI parts.
 */
export function renderAppSettingsUI() {
    initializeDisplayCurrencySelector(); // Populates and sets selection
    initializeProjectionDateInput();   // Sets value
    // Theme selector is handled by themeService.populateThemeSelector
}