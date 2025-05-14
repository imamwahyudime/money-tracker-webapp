// js/ui.js
import * as dom from './domElements.js';
import * as state from './state.js';
import { formatCurrency, formatDateTime, convertCurrency, formatDateForInput, getFormattedDateRange } from './utils.js';
import { CURRENCY_SYMBOLS, DEFAULT_FINANCIAL_MONTH_START_DAY } from './config.js';

/**
 * Calculates the actual start and end dates for filtering transactions.
 * @returns {{startDate: Date | null, endDate: Date | null}}
 */
function getActiveDateWindow() {
    const { projectionDate: projectionDateString, activeProfileId } = state.getState();
    const activeProfile = state.getActiveProfile();
    // console.log('[Debug] getActiveDateWindow Input:', { projectionDateString, activeProfileId, financialMonthStartDay: activeProfile?.financialMonthStartDay });

    let today = new Date(); // Current moment

    let effectiveEndDate;
    if (projectionDateString) {
        const projDate = new Date(projectionDateString);
        effectiveEndDate = new Date(projDate.getUTCFullYear(), projDate.getUTCMonth(), projDate.getUTCDate(), 23, 59, 59, 999);
    } else {
        effectiveEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    }

    let effectiveStartDate = null;

    if (activeProfileId === 'all') {
        effectiveStartDate = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), 1, 0, 0, 0, 0);
    } else if (activeProfile) {
        const monthStartDay = activeProfile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
        const anchorDate = projectionDateString ? new Date(new Date(projectionDateString).getUTCFullYear(), new Date(projectionDateString).getUTCMonth(), new Date(projectionDateString).getUTCDate()) : today;

        let currentYear = anchorDate.getFullYear();
        let currentMonth = anchorDate.getMonth();

        effectiveStartDate = new Date(currentYear, currentMonth, monthStartDay, 0, 0, 0, 0);

        if (anchorDate.getDate() < monthStartDay) {
            currentMonth -= 1;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear -= 1;
            }
            effectiveStartDate = new Date(currentYear, currentMonth, monthStartDay, 0, 0, 0, 0);
        }
    } else {
        effectiveStartDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    }

    if (effectiveStartDate && effectiveEndDate && effectiveEndDate < effectiveStartDate) {
        // console.warn('[Debug] Correcting startDate because endDate < startDate. Original Start:', effectiveStartDate, 'End:', effectiveEndDate);
        effectiveStartDate = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate(), 0, 0, 0, 0);
    }
    // console.log('[Debug] getActiveDateWindow Output:', { startDate: effectiveStartDate, endDate: effectiveEndDate });
    return { startDate: effectiveStartDate, endDate: effectiveEndDate };
}


/**
 * Renders the entire application UI based on the current state.
 */
export function renderApp() {
    // console.log("renderApp called. Current state:", state.getState());
    const appState = state.getState();

    if (appState.projectionDate) {
        dom.projectionDateInput.value = formatDateForInput(appState.projectionDate);
    } else {
        dom.projectionDateInput.value = '';
    }

    renderProfilesList();
    renderDashboardHeader();
    renderDashboardSummary();
    renderTransactionsList();
    renderExchangeRateInfo(); // This was the missing function call point
    dom.appDisplayCurrencySelect.value = appState.displayCurrency;
    // console.log("App rendering complete.");
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
       lucide.createIcons();
    }
}

