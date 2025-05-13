# Money Tracker Pro (In-Development)

**Version:** 0.11.2

Money Tracker Pro is a web-based application designed to help users manage their finances across multiple profiles. Users can track income and expenses for personal use, different business ventures, or any other distinct financial entities. The application aims to provide a clear, user-friendly interface for financial oversight, with data stored locally in the browser and features for data import/export and currency conversion.

## Features Implemented So Far:

* **Multi-Profile Management:**
    * **Create Profiles:** Users can create multiple financial profiles (e.g., "Personal," "Company A").
    * **Profile-Specific Currency:** Each profile has its own currency (IDR, USD, JPY, EUR, SGD supported).
    * **Select Active Profile:** Users can select a specific profile to view its dashboard and manage its transactions.
    * **Edit Profiles:** Edit existing profile names and currencies via icons in the profile list.
    * **Delete Profiles:** Delete profiles (with confirmation), which also removes all associated transactions.
    * **"View All Profiles" Mode:** A dashboard view that aggregates financial summaries.
* **Transaction Management (Per Profile):**
    * **Add Income/Outcome:** Users can add income and outcome transactions to the currently selected profile.
    * **Transaction Details:** Each transaction includes a description, amount, date & time, and a category.
    * **Edit Transactions:** Existing transactions can be modified.
    * **Delete Transactions:** Transactions can be removed from a profile.
* **Category Management:**
    * **Manage Categories:** A dedicated modal to add, edit (name, type), and delete user-defined categories.
    * **Category Types:** Categories can be 'income', 'outcome', or 'universal'.
    * **Default Categories:** A predefined set of categories is available initially.
    * **'Uncategorized' Default:** A non-deletable 'Uncategorized' category serves as a fallback.
    * **Transaction Reassignment:** Deleting a category reassigns its associated transactions to 'Uncategorized'.
* **Dashboard & Summary:**
    * **Financial Overview:** Displays Total Income, Total Outcome, and Net Balance.
    * **Single Profile View:** Totals are displayed in the profile's own currency.
    * **"All Profiles" View:** Aggregated totals are converted and displayed in a user-selectable global "Display Currency" using stored exchange rates.
    * **Recent Transactions List:** Shows transactions for the selected profile or all profiles, including category information.
* **Exchange Rate Management & Currency Conversion:**
    * **Store Exchange Rates:** Application stores exchange rates against a user-selectable base currency.
    * **Manage Rates UI:** A modal allows users to:
        * View current rates.
        * Select a new base currency from supported options (IDR, USD, JPY, EUR, SGD).
        * Edit the rates of all supported currencies against the current base.
        * Saving rates with a new base currency recalculates all other rates relative to the new base.
    * **Rate Information Display:** The sidebar shows the current base currency for rates and the "last updated" timestamp.
    * **Conversion Logic:** A utility function converts amounts between currencies based on the stored rates.
* **Data Persistence:**
    * **Local Storage:** All application data (profiles, transactions, categories, display currency choice, exchange rates) is saved in the browser's `localStorage`.
* **Import/Export (Full App Data):**
    * **Export App Data:** Functionality to export all application data into a single JSON file.
    * **Import App Data:** Functionality to import data from such a JSON file, overwriting current data after user confirmation.
* **User Interface:**
    * **Responsive Design:** Built with Tailwind CSS.
    * **Icons:** Uses Lucide Icons (via CDN).
    * **Modals:** For adding/editing profiles, transactions, and managing categories and exchange rates.

## Technology Stack:

* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Styling:** Tailwind CSS (via CDN)
* **Icons:** Lucide Icons (via CDN)
* **Data Storage:** Browser `localStorage`

## Current Structure (Modular JavaScript):

The application is structured with a main `index.html` file and a `js/` subdirectory containing the following JavaScript modules:
* `main.js`: Main entry point, global event listener setup.
* `ui.js`: Handles all DOM manipulations, UI rendering, modal controls, and form submissions.
* `state.js`: Manages the application's state, core data logic, and `localStorage` interactions.
* `domElements.js`: Centralizes DOM element selections.
* `config.js`: Stores application constants (storage keys, default categories, default exchange rates, currency symbols).
* `utils.js`: Contains utility functions (ID generation, currency formatting, date formatting, currency conversion).

## Usage:

1.  Ensure all files (`index.html` and the `js/` folder with its contents) are in the same directory.
2.  **Serve the files using a local web server.** This is necessary because the application uses JavaScript Modules, which have CORS restrictions when opened directly via `file:///` protocol.
    * **VS Code:** Use the "Live Server" extension.
    * **Python:** Navigate to the project directory in your terminal and run `python -m http.server`. Then open `http://localhost:8000` in your browser.
    * **Node.js:** Navigate to the project directory and run `npx serve`.

## Future Development Ideas:

* **Import/Export for Exchange Rates:** Dedicated functionality within the "Manage Exchange Rates" modal to import and export *only* the exchange rates data (e.g., from/to a simple JSON file).
* **Filtering Transactions:** Adding UI elements (e.g., dropdowns for category/type, date pickers) to filter the displayed transaction list.
* **Data Visualization:** Incorporating charts (e.g., using a library like Chart.js or D3.js via CDN) to visualize financial data, such as:
    * A pie chart for expenses by category.
    * A bar chart for income vs. outcome over time.
