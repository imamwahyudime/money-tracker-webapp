// js/ui.js
import * as dom from './domElements.js';
import * as state from './state.js';
import { formatCurrency, formatDateTime, convertCurrency } from './utils.js'; 
import { CURRENCY_SYMBOLS } from './config.js'; 

/**
 * Renders the entire application UI based on the current state.
 */
export function renderApp() {
    console.log("renderApp called. Current state:", state.getState());
    renderProfilesList();
    renderDashboardHeader();
    renderDashboardSummary();
    renderTransactionsList();
    renderExchangeRateInfo(); 
    dom.appDisplayCurrencySelect.value = state.getState().displayCurrency; 
    console.log("App rendering complete.");
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
       lucide.createIcons(); 
    }
}

function renderProfilesList() { /* ... (no changes from part 9) ... */ 
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
function renderDashboardHeader() { /* ... (no changes from part 10) ... */ 
    const { activeProfileId, displayCurrency, exchangeRates } = state.getState(); 
    const activeProfile = state.getActiveProfile(); 
    if (activeProfileId === 'all') {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - All Profiles';
        dom.profileCurrencyInfoDisplay.textContent = `Totals converted to ${displayCurrency}. Rates (vs ${exchangeRates.base}) last updated: ${formatDateTime(exchangeRates.lastUpdated)}`;
    } else if (activeProfile) {
        dom.currentProfileNameDisplay.textContent = `Dashboard - ${activeProfile.name}`;
        dom.profileCurrencyInfoDisplay.textContent = `Currency: ${activeProfile.currency}`;
    } else {
        dom.currentProfileNameDisplay.textContent = 'Dashboard';
        dom.profileCurrencyInfoDisplay.textContent = 'Please select a profile.';
        if(activeProfileId !== 'all') { state.updateState('activeProfileId', 'all'); state.saveData(); }
    }
}
function renderDashboardSummary() { /* ... (no changes from part 10) ... */ 
    const { profiles, activeProfileId, displayCurrency, exchangeRates } = state.getState();
    let totalIncome = 0, totalOutcome = 0; let targetDisplayCurrency = displayCurrency;
    if (activeProfileId === 'all') {
        profiles.forEach(p => { p.transactions.forEach(t => { const converted = convertCurrency(t.amount, p.currency, targetDisplayCurrency, exchangeRates); if (t.type === 'income') totalIncome += converted; else totalOutcome += converted; }); });
    } else {
        const currentProfile = state.getActiveProfile();
        if (currentProfile) { targetDisplayCurrency = currentProfile.currency; currentProfile.transactions.forEach(t => { if (t.type === 'income') totalIncome += t.amount; else totalOutcome += t.amount; }); }
    }
    dom.totalIncomeDisplay.textContent = formatCurrency(totalIncome, targetDisplayCurrency);
    dom.totalOutcomeDisplay.textContent = formatCurrency(totalOutcome, targetDisplayCurrency);
    dom.netBalanceDisplay.textContent = formatCurrency(totalIncome - totalOutcome, targetDisplayCurrency);
}
function renderTransactionsList() { /* ... (no changes from part 9) ... */ 
    const { profiles, activeProfileId } = state.getState(); 
    dom.transactionsListEl.innerHTML = ''; 
    let transactionsToDisplay = [];
    if (activeProfileId === 'all') {
        profiles.forEach(p => transactionsToDisplay.push(...p.transactions.map(tx => ({ ...tx, profileName: p.name, profileCurrency: p.currency }))));
        transactionsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        const p = state.getActiveProfile();
        if (p) { transactionsToDisplay = [...p.transactions.map(tx => ({...tx, profileCurrency: p.currency}))]; transactionsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date)); }
    }
    if (transactionsToDisplay.length === 0) {
        dom.noTransactionsMessage.textContent = (activeProfileId && activeProfileId !== 'all' && state.getActiveProfile()) ? "No transactions yet..." : "No transactions to display.";
        dom.noTransactionsMessage.style.display = 'block'; dom.transactionsListEl.appendChild(dom.noTransactionsMessage); return;
    }
    dom.noTransactionsMessage.style.display = 'none';
    transactionsToDisplay.forEach(t => {
        const item = document.createElement('div'); item.className = 'transaction-item flex flex-col sm:flex-row justify-between items-start sm:items-center p-4';
        const infoDiv = document.createElement('div'); infoDiv.className = 'mb-2 sm:mb-0 flex-grow';
        const descP = document.createElement('p'); descP.className = 'font-medium text-slate-800'; descP.textContent = t.description + (activeProfileId === 'all' && t.profileName ? ` (${t.profileName})` : ''); infoDiv.appendChild(descP);
        const categoryObj = state.getCategoryById(t.categoryId); const categoryName = categoryObj ? categoryObj.name : 'Uncategorized';
        const dateCatP = document.createElement('p'); dateCatP.className = 'text-xs text-slate-500'; dateCatP.textContent = `${formatDateTime(t.date)} - ${t.type.charAt(0).toUpperCase() + t.type.slice(1)} - ${categoryName}`; infoDiv.appendChild(dateCatP); item.appendChild(infoDiv);
        const amountDiv = document.createElement('div'); amountDiv.className = 'flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end sm:justify-normal';
        const amountSpan = document.createElement('span'); amountSpan.className = `font-semibold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`; amountSpan.textContent = formatCurrency(t.amount, t.profileCurrency); amountDiv.appendChild(amountSpan);
        if (activeProfileId !== 'all') { 
            const controls = document.createElement('div'); controls.className = 'flex gap-2';
            const editBtn = document.createElement('button'); editBtn.className = 'p-1.5 text-sky-600 hover:text-sky-700 rounded-md hover:bg-sky-100'; editBtn.title = "Edit"; editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`; editBtn.onclick = () => openTransactionModal(t.type, t); controls.appendChild(editBtn);
            const delBtn = document.createElement('button'); delBtn.className = 'p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100'; delBtn.title = "Delete"; delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`; delBtn.onclick = () => handleDeleteTransaction(activeProfileId, t.id); controls.appendChild(delBtn); amountDiv.appendChild(controls);
        } item.appendChild(amountDiv); dom.transactionsListEl.appendChild(item);
    });
}
function renderExchangeRateInfo() { /* ... (no changes from part 10) ... */ 
    const { exchangeRates } = state.getState();
    dom.exchangeRateBaseDisplay.textContent = exchangeRates.base;
    dom.exchangeRateTimestampDisplay.textContent = formatDateTime(exchangeRates.lastUpdated);
}
function populateCategoryDropdown(transactionType) { /* ... (no changes from part 9) ... */ 
    const { categories } = state.getState();
    dom.transactionCategoryInput.innerHTML = '<option value="">-- Select Category --</option>'; 
    const filtered = categories.filter(c => c.type === transactionType || c.type === 'universal');
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    filtered.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; dom.transactionCategoryInput.appendChild(opt); });
}

