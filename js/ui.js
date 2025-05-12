// js/ui.js
import * as dom from './domElements.js';
import * as state from './state.js';
import { formatCurrency, formatDateTime } from './utils.js';

/**
 * Renders the entire application UI based on the current state.
 */
export function renderApp() {
    console.log("renderApp called. Current state:", state.getState());
    renderProfilesList();
    renderDashboardHeader();
    renderDashboardSummary();
    renderTransactionsList();
    dom.appCurrencySelect.value = state.getState().globalDefaultCurrency;
    console.log("App rendering complete.");
}

/**
 * Renders the list of profiles in the sidebar.
 */
function renderProfilesList() {
    const { profiles, activeProfileId } = state.getState();
    dom.profilesListEl.innerHTML = ''; 

    if (profiles.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No profiles yet. Add one!';
        p.className = 'text-sm text-slate-500 px-3 py-2';
        dom.profilesListEl.appendChild(p);
    } else {
        profiles.forEach(profile => {
            const profileItemContainer = document.createElement('div');
            profileItemContainer.className = `profile-item p-3 rounded-md cursor-pointer border border-transparent hover:border-sky-300 flex justify-between items-center text-sm`;
            if (profile.id === activeProfileId) {
                profileItemContainer.classList.add('active');
            }
            profileItemContainer.dataset.profileId = profile.id;

            const profileNameSpan = document.createElement('span');
            profileNameSpan.className = 'profile-name font-medium text-slate-700 truncate flex-grow';
            profileNameSpan.textContent = profile.name;
            profileNameSpan.addEventListener('click', (e) => {
                e.stopPropagation(); 
                state.updateState('activeProfileId', profile.id);
                state.saveData();
                renderApp(); 
            });
            profileItemContainer.appendChild(profileNameSpan);
            
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'flex items-center gap-1.5 ml-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'p-1 text-slate-500 hover:text-sky-600 rounded-md hover:bg-sky-100 transition-colors';
            editBtn.title = `Edit profile: ${profile.name}`;
            editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                openProfileModal(profile.id);
            });
            controlsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100 transition-colors';
            deleteBtn.title = `Delete profile: ${profile.name}`;
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                handleDeleteProfile(profile.id, profile.name);
            });
            controlsDiv.appendChild(deleteBtn);
            profileItemContainer.appendChild(controlsDiv);
            
            profileItemContainer.addEventListener('click', (event) => { 
                if (event.target === profileItemContainer) {
                    state.updateState('activeProfileId', profile.id);
                    state.saveData();
                    renderApp();
                }
            });

            dom.profilesListEl.appendChild(profileItemContainer);
        });
    }
     if (typeof lucide !== 'undefined' && lucide.createIcons) {
       lucide.createIcons(); 
    }
}

function renderDashboardHeader() { /* ... (no changes) ... */ 
    const { activeProfileId, globalDefaultCurrency } = state.getState();
    const activeProfile = state.getActiveProfile(); 
    if (activeProfileId === 'all') {
        dom.currentProfileNameDisplay.textContent = 'Dashboard - All Profiles';
        dom.profileCurrencyInfoDisplay.textContent = `Summary across all profiles. Default currency: ${globalDefaultCurrency}`;
    } else if (activeProfile) {
        dom.currentProfileNameDisplay.textContent = `Dashboard - ${activeProfile.name}`;
        dom.profileCurrencyInfoDisplay.textContent = `Currency: ${activeProfile.currency}`;
    } else {
        dom.currentProfileNameDisplay.textContent = 'Dashboard';
        dom.profileCurrencyInfoDisplay.textContent = 'Please select a profile.';
        if(activeProfileId !== 'all') { state.updateState('activeProfileId', 'all'); state.saveData(); }
    }
}

function renderDashboardSummary() { /* ... (no changes) ... */ 
    const { profiles, activeProfileId, globalDefaultCurrency } = state.getState();
    let totalIncome = 0, totalOutcome = 0, displayCurrency = globalDefaultCurrency;
    if (activeProfileId === 'all') {
        profiles.forEach(p => p.transactions.forEach(t => { if (t.type === 'income') totalIncome += t.amount; else totalOutcome += t.amount; }));
    } else {
        const profile = state.getActiveProfile();
        if (profile) { displayCurrency = profile.currency; profile.transactions.forEach(t => { if (t.type === 'income') totalIncome += t.amount; else totalOutcome += t.amount; }); }
    }
    dom.totalIncomeDisplay.textContent = formatCurrency(totalIncome, displayCurrency);
    dom.totalOutcomeDisplay.textContent = formatCurrency(totalOutcome, displayCurrency);
    dom.netBalanceDisplay.textContent = formatCurrency(totalIncome - totalOutcome, displayCurrency);
}

