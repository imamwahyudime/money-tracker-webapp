// js/ui/profileUI.js
import * as dom from '../domElements.js';
import { getProfiles, getActiveProfileId, setActiveProfileId } from '../state/profileState.js';
import { DEFAULT_FINANCIAL_MONTH_START_DAY, CURRENCY_SYMBOLS } from '../config.js';
import { getAppState, updateAppState } from '../state/appState.js'; // For displayCurrency
import { openProfileModalUI } from './modalUIs.js'; // Using the refactored modal open

// Function to create a single profile list item element
function createProfileListItem(profile, currentActiveId, onEdit, onDelete) {
    const itemContainer = document.createElement('div');
    itemContainer.className = `profile-item p-3 rounded-md cursor-pointer border border-transparent flex justify-between items-center text-sm ${profile.id === currentActiveId ? 'active' : ''}`;
    itemContainer.dataset.profileId = profile.id;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'profile-name font-medium truncate flex-grow mr-2';
    nameSpan.textContent = profile.name;
    nameSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveProfileId(profile.id); // This will trigger a re-render via main.js
    });
    itemContainer.appendChild(nameSpan);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex items-center gap-1 flex-shrink-0';

    const editBtn = document.createElement('button');
    editBtn.className = 'p-1 rounded-md';
    editBtn.title = `Edit: ${profile.name}`;
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
    editBtn.style.color = 'var(--text-secondary)';
    editBtn.onmouseover = () => { editBtn.style.backgroundColor = 'var(--bg-tertiary)'; editBtn.style.color = 'var(--text-accent)'; };
    editBtn.onmouseout = () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = 'var(--text-secondary)'; };
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); onEdit(profile); });
    controlsDiv.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'p-1 rounded-md';
    delBtn.title = `Delete: ${profile.name}`;
    delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
    delBtn.style.color = 'var(--text-secondary)';
    delBtn.onmouseover = () => { delBtn.style.backgroundColor = 'var(--bg-tertiary)'; delBtn.style.color = 'var(--text-danger)'; };
    delBtn.onmouseout = () => { delBtn.style.backgroundColor = 'transparent'; delBtn.style.color = 'var(--text-secondary)'; };
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); onDelete(profile.id, profile.name); });
    controlsDiv.appendChild(delBtn);

    itemContainer.appendChild(controlsDiv);
    itemContainer.addEventListener('click', (event) => {
        if (!event.target.closest('button')) { // Only change active profile if not clicking a button
            setActiveProfileId(profile.id);
        }
    });
    return itemContainer;
}


/**
 * Renders the list of profiles in the sidebar.
 * @param {function} onEditProfile - Callback function when edit profile is clicked.
 * @param {function} onDeleteProfile - Callback function when delete profile is clicked.
 */
export function renderProfilesList(onEditProfile, onDeleteProfile) {
    const profiles = getProfiles();
    const activeId = getActiveProfileId();
    dom.profilesListEl.innerHTML = '';

    if (profiles.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No profiles yet.';
        p.className = 'text-sm px-3 py-2';
        dom.profilesListEl.appendChild(p);
    } else {
        profiles.forEach(profile => {
            const profileElement = createProfileListItem(profile, activeId, onEditProfile, onDeleteProfile);
            dom.profilesListEl.appendChild(profileElement);
        });
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
       lucide.createIcons(); // Refresh icons if any were added dynamically
    }
}


/**
 * Populates the profile modal form for adding or editing a profile.
 * @param {object | null} profile - The profile object to edit, or null to add a new one.
 */
export function populateProfileModalForm(profile) {
    const appSettings = getAppState().settings;
    if (profile) {
        dom.profileIdInput.value = profile.id;
        dom.profileNameInput.value = profile.name;
        dom.profileCurrencyInput.value = profile.currency;
        dom.profileFinancialMonthStartDayInput.value = profile.financialMonthStartDay || DEFAULT_FINANCIAL_MONTH_START_DAY;
    } else {
        dom.profileIdInput.value = ''; // Important for distinguishing add vs edit
        dom.profileNameInput.value = '';
        dom.profileCurrencyInput.value = appSettings.displayCurrency; // Default to app's display currency
        dom.profileFinancialMonthStartDayInput.value = DEFAULT_FINANCIAL_MONTH_START_DAY;
    }
    // Populate currency dropdown options - could be done once at init
    // For now, ensuring it has the symbols if not already populated.
    if(dom.profileCurrencyInput.options.length <= 1){ // Basic check if already populated
        dom.profileCurrencyInput.innerHTML = ''; // Clear if needed
        Object.keys(CURRENCY_SYMBOLS).forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${code} (${CURRENCY_SYMBOLS[code]})`;
            dom.profileCurrencyInput.appendChild(option);
        });
        // Reselect after populating
        if (profile) dom.profileCurrencyInput.value = profile.currency;
        else dom.profileCurrencyInput.value = appSettings.displayCurrency;
    }
}