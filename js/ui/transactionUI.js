// js/ui/transactionUI.js
import * as dom from '../domElements.js';
import { getAppState, updateAppState } from '../state/appState.js';
import { getCategories, getCategoryById } from '../state/categoryState.js';
import { getProfileById, getActiveProfileId } from '../state/profileState.js';
import { getExchangeRates } from '../state/exchangeRateState.js';
import { formatCurrency, formatDateTime, convertCurrency, formatDateForInput } from '../utils.js';
import { DEFAULT_FINANCIAL_MONTH_START_DAY } from '../config.js';

/**
 * Calculates the actual start and end dates for filtering transactions
 * based on projection date and active profile's financial month start day.
 * @returns {{startDate: Date | null, endDate: Date | null}}
 */
export function getActiveDateWindow() {
    const appSettings = getAppState().settings;
    const activeProfileId = getActiveProfileId(); // from profileState
    const activeProfile = getProfileById(activeProfileId); // from profileState

    const projectionDateString = appSettings.projectionDate;
    let today = new Date(); // User's local today

    let effectiveEndDate;
    if (projectionDateString) {
        // Projection date from input is local. Convert to Date object correctly.
        // HTML date input gives YYYY-MM-DD, which JS Date() parses as UTC if not careful.
        // To treat it as local, split and construct.
        const [year, month, day] = projectionDateString.split('T')[0].split('-').map(Number);
        const projDate = new Date(year, month - 1, day); // Local date
        effectiveEndDate = new Date(projDate.getFullYear(), projDate.getMonth(), projDate.getDate(), 23, 59, 59, 999);
    } else {
        effectiveEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    }

    let effectiveStartDate = null;

    if (activeProfileId === 'all') {
        // For "All Profiles", default to the start of the month of the effectiveEndDate
        effectiveStartDate = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), 1, 0, 0, 0, 0);
    } else if (activeProfile) {
        const monthStartDay = activeProfile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
        // Anchor date for calculating financial month is the effectiveEndDate (either projection or today)
        const anchorDate = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate());

        let currentYear = anchorDate.getFullYear();
        let currentMonth = anchorDate.getMonth(); // 0-indexed

        effectiveStartDate = new Date(currentYear, currentMonth, monthStartDay, 0, 0, 0, 0);

        // If the anchorDate's day is before the financial month start day,
        // the financial month started in the *previous* calendar month.
        if (anchorDate.getDate() < monthStartDay) {
            effectiveStartDate.setMonth(currentMonth - 1); // Date object handles year wrap-around
            // If monthStartDay is, e.g., 25th, and today is May 10th, financial month is April 25th.
            // If today is May 26th, financial month is May 25th.
        }
    } else {
        // Fallback if no profile selected (should ideally not happen if 'all' is default)
        effectiveStartDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    }
    
    // Ensure endDate is not before startDate if projection is set to a past date within current financial month
    if (effectiveStartDate && effectiveEndDate && effectiveEndDate < effectiveStartDate) {
         // If projection makes end date earlier than calculated start date, adjust start to be same as end for a single day view
        effectiveStartDate = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate(), 0, 0, 0, 0);
    }

    return { startDate: effectiveStartDate, endDate: effectiveEndDate };
}


/**
 * Creates a single transaction list item element.
 * @param {object} transaction - The transaction object (extended with profileName, profileCurrency, profileId if 'all' view).
 * @param {boolean} isAllProfilesView - True if currently viewing all profiles.
 * @param {string} displayCurrencyForAggregation - The currency used for 'all profiles' view aggregation.
 * @param {object} exchangeRatesData - Current exchange rates.
 * @param {function} onEdit - Callback for edit action.
 * @param {function} onDelete - Callback for delete action.
 * @returns {HTMLElement} The transaction item element.
 */