function renderTransactionsList() { /* ... (no changes, already displays category) ... */ 
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
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

/**
 * Populates the category dropdown in the transaction modal.
 */
function populateCategoryDropdown(transactionType) {
    const { categories } = state.getState();
    dom.transactionCategoryInput.innerHTML = '<option value="">-- Select Category --</option>'; 

    const filteredCategories = categories.filter(cat => cat.type === transactionType || cat.type === 'universal');
    
    filteredCategories.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    filteredCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        dom.transactionCategoryInput.appendChild(option);
    });
}

// --- Modal Management ---
export function openProfileModal(profileToEditId = null) { /* ... (no changes) ... */ 
    state.updateState('editingProfileId', profileToEditId);
    dom.profileModalTitle.textContent = profileToEditId ? 'Edit Profile' : 'Add New Profile';
    dom.profileForm.reset(); 
    if (profileToEditId) {
        const profile = state.getProfileById(profileToEditId);
        if (profile) { dom.profileIdInput.value = profile.id; dom.profileNameInput.value = profile.name; dom.profileCurrencyInput.value = profile.currency; } 
        else { console.error(`Profile ${profileToEditId} not found`); state.updateState('editingProfileId', null); dom.profileIdInput.value = ''; dom.profileCurrencyInput.value = state.getState().globalDefaultCurrency; }
    } else { dom.profileIdInput.value = ''; dom.profileCurrencyInput.value = state.getState().globalDefaultCurrency; }
    dom.profileModal.classList.add('modal-open'); dom.profileNameInput.focus();
}
export function closeProfileModal() { /* ... (no changes) ... */ 
    dom.profileModal.classList.remove('modal-open'); state.updateState('editingProfileId', null); 
}

export function openTransactionModal(type, transactionToEdit = null) { /* ... (no changes except calling populateCategoryDropdown) ... */ 
    const activeProfile = state.getActiveProfile();
    if (!activeProfile) { alert("Please select a profile."); return; }
    state.updateState('editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    dom.transactionModalTitle.textContent = transactionToEdit ? `Edit ${type}` : `Add New ${type}`;
    dom.transactionForm.reset(); dom.transactionTypeInput.value = type; dom.transactionAmountInput.placeholder = `Amount in ${activeProfile.currency}`;
    populateCategoryDropdown(type); // Populate categories based on type
    if (transactionToEdit) {
        dom.transactionIdInput.value = transactionToEdit.id; dom.transactionDescriptionInput.value = transactionToEdit.description; dom.transactionAmountInput.value = transactionToEdit.amount; dom.transactionCategoryInput.value = transactionToEdit.categoryId || ''; 
        const dateForInput = new Date(transactionToEdit.date); dateForInput.setMinutes(dateForInput.getMinutes() - dateForInput.getTimezoneOffset()); dom.transactionDateInput.value = dateForInput.toISOString().slice(0,16);
    } else { 
        dom.transactionIdInput.value = ''; dom.transactionCategoryInput.value = ''; 
        const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); dom.transactionDateInput.value = now.toISOString().slice(0,16); 
    }
    dom.transactionModal.classList.add('modal-open'); dom.transactionDescriptionInput.focus();
}
export function closeTransactionModal() { /* ... (no changes) ... */ 
    dom.transactionModal.classList.remove('modal-open'); state.updateState('editingTransactionId', null); 
}

// --- Category Modal Management (New) ---
export function openCategoryModal() {
    state.updateState('editingCategoryId', null); // Ensure we are not in edit mode initially
    resetCategoryForm();
    renderCategoriesList(); // Render the list inside the modal
    dom.categoryModal.classList.add('modal-open');
}

export function closeCategoryModal() {
    dom.categoryModal.classList.remove('modal-open');
    state.updateState('editingCategoryId', null); // Clear editing state
}

/**
 * Renders the list of categories inside the management modal.
 */
function renderCategoriesList() {
    const { categories } = state.getState();
    dom.categoriesList.innerHTML = ''; // Clear list

    // Sort categories, maybe by type then name
    categories.sort((a, b) => {
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return a.name.localeCompare(b.name);
    });

    if (categories.length === 0) {
        dom.categoriesList.innerHTML = '<p class="text-sm text-slate-500">No categories defined yet.</p>';
        return;
    }

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item flex justify-between items-center p-2 border-b border-slate-100';

        const infoSpan = document.createElement('span');
        infoSpan.className = 'text-sm';
        infoSpan.textContent = `${cat.name} (${cat.type})`;
        item.appendChild(infoSpan);

        // Add controls (Edit/Delete), but prevent deleting 'Uncategorized'
        if (cat.id !== 'cat_uncategorized') {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'flex items-center gap-1.5';

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.className = 'p-1 text-slate-500 hover:text-sky-600 rounded-md hover:bg-sky-100 transition-colors';
            editBtn.title = `Edit category: ${cat.name}`;
            editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
            editBtn.onclick = () => startEditCategory(cat);
            controlsDiv.appendChild(editBtn);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100 transition-colors';
            deleteBtn.title = `Delete category: ${cat.name}`;
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
            deleteBtn.onclick = () => handleDeleteCategory(cat.id, cat.name);
            controlsDiv.appendChild(deleteBtn);
            item.appendChild(controlsDiv);
        }

        dom.categoriesList.appendChild(item);
    });
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
       lucide.createIcons(); 
    }
}

