// js/ui/dashboardUI.js
import * as dom from '../domElements.js';
import { getAppState } from '../state/appState.js';
import { getActiveProfile, getActiveProfileId, getProfileById } // from profileState
    from '../state/profileState.js';
import { getExchangeRates } from '../state/exchangeRateState.js';
import { formatCurrency, formatDateTime, convertCurrency, getFormattedDateRange } // getFormattedDateRange from utils.js
    from '../utils.js';
import { DEFAULT_FINANCIAL_MONTH_START_DAY } from '../config.js';
// getActiveDateWindow is crucial for both transaction listing and summary calculations.
// For now, importing from transactionUI.js. Could be moved to a more general uiUtils.js if needed.
import { getActiveDateWindow } from './transactionUI.js';

/**
 * Renders the main dashboard header section.
 * Displays current profile name, currency info, and active date range.
 */
export function renderDashboardHeader() {
    const appFullState = getAppState();
    const activeProfileId = getActiveProfileId();
    const activeProfile = getActiveProfile(); // This already checks for 'all' or specific
    const exchangeRatesData = getExchangeRates();
    const { startDate, endDate } = getActiveDateWindow(); // Uses projection date from appState.settings

    if (activeProfileId === 'all') {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - All Profiles';
        dom.profileCurrencyInfoDisplay.textContent = `Totals converted to ${appFullState.settings.displayCurrency}. Rates (vs ${exchangeRatesData.base}) last updated: ${formatDateTime(exchangeRatesData.lastUpdated)}`;
    } else if (activeProfile) {
        dom.currentProfileNameDisplay.textContent = `Dashboard - ${activeProfile.name}`;
        const finMonthStartDay = activeProfile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
        dom.profileCurrencyInfoDisplay.textContent = `Currency: ${activeProfile.currency}. Financial month starts day ${finMonthStartDay}.`;
    } else {
        // Should not happen if activeProfileId defaults to 'all' or a valid profile
        dom.currentProfileNameDisplay.textContent = 'Dashboard';
        dom.profileCurrencyInfoDisplay.textContent = 'Please select a profile or view all.';
    }
    dom.activeDateRangeDisplay.textContent = `Displaying: ${getFormattedDateRange(startDate, endDate)}`;
}


/**
 * Renders the summary cards (total income, outcome, net balance).
 * Calculations are based on the active profile and date window.
 */
export function renderDashboardSummary() {
    const appFullState = getAppState();
    const profiles = appFullState.profiles;
    const activeProfileId = getActiveProfileId();
    const displayCurrencyForAggregation = appFullState.settings.displayCurrency;
    const exchangeRatesData = getExchangeRates();

    const { startDate, endDate } = getActiveDateWindow();

    let totalIncome = 0;
    let totalOutcome = 0;
    let targetDisplayCurrency = displayCurrencyForAggregation; // Default for 'all'

    const filterTransactionsByDate = (transactions) => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            let include = true;
            if (startDate && tDate < startDate) include = false;
            if (endDate && tDate > endDate) include = false;
            return include;
        });
    };

    if (activeProfileId === 'all') {
        profiles.forEach(profile => {
            const filteredTransactions = filterTransactionsByDate(profile.transactions);
            filteredTransactions.forEach(t => {
                const amountInDisplayCurrency = convertCurrency(
                    t.amount,
                    profile.currency, // From profile's own currency
                    displayCurrencyForAggregation,
                    exchangeRatesData
                );
                if (t.type === 'income') {
                    totalIncome += amountInDisplayCurrency;
                } else if (t.type === 'outcome') {
                    if (t.isReimbursed) { // Reimbursed outcome effectively acts as income
                        totalIncome += amountInDisplayCurrency;
                    } else {
                        totalOutcome += amountInDisplayCurrency;
                    }
                }
            });
        });
        targetDisplayCurrency = displayCurrencyForAggregation;
    } else {
        const currentProfile = getProfileById(activeProfileId);
        if (currentProfile) {
            targetDisplayCurrency = currentProfile.currency; // For single profile, use its own currency
            const filteredTransactions = filterTransactionsByDate(currentProfile.transactions);
            filteredTransactions.forEach(t => {
                // No conversion needed here as amounts are already in profile's currency
                if (t.type === 'income') {
                    totalIncome += t.amount;
                } else if (t.type === 'outcome') {
                     if (t.isReimbursed) {
                        totalIncome += t.amount;
                    } else {
                        totalOutcome += t.amount;
                    }
                }
            });
        }
    }

    dom.totalIncomeDisplay.textContent = formatCurrency(totalIncome, targetDisplayCurrency);
    dom.totalOutcomeDisplay.textContent = formatCurrency(totalOutcome, targetDisplayCurrency);
    dom.netBalanceDisplay.textContent = formatCurrency(totalIncome - totalOutcome, targetDisplayCurrency);

    // Update Lucide icons if they are part of the summary (e.g., in titles)
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        // This might be needed if icons are dynamically inserted or changed
        // For the current HTML, icons are static in the summary titles,
        // but this is good practice if they were dynamic.
        // For now, it won't hurt.
        // lucide.createIcons({
        //     nodes: [dom.totalIncomeDisplay.previousElementSibling, dom.totalOutcomeDisplay.previousElementSibling, dom.netBalanceDisplay.previousElementSibling]
        // });
    }
}