function createTransactionListItem(transaction, isAllProfilesView, displayCurrencyForAggregation, exchangeRatesData, onEdit, onDelete) {
    const item = document.createElement('div');
    item.className = 'transaction-item flex flex-col sm:flex-row justify-between items-start sm:items-center p-4';
    item.style.borderBottom = '1px solid var(--border-secondary)'; // Themed border

    if (transaction.type === 'outcome' && transaction.isReimbursed) {
        item.classList.add('transaction-reimbursed');
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'mb-2 sm:mb-0 flex-grow';

    const descP = document.createElement('p');
    descP.className = 'font-medium';
    let descriptionText = transaction.description;
    if (isAllProfilesView && transaction.profileName) {
        descriptionText += ` (${transaction.profileName})`;
    }
    if (transaction.type === 'outcome' && transaction.isReimbursed) {
        descriptionText += ' (Reimbursed)';
    }
    descP.textContent = descriptionText;
    infoDiv.appendChild(descP);

    const categoryObj = getCategoryById(transaction.categoryId); // from categoryState
    const categoryName = categoryObj ? categoryObj.name : 'Uncategorized';
    const dateCatP = document.createElement('p');
    dateCatP.className = 'text-xs';
    dateCatP.style.color = 'var(--text-secondary)';
    dateCatP.textContent = `${formatDateTime(transaction.date)} - ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - ${categoryName}`;
    infoDiv.appendChild(dateCatP);
    item.appendChild(infoDiv);

    const amountDiv = document.createElement('div');
    amountDiv.className = 'flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end sm:justify-normal';

    const amountSpan = document.createElement('span');
    const isIncomeEffective = transaction.type === 'income' || (transaction.type === 'outcome' && transaction.isReimbursed);
    amountSpan.className = `font-semibold text-lg ${isIncomeEffective ? 'text-green-600' : 'text-red-600'}`;

    let displayAmount = transaction.amount;
    let displayAmtCurrency = transaction.profileCurrency; // Original currency of the transaction's profile

    if (isAllProfilesView && transaction.profileCurrency !== displayCurrencyForAggregation) {
        displayAmount = convertCurrency(transaction.amount, transaction.profileCurrency, displayCurrencyForAggregation, exchangeRatesData);
        displayAmtCurrency = displayCurrencyForAggregation;
    }
    amountSpan.textContent = formatCurrency(displayAmount, displayAmtCurrency);
    amountDiv.appendChild(amountSpan);

    // Controls (Edit/Delete) - always use transaction.profileId for context
    if (transaction.profileId) { // Ensure profileId is part of the transaction object passed here
        const controls = document.createElement('div');
        controls.className = 'flex gap-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'p-1.5 rounded-md'; editBtn.title = "Edit";
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
        editBtn.style.color = 'var(--text-secondary)';
        editBtn.onmouseover = () => { editBtn.style.backgroundColor = 'var(--bg-tertiary)'; editBtn.style.color = 'var(--text-accent)'; };
        editBtn.onmouseout = () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = 'var(--text-secondary)'; };
        editBtn.onclick = () => onEdit(transaction.type, transaction, transaction.profileId);
        controls.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'p-1.5 rounded-md'; delBtn.title = "Delete";
        delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
        delBtn.style.color = 'var(--text-secondary)';
        delBtn.onmouseover = () => { delBtn.style.backgroundColor = 'var(--bg-tertiary)'; delBtn.style.color = 'var(--text-danger)'; };
        delBtn.onmouseout = () => { delBtn.style.backgroundColor = 'transparent'; delBtn.style.color = 'var(--text-secondary)'; };
        delBtn.onclick = () => onDelete(transaction.profileId, transaction.id);
        controls.appendChild(delBtn);
        amountDiv.appendChild(controls);
    }
    item.appendChild(amountDiv);
    return item;
}


/**
 * Renders the list of transactions based on the active profile and date window.
 * @param {function} onEditTransaction - Callback for edit action.
 * @param {function} onDeleteTransaction - Callback for delete action.
 */