// --- Modal Management ---
export function openProfileModal(profileToEditId = null) { /* ... (no changes from part 9) ... */ 
    state.updateState('editingProfileId', profileToEditId);
    dom.profileModalTitle.textContent = profileToEditId ? 'Edit Profile' : 'Add New Profile';
    dom.profileForm.reset(); 
    if (profileToEditId) {
        const profile = state.getProfileById(profileToEditId);
        if (profile) { dom.profileIdInput.value = profile.id; dom.profileNameInput.value = profile.name; dom.profileCurrencyInput.value = profile.currency; } 
        else { console.error(`Profile ${profileToEditId} not found`); state.updateState('editingProfileId', null); dom.profileIdInput.value = ''; dom.profileCurrencyInput.value = state.getState().displayCurrency; }
    } else { dom.profileIdInput.value = ''; dom.profileCurrencyInput.value = state.getState().displayCurrency; }
    dom.profileModal.classList.add('modal-open'); dom.profileNameInput.focus();
}
export function closeProfileModal() { /* ... (no changes from part 9) ... */ 
    dom.profileModal.classList.remove('modal-open'); state.updateState('editingProfileId', null); 
}
export function openTransactionModal(type, transactionToEdit = null) { /* ... (no changes from part 9) ... */ 
    const activeProfile = state.getActiveProfile();
    if (!activeProfile) { alert("Please select a profile."); return; }
    state.updateState('editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    dom.transactionModalTitle.textContent = transactionToEdit ? `Edit ${type}` : `Add New ${type}`;
    dom.transactionForm.reset(); dom.transactionTypeInput.value = type; dom.transactionAmountInput.placeholder = `Amount in ${activeProfile.currency}`;
    populateCategoryDropdown(type); 
    if (transactionToEdit) {
        dom.transactionIdInput.value = transactionToEdit.id; dom.transactionDescriptionInput.value = transactionToEdit.description; dom.transactionAmountInput.value = transactionToEdit.amount; dom.transactionCategoryInput.value = transactionToEdit.categoryId || ''; 
        const dateForInput = new Date(transactionToEdit.date); dateForInput.setMinutes(dateForInput.getMinutes() - dateForInput.getTimezoneOffset()); dom.transactionDateInput.value = dateForInput.toISOString().slice(0,16);
    } else { 
        dom.transactionIdInput.value = ''; dom.transactionCategoryInput.value = ''; 
        const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); dom.transactionDateInput.value = now.toISOString().slice(0,16); 
    }
    dom.transactionModal.classList.add('modal-open'); dom.transactionDescriptionInput.focus();
}
export function closeTransactionModal() { /* ... (no changes from part 9) ... */ 
    dom.transactionModal.classList.remove('modal-open'); state.updateState('editingTransactionId', null); 
}
export function openCategoryModal() { /* ... (no changes from part 9) ... */ 
    state.updateState('editingCategoryId', null); resetCategoryForm(); renderCategoriesList(); dom.categoryModal.classList.add('modal-open'); dom.categoryNameInput.focus();
}
export function closeCategoryModal() { /* ... (no changes from part 9) ... */ 
    dom.categoryModal.classList.remove('modal-open'); state.updateState('editingCategoryId', null); 
}
function renderCategoriesList() { /* ... (no changes from part 9) ... */ 
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
function startEditCategory(category) { /* ... (no changes from part 9) ... */ 
    state.updateState('editingCategoryId', category.id); dom.categoryIdInput.value = category.id; dom.categoryNameInput.value = category.name; dom.categoryTypeInput.value = category.type; dom.saveCategoryBtnText.textContent = 'Save Changes'; dom.cancelEditCategoryBtn.classList.remove('hidden'); dom.categoryNameInput.focus();
}
export function resetCategoryForm() { /* ... (no changes from part 9) ... */ 
    state.updateState('editingCategoryId', null); dom.categoryForm.reset(); dom.categoryIdInput.value = ''; dom.saveCategoryBtnText.textContent = 'Add Category'; dom.cancelEditCategoryBtn.classList.add('hidden'); 
}

// --- Exchange Rate Modal Management ---
export function openExchangeRatesModal() { /* ... (no changes from part 11a) ... */ 
    renderExchangeRatesForm(); 
    dom.exchangeRateModal.classList.add('modal-open');
}
export function closeExchangeRatesModal() { /* ... (no changes from part 11a) ... */ 
    dom.exchangeRateModal.classList.remove('modal-open');
}
function renderExchangeRatesForm() { /* ... (no changes from part 11b) ... */ 
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
    dom.rateBaseCurrencySelect.onchange = () => { // Dynamic update of label and readonly state
        const newSelectedBase = dom.rateBaseCurrencySelect.value;
        dom.formBaseCurrencyLabel.textContent = newSelectedBase;
        const inputs = dom.exchangeRatesListContainer.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => {
            if (inp.name === newSelectedBase) { inp.value = '1'; inp.readOnly = true; inp.classList.add('bg-slate-100', 'cursor-not-allowed'); } 
            else { inp.readOnly = false; inp.classList.remove('bg-slate-100', 'cursor-not-allowed'); /* Value will be updated on save */ }
        });
    };
}

