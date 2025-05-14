// js/handlers/profileHandlers.js
import * as dom from '../domElements.js';
import { getAppState, updateAppState } from '../state/appState.js';
import { addProfile, updateProfile, deleteProfile, getProfileById } from '../state/profileState.js';
import { openProfileModalUI, closeProfileModalUI } from '../ui/modalUIs.js';
import { populateProfileModalForm, renderProfilesList } from '../ui/profileUI.js';
// renderApp function will be imported in main.js and passed to handlers that need full re-render.
// For now, we'll assume direct calls to specific UI updates or rely on main.js to coordinate.

let fullRenderAppCallback = () => console.warn("renderApp callback not yet initialized in profileHandlers");

/**
 * Sets the callback function for a full application re-render.
 * @param {function} renderAppFn - The main application rendering function.
 */
export function setRenderAppCallback(renderAppFn) {
    fullRenderAppCallback = renderAppFn;
}

/**
 * Handles the submission of the profile form (add or edit).
 * @param {Event} event - The form submission event.
 */
export function handleProfileFormSubmit(event) {
    event.preventDefault();
    const profileName = dom.profileNameInput.value.trim();
    const profileCurrency = dom.profileCurrencyInput.value;
    const financialMonthStartDay = parseInt(dom.profileFinancialMonthStartDayInput.value, 10);
    const editingProfileId = getAppState().ui.editingProfileId; // Get from appState.ui

    if (!profileName) {
        alert("Profile name is required.");
        return;
    }
    if (isNaN(financialMonthStartDay) || financialMonthStartDay < 1 || financialMonthStartDay > 31) {
        alert("Financial month start day must be between 1 and 31.");
        return;
    }

    if (editingProfileId) {
        updateProfile(editingProfileId, { name: profileName, currency: profileCurrency, financialMonthStartDay });
    } else {
        addProfile(profileName, profileCurrency, financialMonthStartDay);
    }
    // addProfile/updateProfile already save state.
    closeProfileModalUI();
    fullRenderAppCallback(); // Trigger a full re-render
}

/**
 * Handles the click event to open the profile modal for adding a new profile.
 */
export function handleOpenAddProfileModal() {
    populateProfileModalForm(null); // Pass null for new profile
    openProfileModalUI(); // Pass no profile to indicate 'add' mode
}

/**
 * Handles the click event to open the profile modal for editing an existing profile.
 * This function is intended to be called from renderProfilesList.
 * @param {object} profile - The profile object to edit.
 */
export function handleOpenEditProfileModal(profile) {
    populateProfileModalForm(profile);
    openProfileModalUI(profile); // Pass profile to indicate 'edit' mode
}

/**
 * Handles the deletion of a profile.
 * This function is intended to be called from renderProfilesList.
 * @param {string} profileId - The ID of the profile to delete.
 * @param {string} profileName - The name of the profile, for confirmation.
 */
export function handleDeleteProfile(profileId, profileName) {
    if (confirm(`Are you sure you want to delete the profile "${profileName}" and all its transactions?`)) {
        const success = deleteProfile(profileId); // deleteProfile already saves state
        if (success) {
            alert(`Profile "${profileName}" deleted successfully.`);
            fullRenderAppCallback(); // Trigger a full re-render
        } else {
            alert(`Failed to delete profile "${profileName}".`);
        }
    }
}

/**
 * Initializes all event listeners related to profile management.
 */
export function initializeProfileEventListeners() {
    dom.addProfileBtn.addEventListener('click', handleOpenAddProfileModal);
    dom.profileForm.addEventListener('submit', handleProfileFormSubmit);
    dom.closeProfileModalBtn.addEventListener('click', closeProfileModalUI);
    dom.cancelProfileModalBtn.addEventListener('click', closeProfileModalUI);
    // Edit and delete listeners are attached dynamically in renderProfilesList
    // by passing handleOpenEditProfileModal and handleDeleteProfile as callbacks.
}