/**
 * Sets up the category form for editing an existing category.
 * @param {object} category - The category object to edit.
 */
function startEditCategory(category) {
    state.updateState('editingCategoryId', category.id);
    dom.categoryIdInput.value = category.id;
    dom.categoryNameInput.value = category.name;
    dom.categoryTypeInput.value = category.type;
    dom.saveCategoryBtnText.textContent = 'Save Changes';
    dom.cancelEditCategoryBtn.classList.remove('hidden'); // Show cancel button
    dom.categoryNameInput.focus();
}

/**
 * Resets the category form to its default state (for adding).
 */
function resetCategoryForm() {
    state.updateState('editingCategoryId', null);
    dom.categoryForm.reset();
    dom.categoryIdInput.value = '';
    dom.saveCategoryBtnText.textContent = 'Add Category';
    dom.cancelEditCategoryBtn.classList.add('hidden'); // Hide cancel button
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

/**
 * Handles submission of the category form (add or edit). (New)
 * @param {Event} event - The form submission event.
 */
export function handleCategoryFormSubmit(event) {
    event.preventDefault();
    const name = dom.categoryNameInput.value.trim();
    const type = dom.categoryTypeInput.value;
    const editingCategoryId = state.getState().editingCategoryId;

    if (!name || !type) {
        alert("Please provide both category name and type.");
        return;
    }

    let success = false;
    if (editingCategoryId) {
        const updatedCategory = state.updateCategory(editingCategoryId, { name, type });
        success = !!updatedCategory; // Check if update was successful (not null)
        if (!success) {
            alert(`Failed to update category. Another category with name "${name}" and type "${type}" might already exist.`);
        }
    } else {
        const newCategory = state.addCategory(name, type);
        success = !!newCategory; // Check if add was successful (not null)
        if (!success) {
            alert(`Failed to add category. A category with name "${name}" and type "${type}" might already exist.`);
        }
    }

    if (success) {
        state.saveData();
        resetCategoryForm(); // Reset form after successful save/add
        renderCategoriesList(); // Re-render the list in the modal
        // No need to call renderApp() unless the category change affects the main view immediately
        // (e.g., if filters were active). For now, just update the modal list.
    }
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

/**
 * Handles the UI confirmation and deletion of a category. (New)
 * @param {string} categoryId - The ID of the category to delete.
 * @param {string} categoryName - The name for the confirmation message.
 */
function handleDeleteCategory(categoryId, categoryName) {
    if (categoryId === 'cat_uncategorized') {
        alert("Cannot delete the default 'Uncategorized' category.");
        return;
    }
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? Any transactions using this category will be set to 'Uncategorized'.`)) {
        const success = state.deleteCategory(categoryId);
        if (success) {
            state.saveData();
            renderCategoriesList(); // Update list in modal
            // Potentially call renderApp() if category deletion needs to refresh main transaction list immediately
            renderApp(); // Refresh main view to show 'Uncategorized' for reassigned transactions
            alert(`Category "${categoryName}" deleted.`);
        } else {
            alert("Failed to delete category. Please try again.");
        }
    }
}

// --- Import/Export Handlers ---
export function handleImportData(event) { /* ... (no changes) ... */ 
    const file = event.target.files[0]; if (!file) return; if (file.type !== "application/json") { alert("Invalid file type."); dom.importFile.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try { const data = JSON.parse(e.target.result);
            if (data && data.profiles && data.activeProfileId && data.globalDefaultCurrency) {
                if (confirm("Overwrite current data?")) { if (state.replaceState(data)) { state.saveData(); renderApp(); alert("Import successful!"); } else { alert("Import failed: Invalid data structure."); } }
            } else { alert("Invalid JSON structure."); }
        } catch (err) { console.error(err); alert("Error parsing import file."); } 
        finally { dom.importFile.value = null; }
    }; reader.onerror = () => { alert("Error reading file."); dom.importFile.value = null; }; reader.readAsText(file);
}
export function handleExportData() { /* ... (no changes) ... */ 
    const data = state.getState(); if (data.profiles.length === 0 && !confirm("No data. Export empty file?")) return;
    const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_'); a.download = `money_tracker_data_${ts}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert("Export successful!");
}