export function renderTransactionsList(onEditTransaction, onDeleteTransaction) {
    const appFullState = getAppState();
    const activeProfileId = getActiveProfileId();
    const profiles = appFullState.profiles; // All profiles
    const exchangeRatesData = getExchangeRates();
    const displayCurrencyForAggregation = appFullState.settings.displayCurrency;

    const { startDate, endDate } = getActiveDateWindow();
    dom.transactionsListEl.innerHTML = '';

    let transactionsToDisplay = [];

    const filterAndMapTransactions = (profileTransactions, profile) => {
        return profileTransactions
            .filter(t => {
                const tDate = new Date(t.date); // Dates are stored as ISO strings
                let include = true;
                if (startDate && tDate < startDate) include = false;
                if (endDate && tDate > endDate) include = false;
                return include;
            })
            .map(tx => ({
                ...tx,
                profileName: profile.name, // Add profile context
                profileCurrency: profile.currency,
                profileId: profile.id // Crucial for edit/delete context
            }));
    };

    if (activeProfileId === 'all') {
        profiles.forEach(p => {
            transactionsToDisplay.push(...filterAndMapTransactions(p.transactions, p));
        });
    } else {
        const currentProfile = getProfileById(activeProfileId);
        if (currentProfile) {
            transactionsToDisplay = filterAndMapTransactions(currentProfile.transactions, currentProfile);
        }
    }

    // Sort all transactions by date (most recent first)
    transactionsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));


    if (transactionsToDisplay.length === 0) {
        dom.noTransactionsMessage.textContent = "No transactions in the selected period.";
        dom.noTransactionsMessage.style.display = 'block';
    } else {
        dom.noTransactionsMessage.style.display = 'none';
        transactionsToDisplay.forEach(t => {
            const listItem = createTransactionListItem(
                t,
                activeProfileId === 'all',
                displayCurrencyForAggregation,
                exchangeRatesData,
                onEditTransaction,
                onDeleteTransaction
            );
            dom.transactionsListEl.appendChild(listItem);
        });
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

/**
 * Populates the transaction category dropdown based on transaction type.
 * @param {string} transactionType - 'income' or 'outcome'.
 */
function populateTransactionCategoryDropdown(transactionType) {
    const categories = getCategories(); // from categoryState
    dom.transactionCategoryInput.innerHTML = '<option value="">-- Select Category --</option>';

    const filteredCategories = categories.filter(c =>
        c.type === transactionType || c.type === 'universal'
    );
    filteredCategories.sort((a, b) => a.name.localeCompare(b.name));

    filteredCategories.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        dom.transactionCategoryInput.appendChild(option);
    });
}


/**
 * Populates the transaction modal form for adding or editing.
 * @param {string} type - 'income' or 'outcome'.
 * @param {object | null} transactionToEdit - The transaction to edit, or null for new.
 * @param {string} profileForTransactionId - The ID of the profile this transaction belongs to.
 */
export function populateTransactionModalForm(type, transactionToEdit, profileForTransactionId) {
    const profile = getProfileById(profileForTransactionId); // from profileState
    if (!profile) {
        alert("Profile context for transaction not found. Cannot open modal.");
        console.error("Profile not found for ID:", profileForTransactionId);
        return;
    }

    updateAppState('ui.editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    // Store the profile ID for which this modal is being opened, crucial for form submission
    // This could be a temporary state in appState.ui if needed by handlers directly
    // updateAppState('ui.activeProfileIdForTransactionModal', profileForTransactionId);


    dom.transactionModalTitle.textContent = transactionToEdit
        ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`
        : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    dom.transactionForm.reset();
    dom.transactionTypeInput.value = type; // Hidden input
    dom.transactionAmountInput.placeholder = `Amount in ${profile.currency}`;

    populateTransactionCategoryDropdown(type);

    if (transactionToEdit) {
        dom.transactionIdInput.value = transactionToEdit.id;
        dom.transactionDescriptionInput.value = transactionToEdit.description;
        dom.transactionAmountInput.value = transactionToEdit.amount;
        dom.transactionCategoryInput.value = transactionToEdit.categoryId || '';
        dom.transactionDateInput.value = transactionToEdit.date
            ? formatDateForInput(transactionToEdit.date, true) // Use true for datetime-local
            : formatDateForInput(new Date(), true);
        dom.transactionIsReimbursedInput.checked = transactionToEdit.isReimbursed || false;
    } else {
        dom.transactionIdInput.value = ''; // For new transaction
        dom.transactionCategoryInput.value = ''; // Default to no category selected
        dom.transactionDateInput.value = formatDateForInput(new Date(), true); // Default to now
        dom.transactionIsReimbursedInput.checked = false;
    }

    // Show/hide reimbursement section
    if (type === 'outcome') {
        dom.reimbursementSection.classList.remove('hidden');
    } else {
        dom.reimbursementSection.classList.add('hidden');
    }
}