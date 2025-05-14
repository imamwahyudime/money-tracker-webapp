// js/services/storageService.js
import { STORAGE_KEY } from '../config.js';

/**
 * Saves the provided state object to localStorage.
 * @param {object} stateToSave - The application state to save.
 */
export function saveDataToStorage(stateToSave) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("Data saved to localStorage:", stateToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        alert("Error: Could not save data. Your browser's local storage might be full or disabled.");
    }
}

/**
 * Loads data from localStorage.
 * @returns {object | null} The parsed data from localStorage, or null if no data or error.
 */
export function loadDataFromStorage() {
    console.log(`Attempting to load data from localStorage with key: ${STORAGE_KEY}`);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            console.log("Data loaded successfully from localStorage:", parsedData);
            return parsedData;
        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            return null;
        }
    }
    console.log("No data found in localStorage.");
    return null;
}