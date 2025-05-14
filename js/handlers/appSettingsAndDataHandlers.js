// js/handlers/appSettingsAndDataHandlers.js
import * as dom from '../domElements.js';
import { getAppState, updateAppState, saveAppState, replaceAppState, loadAppState } from '../state/appState.js';
import { setActiveProfileId } from '../state/profileState.js';
import { applyTheme, populateThemeSelector } from '../services/themeService.js';
// renderApp function will be imported in main.js and passed to handlers.
// It's crucial for reflecting changes in settings across the entire UI.

let fullRenderAppCallback = () => console.warn("renderApp callback not yet initialized in appSettingsAndDataHandlers");

/**
 * Sets the callback function for a full application re-render.
 * @param {function} renderAppFn - The main application rendering function.
 */
export function setRenderAppCallback(renderAppFn) {
    fullRenderAppCallback = renderAppFn;
}

/**
 * Handles changes to the app's global display currency.
 * @param {Event} event - The change event from the select element.
 */
function handleDisplayCurrencyChange(event) {
    const newDisplayCurrency = event.target.value;
    updateAppState('settings.displayCurrency', newDisplayCurrency);
    saveAppState();
    fullRenderAppCallback(); // Currency change affects many parts
}

/**
 * Handles changes to the projection date.
 * @param {Event} event - The change event from the date input.
 */
function handleProjectionDateChange(event) {
    const newProjectionDateISO = event.target.value ? new Date(event.target.value).toISOString() : null;
    // HTML date input gives YYYY-MM-DD. new Date('YYYY-MM-DD') parses it as UTC.
    // If you want to ensure it's treated as local day start, then convert to full ISO string
    // or store just YYYY-MM-DD and parse consistently in getActiveDateWindow.
    // For simplicity, an ISO string representing the start of that local day (in UTC) is fine if handled consistently.
    // The current formatDateForInput and getActiveDateWindow should work okay with this.
    let finalDateToStore = null;
    if (event.target.value) { // if a date is selected
        const [year, month, day] = event.target.value.split('-').map(Number);
        finalDateToStore = new Date(Date.UTC(year, month - 1, day)).toISOString();
    }

    updateAppState('settings.projectionDate', finalDateToStore);
    saveAppState();
    fullRenderAppCallback(); // Date changes affect summaries and transaction lists
}

/**
 * Resets the projection date to null.
 */
function handleResetProjectionDate() {
    updateAppState('settings.projectionDate', null);
    dom.projectionDateInput.value = ''; // Clear the input field directly
    saveAppState();
    fullRenderAppCallback();
}

/**
 * Handles the "View All Profiles" button click.
 */
function handleViewAllProfiles() {
    setActiveProfileId('all'); // This saves state and should trigger render via main flow
    fullRenderAppCallback();
}

/**
 * Handles changes to the selected theme.
 * @param {Event} event - The change event from the theme selector.
 */
function handleThemeChange(event) {
    const selectedTheme = event.target.value;
    updateAppState('settings.currentTheme', selectedTheme);
    saveAppState();
    applyTheme(selectedTheme); // Apply theme immediately
    // populateThemeSelector(selectedTheme); // Ensure selector reflects change, though renderApp will do this too
    // No need for fullRenderAppCallback() here if applyTheme handles all visual changes
    // However, if some components don't use CSS vars properly, a full render might be safer.
    // For now, applyTheme should be enough. If not, uncomment fullRenderAppCallback.
    // fullRenderAppCallback();
}

/**
 * Handles the import of application data from a JSON file.
 * @param {Event} event - The file input change event.
 */
export function handleAppDataImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
        alert("Invalid file type. Please select a JSON data file.");
        dom.importFile.value = null; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            // Basic validation of structure (can be more thorough)
            if (importedData && importedData.profiles && importedData.settings && importedData.categories && importedData.exchangeRates) {
                if (confirm("This will overwrite all current application data. This action cannot be undone. Are you sure?")) {
                    const success = replaceAppState(importedData); // replaceAppState now saves
                    if (success) {
                        loadAppState(); // Reload state into memory from the new data just saved by replaceAppState
                        alert("Application data imported successfully!");
                        fullRenderAppCallback(); // Render with the new state
                    } else {
                        alert("Import failed: The data structure might be invalid or an error occurred.");
                    }
                }
            } else {
                alert("Invalid JSON structure for application data import.");
            }
        } catch (error) {
            console.error("Error parsing imported app data file:", error);
            alert("Error reading or parsing the app data import file. Ensure it's valid JSON.");
        } finally {
            dom.importFile.value = null; // Reset file input in all cases
        }
    };
    reader.onerror = () => {
        alert("Error reading the app data file.");
        dom.importFile.value = null;
    };
    reader.readAsText(file);
}

/**
 * Handles the export of the current application data to a JSON file.
 */
export function handleAppDataExport() {
    const currentData = getAppState(); // Get the complete, current state
    // Optionally, add a check if there's anything to export
    if (currentData.profiles.length === 0 && !confirm("No profile data exists. Export an empty structure?")) {
        return;
    }

    const jsonData = JSON.stringify(currentData, null, 2); // Pretty print JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    a.download = `money_tracker_app_data_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Application data exported successfully! Check your downloads folder.");
}


/**
 * Initializes event listeners for general application settings and data management.
 */
export function initializeAppSettingsAndDataEventListeners() {
    dom.appDisplayCurrencySelect.addEventListener('change', handleDisplayCurrencyChange);
    dom.projectionDateInput.addEventListener('change', handleProjectionDateChange);
    dom.resetProjectionDateBtn.addEventListener('click', handleResetProjectionDate);
    dom.viewAllProfilesBtn.addEventListener('click', handleViewAllProfiles);
    dom.themeSelector.addEventListener('change', handleThemeChange);

    // Data Import/Export
    dom.importDataBtn.addEventListener('click', () => dom.importFile.click()); // Trigger hidden file input
    dom.importFile.addEventListener('change', handleAppDataImport);
    dom.exportDataBtn.addEventListener('click', handleAppDataExport);
}