// --- Form Handlers ---
export function handleProfileFormSubmit(event) { /* ... (no changes) ... */ 
    event.preventDefault(); const name = dom.profileNameInput.value.trim(); const currency = dom.profileCurrencyInput.value; const id = state.getState().editingProfileId;
    if (!name) { alert("Profile name required."); return; }
    if (id) { state.updateProfile(id, { name, currency }); } else { state.addProfile(name, currency); }
    state.saveData(); renderApp(); closeProfileModal();
}
export function handleTransactionFormSubmit(event) { /* ... (no changes) ... */ 
    event.preventDefault(); const desc = dom.transactionDescriptionInput.value.trim(); const amount = parseFloat(dom.transactionAmountInput.value); const catId = dom.transactionCategoryInput.value; const date = dom.transactionDateInput.value; const type = dom.transactionTypeInput.value; const editId = state.getState().editingTransactionId; const profileId = state.getState().activeProfileId;
    if (!desc || isNaN(amount) || amount <= 0 || !date || !catId) { alert("Please fill all fields correctly."); return; }
    if (!profileId || profileId === 'all') { alert("No profile selected."); return; }
    const data = { type, description: desc, amount, date, categoryId: catId };
    if (editId) { state.updateTransaction(profileId, editId, data); } else { state.addTransaction(profileId, data); }
    state.saveData(); renderApp(); closeTransactionModal();
}
export function handleCategoryFormSubmit(event) { /* ... (no changes) ... */ 
    event.preventDefault(); const name = dom.categoryNameInput.value.trim(); const type = dom.categoryTypeInput.value; const id = state.getState().editingCategoryId;
    if (!name || !type) { alert("Name and type required."); return; }
    let success = false; let op = '';
    if (id) { op = 'update'; const updated = state.updateCategory(id, { name, type }); success = !!updated; } 
    else { op = 'add'; const added = state.addCategory(name, type); success = !!added; }
    if (success) { state.saveData(); resetCategoryForm(); renderCategoriesList(); } 
    else { alert(`Failed to ${op} category. Duplicate name/type?`); }
}
export function handleSaveExchangeRates(event) { /* ... (no changes from part 11b) ... */ 
    event.preventDefault(); const formData = new FormData(dom.exchangeRateForm); const formRates = {}; let allValid = true; const newBase = dom.rateBaseCurrencySelect.value;
    for (const [key, val] of formData.entries()) { if (key === 'baseCurrency') continue; const rate = parseFloat(val); if (key === newBase) { formRates[key] = 1; continue; } if (isNaN(rate) || rate <= 0) { alert(`Invalid rate for ${key}`); allValid = false; break; } formRates[key] = rate; }
    if (allValid) { if (state.updateExchangeRates(newBase, formRates)) { renderApp(); closeExchangeRatesModal(); alert("Rates saved!"); } }
}

