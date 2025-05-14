// js/state/profileState.js
import { getAppState, updateAppState, saveAppState } from './appState.js';
import { generateId } from '../utils.js';
import { DEFAULT_FINANCIAL_MONTH_START_DAY } from '../config.js';

/**
 * Retrieves all profiles from the application state.
 * @returns {Array<object>} A list of profiles.
 */
export function getProfiles() {
    return getAppState().profiles;
}

/**
 * Retrieves a profile by its ID.
 * @param {string} id - The ID of the profile.
 * @returns {object | undefined} The profile object or undefined if not found.
 */
export function getProfileById(id) {
    const { profiles } = getAppState();
    return profiles.find(p => p.id === id);
}

/**
 * Gets the currently active profile object.
 * Returns null if 'all' profiles are active or if no specific profile is active.
 * @returns {object | null} The active profile object or null.
 */
export function getActiveProfile() {
    const { activeProfileId, profiles } = getAppState();
    if (activeProfileId === 'all' || !activeProfileId) {
        return null;
    }
    return profiles.find(p => p.id === activeProfileId);
}

/**
 * Retrieves the ID of the currently active profile.
 * @returns {string} The active profile ID.
 */
export function getActiveProfileId() {
    return getAppState().activeProfileId;
}

/**
 * Sets the active profile ID.
 * @param {string} profileId - The ID of the profile to set as active, or 'all'.
 */
export function setActiveProfileId(profileId) {
    updateAppState('activeProfileId', profileId);
    saveAppState();
}

/**
 * Adds a new profile to the application state.
 * @param {string} name - The name of the profile.
 * @param {string} currency - The currency code for the profile.
 * @param {number} [financialMonthStartDay=DEFAULT_FINANCIAL_MONTH_START_DAY] - The financial month start day.
 * @returns {object} The newly created profile object.
 */
export function addProfile(name, currency, financialMonthStartDay = DEFAULT_FINANCIAL_MONTH_START_DAY) {
    const appState = getAppState(); // Get current state to modify profiles array
    const newProfile = {
        id: generateId(),
        name: name.trim(),
        currency,
        financialMonthStartDay: parseInt(financialMonthStartDay, 10) || DEFAULT_FINANCIAL_MONTH_START_DAY,
        transactions: []
    };
    const updatedProfiles = [...appState.profiles, newProfile];
    updateAppState('profiles', updatedProfiles);
    setActiveProfileId(newProfile.id); // Also saves the app state
    return newProfile;
}

/**
 * Updates an existing profile.
 * @param {string} id - The ID of the profile to update.
 * @param {object} updateData - An object containing { name, currency, financialMonthStartDay }.
 * @returns {object | null} The updated profile object or null if not found.
 */
export function updateProfile(id, { name, currency, financialMonthStartDay }) {
    const appState = getAppState();
    const profileIndex = appState.profiles.findIndex(p => p.id === id);

    if (profileIndex !== -1) {
        const updatedProfiles = [...appState.profiles];
        const profileToUpdate = { ...updatedProfiles[profileIndex] };

        if (name !== undefined) profileToUpdate.name = name.trim();
        if (currency !== undefined) profileToUpdate.currency = currency;
        if (financialMonthStartDay !== undefined) profileToUpdate.financialMonthStartDay = parseInt(financialMonthStartDay, 10);

        updatedProfiles[profileIndex] = profileToUpdate;
        updateAppState('profiles', updatedProfiles);
        saveAppState();
        return profileToUpdate;
    }
    return null;
}

/**
 * Deletes a profile from the application state.
 * Also updates the active profile ID if the deleted profile was active.
 * @param {string} id - The ID of the profile to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteProfile(id) {
    const appState = getAppState();
    const initialProfileCount = appState.profiles.length;
    const updatedProfiles = appState.profiles.filter(p => p.id !== id);

    if (updatedProfiles.length < initialProfileCount) {
        updateAppState('profiles', updatedProfiles);
        if (getActiveProfileId() === id) {
            const newActiveId = updatedProfiles.length > 0 ? updatedProfiles[0].id : 'all';
            setActiveProfileId(newActiveId); // Also saves the app state
        } else {
            saveAppState(); // Save if active profile didn't change but profiles list did
        }
        return true;
    }
    return false;
}