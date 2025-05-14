// js/services/themeService.js
import { AVAILABLE_THEMES, DEFAULT_THEME } from '../config.js';
import * as dom from '../domElements.js';

/**
 * Applies the selected theme to the document.
 * @param {string} themeName - The name of the theme to apply (e.g., 'light', 'dark', 'sepia').
 */
export function applyTheme(themeName) {
    const validTheme = AVAILABLE_THEMES.find(t => t.value === themeName) ? themeName : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', validTheme);
    console.log(`Theme applied: ${validTheme}`);
}

/**
 * Populates the theme selector dropdown and sets the current theme.
 * @param {string} currentThemeValue - The value of the currently active theme.
 */
export function populateThemeSelector(currentThemeValue) {
    dom.themeSelector.innerHTML = ''; // Clear existing options
    const themeToSelect = AVAILABLE_THEMES.some(t => t.value === currentThemeValue) ? currentThemeValue : DEFAULT_THEME;

    AVAILABLE_THEMES.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.name;
        if (theme.value === themeToSelect) {
            option.selected = true;
        }
        dom.themeSelector.appendChild(option);
    });
    // Ensure the initially applied theme matches the selected option
    if (document.documentElement.getAttribute('data-theme') !== themeToSelect) {
        applyTheme(themeToSelect);
    }
}