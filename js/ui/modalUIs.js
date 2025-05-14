// js/ui/modalUIs.js
import * as dom from '../domElements.js';
import { updateAppState } from '../state/appState.js';

/**
 * Opens a modal.
 * @param {HTMLElement} modalElement - The modal element to open.
 * @param {HTMLElement} [focusElement] - Optional element to focus after opening.
 */
export function openModal(modalElement, focusElement) {
    modalElement.classList.add('modal-open');
    if (focusElement) {
        focusElement.focus();
    }
}

/**
 * Closes a modal.
 * @param {HTMLElement} modalElement - The modal element to close.
 */
export function closeModal(modalElement) {
    modalElement.classList.remove('modal-open');
}

// Specific modal helper for opening profile modal
export function openProfileModalUI(profileToEdit = null) {
    updateAppState('ui.editingProfileId', profileToEdit ? profileToEdit.id : null);
    dom.profileModalTitle.textContent = profileToEdit ? 'Edit Profile' : 'Add New Profile';
    dom.profileForm.reset();
    // Further population logic will be in profileUI.js or profileHandlers.js
    openModal(dom.profileModal, dom.profileNameInput);
}

export function closeProfileModalUI() {
    closeModal(dom.profileModal);
    updateAppState('ui.editingProfileId', null);
}

// Specific modal helper for opening transaction modal
export function openTransactionModalUI(type, transactionToEdit = null) {
    updateAppState('ui.editingTransactionId', transactionToEdit ? transactionToEdit.id : null);
    // Title and form population will be handled by a more specific transactionUI module
    // For now, just demonstrating the open action
    openModal(dom.transactionModal, dom.transactionDescriptionInput);
}

export function closeTransactionModalUI() {
    closeModal(dom.transactionModal);
    updateAppState('ui.editingTransactionId', null);
    // updateAppState('activeProfileIdForTransactionModal', null); // If this state moves to appState.ui
}

// Category Modal
export function openCategoryModalUI() {
    updateAppState('ui.editingCategoryId', null);
    // Reset and population will be in categoryUI or categoryHandlers
    openModal(dom.categoryModal, dom.categoryNameInput);
}
export function closeCategoryModalUI() {
    closeModal(dom.categoryModal);
    updateAppState('ui.editingCategoryId', null);
}

// Exchange Rate Modal
export function openExchangeRatesModalUI() {
    openModal(dom.exchangeRateModal);
    // Population will be in exchangeRateUI or exchangeRateHandlers
}
export function closeExchangeRatesModalUI() {
    closeModal(dom.exchangeRateModal);
}

// General Escape key handler for modals - this could also live in a more global event handler setup
export function initializeModalEscapeListener() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (dom.profileModal.classList.contains('modal-open')) closeProfileModalUI();
            if (dom.transactionModal.classList.contains('modal-open')) closeTransactionModalUI();
            if (dom.categoryModal.classList.contains('modal-open')) closeCategoryModalUI();
            if (dom.exchangeRateModal.classList.contains('modal-open')) closeExchangeRatesModalUI();
        }
    });
}