function renderProfilesList() {
    const { profiles, activeProfileId } = state.getState();
    dom.profilesListEl.innerHTML = '';
    if (profiles.length === 0) {
        const p = document.createElement('p'); p.textContent = 'No profiles yet.'; p.className = 'text-sm text-slate-500 px-3 py-2'; dom.profilesListEl.appendChild(p);
    } else {
        profiles.forEach(profile => {
            const itemContainer = document.createElement('div'); itemContainer.className = `profile-item p-3 rounded-md cursor-pointer border border-transparent hover:border-sky-300 flex justify-between items-center text-sm ${profile.id === activeProfileId ? 'active' : ''}`; itemContainer.dataset.profileId = profile.id;
            const nameSpan = document.createElement('span'); nameSpan.className = 'profile-name font-medium text-slate-700 truncate flex-grow mr-2'; nameSpan.textContent = profile.name;
            nameSpan.addEventListener('click', (e) => { e.stopPropagation(); state.updateState('activeProfileId', profile.id); state.saveData(); renderApp(); });
            itemContainer.appendChild(nameSpan);
            const controlsDiv = document.createElement('div'); controlsDiv.className = 'flex items-center gap-1 flex-shrink-0';
            const editBtn = document.createElement('button'); editBtn.className = 'p-1 text-slate-500 hover:text-sky-600 rounded-md hover:bg-sky-100'; editBtn.title = `Edit: ${profile.name}`; editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); openProfileModal(profile.id); }); controlsDiv.appendChild(editBtn);
            const delBtn = document.createElement('button'); delBtn.className = 'p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100'; delBtn.title = `Delete: ${profile.name}`;
            delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
            delBtn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteProfile(profile.id, profile.name); }); controlsDiv.appendChild(delBtn);
            itemContainer.appendChild(controlsDiv);
            itemContainer.addEventListener('click', (event) => { if (!event.target.closest('button')) { state.updateState('activeProfileId', profile.id); state.saveData(); renderApp(); } });
            dom.profilesListEl.appendChild(itemContainer);
        });
    }
}

function renderDashboardHeader() {
    const { activeProfileId, displayCurrency, exchangeRates } = state.getState();
    const activeProfile = state.getActiveProfile();
    const { startDate, endDate } = getActiveDateWindow();

    if (activeProfileId === 'all') {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - All Profiles';
        dom.profileCurrencyInfoDisplay.textContent = `Totals converted to ${displayCurrency}. Rates (vs ${exchangeRates.base}) last updated: ${formatDateTime(exchangeRates.lastUpdated)}`;
    } else if (activeProfile) {
        dom.currentProfileNameDisplay.textContent = `Dashboard - ${activeProfile.name}`;
        const finMonthStartDay = activeProfile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
        dom.profileCurrencyInfoDisplay.textContent = `Currency: ${activeProfile.currency}. Financial month starts day ${finMonthStartDay}.`;
    } else {
        dom.currentProfileNameDisplay.textContent = 'Dashboard';
        dom.profileCurrencyInfoDisplay.textContent = 'Please select a profile.';
        // Removed problematic auto-switch for now, ensure UI guides user or defaults safely.
    }
    dom.activeDateRangeDisplay.textContent = `Displaying: ${getFormattedDateRange(startDate, endDate)}`;
}

