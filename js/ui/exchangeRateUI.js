// js/ui/exchangeRateUI.js
import * as dom from '../domElements.js';
import { getExchangeRates } from '../state/exchangeRateState.js';
import { CURRENCY_SYMBOLS } from '../config.js';
import { formatDateTime } from '../utils.js';

/**
 * Renders the exchange rate information in the sidebar.
 */
export function renderExchangeRateInfoSidebar() {
    const { base, lastUpdated } = getExchangeRates();
    dom.exchangeRateBaseDisplay.textContent = base || 'N/A';
    dom.exchangeRateTimestampDisplay.textContent = lastUpdated ? formatDateTime(lastUpdated) : 'N/A';
}

/**
 * Renders the exchange rates form in the modal.
 * Populates currency options and existing rates.
 */
export function renderExchangeRatesForm() {
    const { base: currentBase, rates } = getExchangeRates();
    const appCurrencies = Object.keys(CURRENCY_SYMBOLS);

    // Populate base currency selector
    dom.rateBaseCurrencySelect.innerHTML = '';
    appCurrencies.sort().forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} (${CURRENCY_SYMBOLS[code]})`;
        if (code === currentBase) {
            option.selected = true;
        }
        dom.rateBaseCurrencySelect.appendChild(option);
    });

    dom.formBaseCurrencyLabel.textContent = currentBase; // e.g., "1 USD ="

    // Populate individual rate input fields
    dom.exchangeRatesListContainer.innerHTML = '';
    appCurrencies.forEach(code => { // Iterate over all known app currencies
        const itemDiv = document.createElement('div');
        itemDiv.className = 'rate-item grid grid-cols-3 items-center gap-2 py-1.5';

        const label = document.createElement('label');
        label.htmlFor = `rate-input-${code}`;
        label.className = 'block text-sm font-medium col-span-1';
        label.textContent = `${code}:`;
        itemDiv.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `rate-input-${code}`;
        input.name = code; // Used to identify currency in form data
        input.step = 'any';
        input.min = '0.000001';
        input.className = 'w-full p-2 border rounded-md shadow-sm col-span-2';
        input.style.backgroundColor = 'var(--input-bg)';
        input.style.borderColor = 'var(--input-border)';
        input.style.color = 'var(--input-text)';

        // Set value from current rates, or empty if not present (though it should be for app currencies)
        input.value = rates[code] !== undefined ? rates[code] : '';
        if (code === currentBase) {
            input.value = '1'; // Base currency is always 1 against itself
            input.readOnly = true;
            input.classList.add('cursor-not-allowed');
            // Apply theme-aware readonly background directly
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') input.classList.add('bg-slate-700');
            else if (theme === 'sepia') input.classList.add('bg-gray-200'); // Example, ensure correct sepia style
            else input.classList.add('bg-slate-100');
        }
        itemDiv.appendChild(input);
        dom.exchangeRatesListContainer.appendChild(itemDiv);
    });

    // Attach onchange listener to base currency select AFTER it's populated
    dom.rateBaseCurrencySelect.onchange = handleBaseCurrencyChangeInForm;
}

/**
 * Handles the change of the base currency in the exchange rate form.
 * Updates the read-only status and value of the rate input fields.
 */
function handleBaseCurrencyChangeInForm() {
    const newSelectedBase = dom.rateBaseCurrencySelect.value;
    dom.formBaseCurrencyLabel.textContent = newSelectedBase; // Update "1 XXX =" label

    const inputs = dom.exchangeRatesListContainer.querySelectorAll('input[type="number"]');
    const theme = document.documentElement.getAttribute('data-theme');

    inputs.forEach(input => {
        // Reset styles and readOnly status
        input.readOnly = false;
        input.classList.remove('cursor-not-allowed', 'bg-slate-100', 'bg-slate-700', 'bg-gray-200');
        // Re-apply default input background
        input.style.backgroundColor = 'var(--input-bg)';


        if (input.name === newSelectedBase) {
            input.value = '1'; // New base is 1
            input.readOnly = true;
            input.classList.add('cursor-not-allowed');
            // Apply theme-aware readonly background
            if (theme === 'dark') input.classList.add('bg-slate-700');
            else if (theme === 'sepia') input.classList.add('bg-gray-200');
            else input.classList.add('bg-slate-100');
        }
        // For other currencies, their values remain as they are,
        // user is expected to adjust them relative to the new base if they save.
        // The actual recalculation happens in exchangeRateState.js upon form submission.
    });
}