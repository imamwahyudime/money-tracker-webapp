// js/handlers/categoryHandlers.js
import * as dom from '../domElements.js';
import { getAppState, updateAppState } from '../state/appState.js';
import { addCategory, updateCategory, deleteCategory, getCategoryById } from '../state/categoryState.js';
import { openCategoryModalUI, closeCategoryModalUI } from '../ui/modalUIs.js';
import { renderCategoriesList, populateCategoryForm, resetCategoryFormUI } from '../ui/categoryUI.js';

let fullRenderAppCallback = () => console.warn("renderApp callback not yet initialized in categoryHandlers");

/**
 * Sets the callback function for a full application re-render.
 * @param {function} renderAppFn - The main application rendering function.
 */
export function setRenderAppCallback(renderAppFn) {
    fullRenderAppCallback = renderAppFn;
}

/**
 * Handles the submission of the category form (add or edit).
 * @param {Event} event - The form submission event.
 */
export function handleCategoryFormSubmit(event) {
    event.preventDefault();
    const categoryName = dom.categoryNameInput.value.trim();
    const categoryType = dom.categoryTypeInput.value;
    const editingCategoryId = getAppState().ui.editingCategoryId;

    if (!categoryName || !categoryType) {
        alert("Category name and type are required.");
        return;
    }

    let success = false;
    let operation = '';

    if (editingCategoryId) {
        operation = 'update';
        const updated = updateCategory(editingCategoryId, { name: categoryName, type: categoryType });
        success = !!updated; // True if updated is not null
    } else {
        operation = 'add';
        const added = addCategory(categoryName, categoryType);
        success = !!added; // True if added is not null
    }

    if (success) {
        // updateCategory/addCategory already save state.
        resetCategoryFormUI(); // Resets form and editingCategoryId in UI state
        // Re-render the list within the modal immediately
        renderCategoriesList(handleOpenEditCategoryModal, handleDeleteCategory);
        // Potentially, a full app re-render might be needed if categories affect other parts significantly (e.g., dropdowns in transaction modal)
        // For now, let's assume renderApp in main.js will handle this, or if categories are only used in transaction modal,
        // then populating that dropdown at the time of opening transaction modal is sufficient.
        // However, if a category name changes, existing transactions in the list might show old name until full render.
        fullRenderAppCallback(); // Recommended for consistency
    } else {
        alert(`Failed to ${operation} category. It might be a duplicate name/type combination or another issue.`);
    }
}

/**
 * Handles opening the category modal and rendering its content.
 */
export function handleOpenCategoryManager() {
    resetCategoryFormUI(); // Reset form for adding
    renderCategoriesList(handleOpenEditCategoryModal, handleDeleteCategory); // Render list with edit/delete handlers
    openCategoryModalUI();
}

/**
 * Prepares the category form for editing an existing category.
 * This function is intended to be called from renderCategoriesList.
 * @param {object} category - The category object to edit.
 */
export function handleOpenEditCategoryModal(category) {
    populateCategoryForm(category); // This sets editingCategoryId and fills form
    // The modal should already be open if we are clicking edit from within it.
    // If we were opening it from somewhere else to directly edit, then openCategoryModalUI() would be here.
}

/**
 * Handles the deletion of a category.
 * This function is intended to be called from renderCategoriesList.
 * @param {string} categoryId - The ID of the category to delete.
 * @param {string} categoryName - The name for confirmation.
 */
export function handleDeleteCategory(categoryId, categoryName) {
    if (categoryId === 'cat_uncategorized') {
        alert("The 'Uncategorized' category cannot be deleted.");
        return;
    }
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? Transactions using this category will be reassigned to 'Uncategorized'.`)) {
        const success = deleteCategory(categoryId); // This also updates transactions and saves state
        if (success) {
            alert(`Category "${categoryName}" deleted.`);
            resetCategoryFormUI(); // In case the deleted category was being edited
            renderCategoriesList(handleOpenEditCategoryModal, handleDeleteCategory); // Refresh list in modal
            fullRenderAppCallback(); // Refresh the rest of the app (e.g., transaction list display)
        } else {
            alert(`Failed to delete category "${categoryName}".`);
        }
    }
}

/**
 * Initializes event listeners for category management.
 */
export function initializeCategoryEventListeners() {
    dom.manageCategoriesBtn.addEventListener('click', handleOpenCategoryManager);
    dom.categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    dom.closeCategoryModalBtn.addEventListener('click', closeCategoryModalUI);
    dom.cancelEditCategoryBtn.addEventListener('click', resetCategoryFormUI);
    // Edit and delete listeners for items in the list are attached dynamically in renderCategoriesList
}