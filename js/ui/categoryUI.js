// js/ui/categoryUI.js
import * as dom from '../domElements.js';
import { getCategories, getCategoryById } from '../state/categoryState.js';
import { getAppState, updateAppState } from '../state/appState.js'; // For editingCategoryId

/**
 * Creates a single category list item element.
 * @param {object} category - The category object.
 * @param {function} onEdit - Callback function when edit is clicked.
 * @param {function} onDelete - Callback function when delete is clicked.
 * @returns {HTMLElement} The category item element.
 */
function createCategoryListItem(category, onEdit, onDelete) {
    const item = document.createElement('div');
    item.className = 'category-item flex justify-between items-center p-2 border-b last:border-b-0';
    item.style.borderColor = 'var(--border-secondary)'; // Apply themed border

    const info = document.createElement('span');
    info.className = 'text-sm';
    info.textContent = `${category.name} (${category.type.charAt(0).toUpperCase() + category.type.slice(1)})`;
    item.appendChild(info);

    if (category.id !== 'cat_uncategorized') {
        const controls = document.createElement('div');
        controls.className = 'flex items-center gap-1.5 flex-shrink-0';

        const editBtn = document.createElement('button');
        editBtn.className = 'p-1 rounded-md';
        editBtn.title = `Edit: ${category.name}`;
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>`;
        editBtn.style.color = 'var(--text-secondary)';
        editBtn.onmouseover = () => { editBtn.style.backgroundColor = 'var(--bg-tertiary)'; editBtn.style.color = 'var(--text-accent)'; };
        editBtn.onmouseout = () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = 'var(--text-secondary)'; };
        editBtn.onclick = () => onEdit(category);
        controls.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'p-1 rounded-md';
        delBtn.title = `Delete: ${category.name}`;
        delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
        delBtn.style.color = 'var(--text-secondary)';
        delBtn.onmouseover = () => { delBtn.style.backgroundColor = 'var(--bg-tertiary)'; delBtn.style.color = 'var(--text-danger)'; };
        delBtn.onmouseout = () => { delBtn.style.backgroundColor = 'transparent'; delBtn.style.color = 'var(--text-secondary)'; };
        delBtn.onclick = () => onDelete(category.id, category.name);
        controls.appendChild(delBtn);
        item.appendChild(controls);
    } else {
        const placeholder = document.createElement('div'); // To maintain alignment
        placeholder.className = 'w-16'; // Approximate width of controls
        item.appendChild(placeholder);
    }
    return item;
}

/**
 * Renders the list of categories in the category management modal.
 * @param {function} onEditCategory - Callback for edit action.
 * @param {function} onDeleteCategory - Callback for delete action.
 */
export function renderCategoriesList(onEditCategory, onDeleteCategory) {
    const categories = getCategories();
    dom.categoriesList.innerHTML = '';
    // Sort: 'Uncategorized' first, then by type, then by name
    categories.sort((a, b) => {
        if (a.id === 'cat_uncategorized') return -1;
        if (b.id === 'cat_uncategorized') return 1;
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return a.name.localeCompare(b.name);
    });

    if (categories.length === 0) {
        dom.categoriesList.innerHTML = '<p class="text-sm p-2">No categories defined yet.</p>';
        return;
    }
    categories.forEach(cat => {
        const listItem = createCategoryListItem(cat, onEditCategory, onDeleteCategory);
        dom.categoriesList.appendChild(listItem);
    });
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
     }
}

/**
 * Populates the category form for editing or resets it for adding.
 * @param {object | null} categoryToEdit - The category object to edit, or null to reset for adding.
 */
export function populateCategoryForm(categoryToEdit = null) {
    if (categoryToEdit) {
        updateAppState('ui.editingCategoryId', categoryToEdit.id);
        dom.categoryIdInput.value = categoryToEdit.id;
        dom.categoryNameInput.value = categoryToEdit.name;
        dom.categoryTypeInput.value = categoryToEdit.type;
        dom.saveCategoryBtnText.textContent = 'Save Changes';
        dom.cancelEditCategoryBtn.classList.remove('hidden');
        dom.categoryNameInput.focus();
    } else {
        updateAppState('ui.editingCategoryId', null);
        dom.categoryForm.reset();
        dom.categoryIdInput.value = '';
        dom.saveCategoryBtnText.textContent = 'Add Category';
        dom.cancelEditCategoryBtn.classList.add('hidden');
    }
}

/**
 * Resets the category form to its default state for adding a new category.
 */
export function resetCategoryFormUI() {
    populateCategoryForm(null); // This already handles resetting the state and UI
}