function renderDashboardSummary() {
    const { profiles, activeProfileId, displayCurrency, exchangeRates } = state.getState();
    const { startDate, endDate } = getActiveDateWindow();
    // console.log('[Debug] Summary Calculation Window:', { startDate, endDate });

    let totalIncome = 0, totalOutcome = 0;
    let targetDisplayCurrency = displayCurrency;

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
        profiles.forEach(p => {
            const filteredTransactions = filterTransactionsByDate(p.transactions);
            filteredTransactions.forEach(t => {
                const convertedAmount = convertCurrency(t.amount, p.currency, targetDisplayCurrency, exchangeRates);
                if (t.type === 'income') {
                    totalIncome += convertedAmount;
                } else if (t.type === 'outcome') {
                    if (t.isReimbursed) {
                        totalIncome += convertedAmount;
                    } else {
                        totalOutcome += convertedAmount;
                    }
                }
            });
        });
    } else {
        const currentProfile = state.getActiveProfile();
        if (currentProfile) {
            targetDisplayCurrency = currentProfile.currency;
            const filteredTransactions = filterTransactionsByDate(currentProfile.transactions);
            filteredTransactions.forEach(t => {
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
}

function renderTransactionsList() {
    const { profiles, activeProfileId, exchangeRates, displayCurrency } = state.getState();
    const { startDate, endDate } = getActiveDateWindow();
    // console.log('[Debug] Transaction List Window:', { startDate, endDate });
    dom.transactionsListEl.innerHTML = '';

    let transactionsToDisplay = [];

    const filterAndMapTransactions = (profileTransactions, profile) => {
        return profileTransactions.filter(t => {
            const tDate = new Date(t.date);
            let include = true;
            if (startDate && tDate < startDate) include = false;
            if (endDate && tDate > endDate) include = false;
            return include;
        }).map(tx => ({
            ...tx,
            profileName: profile.name,
            profileCurrency: profile.currency,
            profileId: profile.id
        }));
    };

    if (activeProfileId === 'all') {
        profiles.forEach(p => {
            transactionsToDisplay.push(...filterAndMapTransactions(p.transactions, p));
        });
        transactionsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        const currentProfile = state.getActiveProfile();
        if (currentProfile) {
            transactionsToDisplay = filterAndMapTransactions(currentProfile.transactions, currentProfile);
            transactionsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    if (transactionsToDisplay.length === 0) {
        dom.noTransactionsMessage.textContent = (activeProfileId && activeProfileId !== 'all' && state.getActiveProfile())
            ? "No transactions in the selected period."
            : "No transactions to display for the selected period.";
        dom.noTransactionsMessage.style.display = 'block';
        dom.transactionsListEl.appendChild(dom.noTransactionsMessage);
        return;
    }

    dom.noTransactionsMessage.style.display = 'none';
    transactionsToDisplay.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item flex flex-col sm:flex-row justify-between items-start sm:items-center p-4';
        if (t.type === 'outcome' && t.isReimbursed) {
            item.classList.add('transaction-reimbursed');
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'mb-2 sm:mb-0 flex-grow';

        const descP = document.createElement('p');
        descP.className = 'font-medium text-slate-800';
        let descriptionText = t.description;
        if (activeProfileId === 'all' && t.profileName) {
            descriptionText += ` (${t.profileName})`;
        }
        if (t.type === 'outcome' && t.isReimbursed) {
            descriptionText += ' (Reimbursed)';
        }
        descP.textContent = descriptionText;
        infoDiv.appendChild(descP);

        const categoryObj = state.getCategoryById(t.categoryId);
        const categoryName = categoryObj ? categoryObj.name : 'Uncategorized';
        const dateCatP = document.createElement('p');
        dateCatP.className = 'text-xs text-slate-500';
        dateCatP.textContent = `${formatDateTime(t.date)} - ${t.type.charAt(0).toUpperCase() + t.type.slice(1)} - ${categoryName}`;
        infoDiv.appendChild(dateCatP); item.appendChild(infoDiv);

        const amountDiv = document.createElement('div');
        amountDiv.className = 'flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end sm:justify-normal';

        const amountSpan = document.createElement('span');
        amountSpan.className = `font-semibold text-lg ${t.type === 'income' || (t.type === 'outcome' && t.isReimbursed) ? 'text-green-600' : 'text-red-600'}`;
        
        let displayAmount = t.amount;
        let displayAmtCurrency = t.profileCurrency;
        if (activeProfileId === 'all' && t.profileCurrency !== displayCurrency) {
             displayAmount = convertCurrency(t.amount, t.profileCurrency, displayCurrency, exchangeRates);
             displayAmtCurrency = displayCurrency;
        }
        amountSpan.textContent = formatCurrency(displayAmount, displayAmtCurrency);
        amountDiv.appendChild(amountSpan);

        const currentViewingProfileId = activeProfileId === 'all' ? t.profileId : activeProfileId;
        if (currentViewingProfileId && currentViewingProfileId !== 'all') {
            const controls = document.createElement('div'); controls.className = 'flex gap-2';
            const editBtn = document.createElement('button'); editBtn.className = 'p-1.5 text-sky-600 hover:text-sky-700 rounded-md hover:bg-sky-100'; editBtn.title = "Edit"; editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
            editBtn.onclick = () => openTransactionModal(t.type, t, currentViewingProfileId); controls.appendChild(editBtn);
            const delBtn = document.createElement('button'); delBtn.className = 'p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100'; delBtn.title = "Delete"; delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
            delBtn.onclick = () => handleDeleteTransaction(currentViewingProfileId, t.id); controls.appendChild(delBtn); amountDiv.appendChild(controls);
        } item.appendChild(amountDiv); dom.transactionsListEl.appendChild(item);
    });
     if (typeof lucide !== 'undefined' && lucide.createIcons) { lucide.createIcons(); }
}

// THIS IS THE FUNCTION THAT WAS LIKELY MISSING OR THE FILE WAS TRUNCATED BEFORE IT
function renderExchangeRateInfo() {
    const { exchangeRates } = state.getState();
    dom.exchangeRateBaseDisplay.textContent = exchangeRates.base;
    dom.exchangeRateTimestampDisplay.textContent = exchangeRates.lastUpdated ? formatDateTime(exchangeRates.lastUpdated) : 'N/A';
}

function populateCategoryDropdown(transactionType) {
    const { categories } = state.getState();
    dom.transactionCategoryInput.innerHTML = '<option value="">-- Select Category --</option>';
    const filtered = categories.filter(c => c.type === transactionType || c.type === 'universal');
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    filtered.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; dom.transactionCategoryInput.appendChild(opt); });
}

// --- Modal Management ---
export function openProfileModal(profileToEditId = null) {
    state.updateState('editingProfileId', profileToEditId);
    dom.profileModalTitle.textContent = profileToEditId ? 'Edit Profile' : 'Add New Profile';
    dom.profileForm.reset();
    const appState = state.getState();

    if (profileToEditId) {
        const profile = state.getProfileById(profileToEditId);
        if (profile) {
            dom.profileIdInput.value = profile.id;
            dom.profileNameInput.value = profile.name;
            dom.profileCurrencyInput.value = profile.currency;
            dom.profileFinancialMonthStartDayInput.value = profile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
        } else {
            console.error(`Profile ${profileToEditId} not found`);
            state.updateState('editingProfileId', null);
            dom.profileIdInput.value = '';
            dom.profileCurrencyInput.value = appState.displayCurrency;
            dom.profileFinancialMonthStartDayInput.value = DEFAULT_FINANCIAL_MONTH_START_DAY;
        }
    } else {
        dom.profileIdInput.value = '';
        dom.profileCurrencyInput.value = appState.displayCurrency;
        dom.profileFinancialMonthStartDayInput.value = DEFAULT_FINANCIAL_MONTH_START_DAY;
    }
    dom.profileModal.classList.add('modal-open');
    dom.profileNameInput.focus();
}
export function closeProfileModal() { dom.profileModal.classList.remove('modal-open'); state.updateState('editingProfileId', null); }

export function openTransactionModal(type, transactionToEdit = null, profileContextId = null) {
    const currentActiveProfileId = state.getState().activeProfileId;
    const targetProfileId = (currentActiveProfileId === 'all' && transactionToEdit) ? transactionToEdit.profileId : (profileContextId || currentActiveProfileId) ;

    if (!targetProfileId || targetProfileId === 'all') {
         alert("Please select a specific profile to add or edit a transaction."); return;
    }
    const profileForTransaction = state.getProfileById(targetProfileId);
    if(!profileForTransaction) {
        alert("Profile context for transaction not found."); return;
    }

    state.updateState('editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    state.updateState('activeProfileIdForTransactionModal', targetProfileId);

    dom.transactionModalTitle.textContent = transactionToEdit ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    dom.transactionForm.reset();
    dom.transactionTypeInput.value = type;
    dom.transactionAmountInput.placeholder = `Amount in ${profileForTransaction.currency}`;

    populateCategoryDropdown(type);

    if (transactionToEdit) {
        dom.transactionIdInput.value = transactionToEdit.id;
        dom.transactionDescriptionInput.value = transactionToEdit.description;
        dom.transactionAmountInput.value = transactionToEdit.amount;
        dom.transactionCategoryInput.value = transactionToEdit.categoryId || '';
        dom.transactionDateInput.value = transactionToEdit.date ? formatDateForInput(transactionToEdit.date, true) : formatDateForInput(new Date(), true);
        dom.transactionIsReimbursedInput.checked = transactionToEdit.isReimbursed || false;
    } else {
        dom.transactionIdInput.value = '';
        dom.transactionCategoryInput.value = '';
        dom.transactionDateInput.value = formatDateForInput(new Date(), true);
        dom.transactionIsReimbursedInput.checked = false;
    }

    if (type === 'outcome') {
        dom.reimbursementSection.classList.remove('hidden');
    } else {
        dom.reimbursementSection.classList.add('hidden');
    }

    dom.transactionModal.classList.add('modal-open');
    dom.transactionDescriptionInput.focus();
}
export function closeTransactionModal() {
    dom.transactionModal.classList.remove('modal-open');
    state.updateState('editingTransactionId', null);
    state.updateState('activeProfileIdForTransactionModal', null);
}

export function openCategoryModal() { state.updateState('editingCategoryId', null); resetCategoryForm(); renderCategoriesList(); dom.categoryModal.classList.add('modal-open'); dom.categoryNameInput.focus(); }
export function closeCategoryModal() { dom.categoryModal.classList.remove('modal-open'); state.updateState('editingCategoryId', null); }

function renderCategoriesList() {
    const { categories } = state.getState(); dom.categoriesList.innerHTML = '';
    categories.sort((a,b) => (a.id === 'cat_uncategorized') ? -1 : (b.id === 'cat_uncategorized') ? 1 : (a.type < b.type) ? -1 : (a.type > b.type) ? 1 : a.name.localeCompare(b.name));
    if (categories.length === 0) { dom.categoriesList.innerHTML = '<p>No categories.</p>'; return; }
    categories.forEach(cat => {
        const item = document.createElement('div'); item.className = 'category-item flex justify-between items-center p-2 border-b border-slate-100 last:border-b-0';
        const info = document.createElement('span'); info.className = 'text-sm'; info.textContent = `${cat.name} (${cat.type.charAt(0).toUpperCase() + cat.type.slice(1)})`; item.appendChild(info);
        if (cat.id !== 'cat_uncategorized') {
            const controls = document.createElement('div'); controls.className = 'flex items-center gap-1.5 flex-shrink-0';
            const editBtn = document.createElement('button'); editBtn.className = 'p-1 text-slate-500 hover:text-sky-600 rounded-md hover:bg-sky-100'; editBtn.title = `Edit: ${cat.name}`; editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`; editBtn.onclick = () => startEditCategory(cat); controls.appendChild(editBtn);
            const delBtn = document.createElement('button'); delBtn.className = 'p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100'; delBtn.title = `Delete: ${cat.name}`; delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`; delBtn.onclick = () => handleDeleteCategory(cat.id, cat.name); controls.appendChild(delBtn); item.appendChild(controls);
        } else { const ph = document.createElement('div'); ph.className = 'w-16'; item.appendChild(ph); }
        dom.categoriesList.appendChild(item);
    });
}
function startEditCategory(category) { state.updateState('editingCategoryId', category.id); dom.categoryIdInput.value = category.id; dom.categoryNameInput.value = category.name; dom.categoryTypeInput.value = category.type; dom.saveCategoryBtnText.textContent = 'Save Changes'; dom.cancelEditCategoryBtn.classList.remove('hidden'); dom.categoryNameInput.focus(); }
export function resetCategoryForm() { state.updateState('editingCategoryId', null); dom.categoryForm.reset(); dom.categoryIdInput.value = ''; dom.saveCategoryBtnText.textContent = 'Add Category'; dom.cancelEditCategoryBtn.classList.add('hidden'); }

// --- Exchange Rate Modal Management ---
export function openExchangeRatesModal() { renderExchangeRatesForm(); dom.exchangeRateModal.classList.add('modal-open'); }
export function closeExchangeRatesModal() { dom.exchangeRateModal.classList.remove('modal-open'); }
function renderExchangeRatesForm() {
    const { exchangeRates } = state.getState(); const { base, rates } = exchangeRates;
    dom.rateBaseCurrencySelect.innerHTML = ''; Object.keys(CURRENCY_SYMBOLS).forEach(code => { const opt = document.createElement('option'); opt.value = code; opt.textContent = code; if (code === base) opt.selected = true; dom.rateBaseCurrencySelect.appendChild(opt); });
    dom.formBaseCurrencyLabel.textContent = base;
    dom.exchangeRatesListContainer.innerHTML = ''; const allAppCurrencies = new Set(Object.keys(CURRENCY_SYMBOLS)); const displayOrder = Array.from(allAppCurrencies).sort();
    displayOrder.forEach(code => {
        const itemDiv = document.createElement('div'); itemDiv.className = 'rate-item grid grid-cols-3 items-center gap-2 py-1';
        const lbl = document.createElement('label'); lbl.htmlFor = `rate-input-${code}`; lbl.className = 'block text-sm font-medium text-slate-700 col-span-1'; lbl.textContent = `${code}:`; itemDiv.appendChild(lbl);
        const inp = document.createElement('input'); inp.type = 'number'; inp.id = `rate-input-${code}`; inp.name = code; inp.step = 'any'; inp.min = '0.000001'; inp.className = 'w-full p-2 border border-slate-300 rounded-md shadow-sm col-span-2 focus:ring-sky-500 focus:border-sky-500';
        inp.value = rates[code] !== undefined ? rates[code] : '';
        if (code === base) { inp.value = '1'; inp.readOnly = true; inp.classList.add('bg-slate-100', 'cursor-not-allowed'); }
        itemDiv.appendChild(inp); dom.exchangeRatesListContainer.appendChild(itemDiv);
    });
    dom.rateBaseCurrencySelect.onchange = () => {
        const newSelectedBase = dom.rateBaseCurrencySelect.value;
        dom.formBaseCurrencyLabel.textContent = newSelectedBase;
        const inputs = dom.exchangeRatesListContainer.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => {
            if (inp.name === newSelectedBase) { inp.value = '1'; inp.readOnly = true; inp.classList.add('bg-slate-100', 'cursor-not-allowed'); }
            else { inp.readOnly = false; inp.classList.remove('bg-slate-100', 'cursor-not-allowed'); }
        });
    };
}

// --- Form Handlers ---
export function handleProfileFormSubmit(event) {
    event.preventDefault();
    const name = dom.profileNameInput.value.trim();
    const currency = dom.profileCurrencyInput.value;
    const financialMonthStartDay = parseInt(dom.profileFinancialMonthStartDayInput.value, 10);
    const id = state.getState().editingProfileId;

    if (!name) { alert("Profile name required."); return; }
    if (isNaN(financialMonthStartDay) || financialMonthStartDay < 1 || financialMonthStartDay > 31) {
        alert("Financial month start day must be between 1 and 31.");
        return;
    }

    if (id) { state.updateProfile(id, { name, currency, financialMonthStartDay }); }
    else { state.addProfile(name, currency, financialMonthStartDay); }
    state.saveData(); renderApp(); closeProfileModal();
}
export function handleTransactionFormSubmit(event) {
    event.preventDefault();
    const desc = dom.transactionDescriptionInput.value.trim();
    const amount = parseFloat(dom.transactionAmountInput.value);
    const catId = dom.transactionCategoryInput.value;
    const dateString = dom.transactionDateInput.value;
    const type = dom.transactionTypeInput.value;
    const isReimbursed = dom.transactionIsReimbursedInput.checked;
    const editId = state.getState().editingTransactionId;
    const profileId = state.getState().activeProfileIdForTransactionModal || state.getState().activeProfileId;


    if (!desc || isNaN(amount) || amount <= 0 || !dateString || !catId) {
        alert("Please fill all fields correctly (Description, Amount, Category, Date)."); return;
    }
    if (!profileId || profileId === 'all') {
        alert("No specific profile context for this transaction. Please select a profile first."); return;
    }

    const date = new Date(dateString).toISOString();

    const data = { type, description: desc, amount, date, categoryId: catId, isReimbursed: (type === 'outcome' ? isReimbursed : false) };

    if (editId) { state.updateTransaction(profileId, editId, data); }
    else { state.addTransaction(profileId, data); }
    state.saveData(); renderApp(); closeTransactionModal();
}
export function handleCategoryFormSubmit(event) {
    event.preventDefault(); const name = dom.categoryNameInput.value.trim(); const type = dom.categoryTypeInput.value; const id = state.getState().editingCategoryId;
    if (!name || !type) { alert("Name and type required."); return; }
    let success = false; let op = '';
    if (id) { op = 'update'; const updated = state.updateCategory(id, { name, type }); success = !!updated; }
    else { op = 'add'; const added = state.addCategory(name, type); success = !!added; }
    if (success) { state.saveData(); resetCategoryForm(); renderCategoriesList(); renderApp(); }
    else { alert(`Failed to ${op} category. Duplicate name/type?`); }
}
export function handleSaveExchangeRates(event) {
    event.preventDefault(); const formData = new FormData(dom.exchangeRateForm); const formRates = {}; let allValid = true; const newBase = dom.rateBaseCurrencySelect.value;
    for (const [key, val] of formData.entries()) {
        if (key === 'baseCurrency') continue;
        const rate = parseFloat(val);
        if (key === newBase && newBase === state.getState().exchangeRates.base) {
             formRates[key] = 1; continue;
        }
        if (isNaN(rate) || rate <= 0) {
            if (key === newBase && newBase !== state.getState().exchangeRates.base) { /* User is changing base, new base rate from form is crucial */ }
            else if (key !== newBase) { alert(`Invalid rate for ${key}. Must be a positive number.`); allValid = false; break; }
        }
        formRates[key] = rate;
    }
    if (allValid) { if (state.updateExchangeRates(newBase, formRates)) { state.saveData(); renderApp(); closeExchangeRatesModal(); alert("Rates saved!"); } }
}

// --- Delete Handlers ---
function handleDeleteProfile(profileId, profileName) {
    if (confirm(`Delete profile "${profileName}"? This deletes all its transactions.`)) {
        if (state.deleteProfile(profileId)) { state.saveData(); renderApp(); alert(`Profile "${profileName}" deleted.`); }
        else { alert("Failed to delete profile."); }
    }
}
function handleDeleteTransaction(profileId, transactionId) {
    if (confirm("Delete this transaction?")) {
        if (state.deleteTransaction(profileId, transactionId)) { state.saveData(); renderApp(); }
        else { alert("Failed to delete transaction."); }
    }
}
function handleDeleteCategory(categoryId, categoryName) {
    if (categoryId === 'cat_uncategorized') { alert("Cannot delete 'Uncategorized'."); return; }
    if (confirm(`Delete category "${categoryName}"? Transactions will be 'Uncategorized'.`)) {
        if (state.deleteCategory(categoryId)) { state.saveData(); renderCategoriesList(); renderApp(); alert(`Category "${categoryName}" deleted.`); }
        else { alert("Failed to delete category."); }
    }
}

// --- Import/Export Handlers ---
export function handleImportData(event) {
    const file = event.target.files[0]; if (!file) return; if (file.type !== "application/json") { alert("Invalid file type."); dom.importFile.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try { const data = JSON.parse(e.target.result);
            if (data && data.profiles && typeof data.activeProfileId !== 'undefined' && typeof data.displayCurrency !== 'undefined') {
                if (confirm("Overwrite current app data? This cannot be undone.")) { if (state.replaceState(data)) { state.saveData(); renderApp(); alert("App data import successful!"); } else { alert("Import failed: Invalid data structure or values."); } }
            } else { alert("Invalid JSON structure for app data."); }
        } catch (err) { console.error(err); alert("Error parsing import file. Ensure it's valid JSON."); }
        finally { dom.importFile.value = null; }
    }; reader.onerror = () => { alert("Error reading file."); dom.importFile.value = null; }; reader.readAsText(file);
}
export function handleExportData() {
    const data = state.getState();
    if (data.profiles.length === 0 && !confirm("No profile data exists. Export an empty structure?")) return;
    const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_'); a.download = `money_tracker_app_data_${ts}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert("App data export successful!");
}

export function handleImportExchangeRatesFile(event) {
    const file = event.target.files[0]; if (!file) { console.log("No file selected for importing rates."); return; }
    if (file.type !== "application/json") { alert("Invalid file type. Please select a JSON file for exchange rates."); dom.importRatesFile.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedRatesData = JSON.parse(e.target.result);
            if (importedRatesData && importedRatesData.base && importedRatesData.rates && typeof importedRatesData.rates === 'object' && importedRatesData.lastUpdated) {
                if (confirm(`Importing this rates file will overwrite your current exchange rates. Base: ${importedRatesData.base}. Are you sure?`)) {
                    const success = state.replaceExchangeRates(importedRatesData);
                    if (success) { state.saveData(); renderApp(); closeExchangeRatesModal(); alert("Exchange rates imported successfully!");
                    } else { alert("Failed to import exchange rates. The file structure or values might be incorrect (e.g., non-positive rates, base rate not 1 or inconsistent)."); }
                }
            } else { alert("Invalid JSON structure for exchange rates file. Expected { base: 'CUR', rates: {...}, lastUpdated: 'timestamp' }."); }
        } catch (error) { console.error("Error parsing JSON from imported rates file:", error); alert("Error reading or parsing the rates import file. Please ensure it's a valid JSON."); }
        finally { dom.importRatesFile.value = null; }
    };
    reader.onerror = () => { alert("Error reading the rates file."); dom.importRatesFile.value = null; };
    reader.readAsText(file);
}

export function handleExportExchangeRatesFile() {
    const ratesData = state.getExchangeRatesState();
    const jsonData = JSON.stringify(ratesData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.download = `money_tracker_exchange_rates_${ratesData.base}_${timestamp}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    console.log("Exchange rates exported successfully.");
    alert("Exchange rates exported successfully! Check your downloads folder.");
}