// --- Delete Handlers ---
function handleDeleteProfile(profileId, profileName) { /* ... (no changes) ... */ 
    if (confirm(`Delete profile "${profileName}"? This deletes all its transactions.`)) {
        if (state.deleteProfile(profileId)) { state.saveData(); renderApp(); alert(`Profile "${profileName}" deleted.`); } 
        else { alert("Failed to delete profile."); }
    }
}
function handleDeleteTransaction(profileId, transactionId) { /* ... (no changes) ... */ 
    if (confirm("Delete this transaction?")) {
        if (state.deleteTransaction(profileId, transactionId)) { state.saveData(); renderApp(); } 
        else { alert("Failed to delete transaction."); }
    }
}
function handleDeleteCategory(categoryId, categoryName) { /* ... (no changes) ... */ 
    if (categoryId === 'cat_uncategorized') { alert("Cannot delete 'Uncategorized'."); return; }
    if (confirm(`Delete category "${categoryName}"? Transactions will be 'Uncategorized'.`)) {
        if (state.deleteCategory(categoryId)) { state.saveData(); renderCategoriesList(); renderApp(); alert(`Category "${categoryName}" deleted.`); } 
        else { alert("Failed to delete category."); }
    }
}

// --- Import/Export Handlers ---
export function handleImportData(event) { /* Full App Data Import - no changes */ 
    const file = event.target.files[0]; if (!file) return; if (file.type !== "application/json") { alert("Invalid file type."); dom.importFile.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try { const data = JSON.parse(e.target.result);
            if (data && data.profiles && data.activeProfileId && data.displayCurrency) { 
                if (confirm("Overwrite current app data?")) { if (state.replaceState(data)) { state.saveData(); renderApp(); alert("App data import successful!"); } else { alert("Import failed: Invalid data structure."); } }
            } else { alert("Invalid JSON structure for app data."); }
        } catch (err) { console.error(err); alert("Error parsing import file."); } 
        finally { dom.importFile.value = null; }
    }; reader.onerror = () => { alert("Error reading file."); dom.importFile.value = null; }; reader.readAsText(file);
}
export function handleExportData() { /* Full App Data Export - no changes */ 
    const data = state.getState(); 
    if (data.profiles.length === 0 && !confirm("No data. Export empty file?")) return;
    const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_'); a.download = `money_tracker_app_data_${ts}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert("App data export successful!");
}

/**
 * Handles importing a dedicated exchange rates JSON file. (New)
 * @param {Event} event - The file input change event from importRatesFile.
 */
export function handleImportExchangeRatesFile(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected for importing rates.");
        return;
    }
    if (file.type !== "application/json") {
        alert("Invalid file type. Please select a JSON file for exchange rates.");
        dom.importRatesFile.value = null; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedRatesData = JSON.parse(e.target.result);
            // Validate the structure of importedRatesData
            if (importedRatesData && importedRatesData.base && importedRatesData.rates && 
                typeof importedRatesData.rates === 'object' && importedRatesData.lastUpdated) {
                
                if (confirm(`Importing this rates file will overwrite your current exchange rates. Base: ${importedRatesData.base}. Are you sure?`)) {
                    const success = state.replaceExchangeRates(importedRatesData);
                    if (success) {
                        // state.saveData() is called within replaceExchangeRates
                        renderApp(); // Re-render to update rate info and dashboard
                        closeExchangeRatesModal(); // Close modal after successful import
                        alert("Exchange rates imported successfully!");
                    } else {
                        alert("Failed to import exchange rates. The file structure or values might be incorrect.");
                    }
                }
            } else {
                alert("Invalid JSON structure for exchange rates file. Expected { base: 'CUR', rates: {...}, lastUpdated: 'timestamp' }.");
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
 * Handles exporting the current exchange rates to a JSON file. (New)
 */
export function handleExportExchangeRatesFile() {
    const ratesData = state.getExchangeRatesState(); // Get only the exchange rates part of state
    
    const jsonData = JSON.stringify(ratesData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    a.download = `money_tracker_exchange_rates_${ratesData.base}_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Exchange rates exported successfully.");
    alert("Exchange rates exported successfully! Check your downloads folder.");
}
