// js/handlers/exchangeRateHandlers.js
import * as dom from '../domElements.js';
import { updateExchangeRates, replaceExchangeRates } from '../state/exchangeRateState.js';
import { openExchangeRatesModalUI, closeExchangeRatesModalUI } from '../ui/modalUIs.js';
import { renderExchangeRatesForm, renderExchangeRateInfoSidebar } from '../ui/exchangeRateUI.js';
// For exporting data
import { getExchangeRates } from '../state/exchangeRateState.js';


let fullRenderAppCallback = () => console.warn("renderApp callback not yet initialized in exchangeRateHandlers");

/**
 * Sets the callback function for a full application re-render.
 * @param {function} renderAppFn - The main application rendering function.
 */
export function setRenderAppCallback(renderAppFn) {
    fullRenderAppCallback = renderAppFn;
}

/**
 * Handles opening the exchange rates modal and rendering its form.
 */
export function handleOpenExchangeRatesManager() {
    renderExchangeRatesForm(); // Populate the form with current rates
    openExchangeRatesModalUI();
}

/**
 * Handles saving the exchange rates from the modal form.
 * @param {Event} event - The form submission event.
 */
export function handleSaveExchangeRates(event) {
    event.preventDefault();
    const formData = new FormData(dom.exchangeRateForm);
    const formRates = {};
    let allValid = true;
    const newBaseCurrency = dom.rateBaseCurrencySelect.value;

    // Collect rates from form, basic validation
    for (const [key, value] of formData.entries()) {
        if (key === 'baseCurrency') continue; // This is handled by rateBaseCurrencySelect.value

        const rate = parseFloat(value);
        // If the currency is the new base, its rate must be 1 (already set as read-only in UI)
        // For other currencies, they must be positive.
        if (key !== newBaseCurrency && (isNaN(rate) || rate <= 0)) {
            alert(`Invalid rate for ${key}. Rates must be positive numbers.`);
            allValid = false;
            break;
        }
        formRates[key] = rate;
    }
    // Ensure the base currency itself has a rate of 1 in the submitted form data
    formRates[newBaseCurrency] = 1;


    if (allValid) {
        const success = updateExchangeRates(newBaseCurrency, formRates); // This updates state and saves
        if (success) {
            alert("Exchange rates saved successfully!");
            closeExchangeRatesModalUI();
            // The sidebar info and any currency conversions will need an app refresh
            fullRenderAppCallback();
        } else {
            // updateExchangeRates should show specific alerts for critical errors like invalid new base rate
            // alert("Failed to save exchange rates. Please check the values."); // Generic fallback
        }
    }
}

/**
 * Handles the import of an exchange rates file.
 * @param {Event} event - The file input change event.
 */
export function handleImportExchangeRatesFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
        alert("Invalid file type. Please select a JSON file for exchange rates.");
        dom.importRatesFile.value = null; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedRatesData = JSON.parse(e.target.result);
            // Confirmation before overwriting
            if (confirm(`Importing this rates file will overwrite your current exchange rates. Base: ${importedRatesData.base || 'Unknown'}. Are you sure?`)) {
                const success = replaceExchangeRates(importedRatesData); // This validates, updates state, and saves
                if (success) {
                    alert("Exchange rates imported successfully!");
                    closeExchangeRatesModalUI(); // Close modal on success
                    fullRenderAppCallback(); // Refresh UI
                }
                // If not successful, replaceExchangeRates or underlying functions should alert the user.
            }
        } catch (error) {
            console.error("Error parsing JSON from imported rates file:", error);
            alert("Error reading or parsing the rates import file. Please ensure it's a valid JSON.");
        } finally {
            dom.importRatesFile.value = null; // Reset file input
        }
    };
    reader.onerror = () => {
        alert("Error reading the rates file.");
        dom.importRatesFile.value = null;
    };
    reader.readAsText(file);
}

/**
 * Handles the export of the current exchange rates to a JSON file.
 */
export function handleExportExchangeRatesFile() {
    const currentRates = getExchangeRates(); // Get from exchangeRateState
    const jsonData = JSON.stringify(currentRates, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.download = `money_tracker_exchange_rates_${currentRates.base}_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Exchange rates exported successfully! Check your downloads folder.");
}


/**
 * Initializes event listeners for exchange rate management.
 */
export function initializeExchangeRateEventListeners() {
    dom.manageExchangeRatesBtn.addEventListener('click', handleOpenExchangeRatesManager);
    dom.exchangeRateForm.addEventListener('submit', handleSaveExchangeRates);
    dom.closeExchangeRateModalBtn.addEventListener('click', closeExchangeRatesModalUI);
    dom.cancelExchangeRateModalBtn.addEventListener('click', closeExchangeRatesModalUI);

    dom.importRatesBtn.addEventListener('click', () => dom.importRatesFile.click()); // Trigger hidden file input
    dom.importRatesFile.addEventListener('change', handleImportExchangeRatesFile);
    dom.exportRatesBtn.addEventListener('click', handleExportExchangeRatesFile);
}