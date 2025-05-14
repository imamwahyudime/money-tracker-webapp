# Money Tracker Pro

Money Tracker Pro is a client-side web application designed to help users track their income and expenses across different financial profiles. It utilizes `localStorage` to save data directly in the user's browser, ensuring privacy and offline accessibility once loaded. The application supports multiple currencies, exchange rate management, transaction categorization, and theme customization.

This project is built with HTML, CSS (Tailwind CSS via CDN for utilities, and custom CSS for theming/styling), and vanilla JavaScript using ES6 Modules.

## Features:

* **Multiple Profiles**: Create and manage separate financial profiles (e.g., personal, business, travel fund).
* **Transaction Tracking**: Log income and outcome transactions with descriptions, amounts, dates, and categories.
* **Currency Management**:
    * Each profile can have its own default currency.
    * Set a global display currency for viewing aggregated data from "All Profiles".
    * Manage exchange rates between supported currencies.
* **Categorization**: Assign transactions to predefined or custom categories (income, outcome, universal).
* **Dashboard Summary**: View total income, total outcome, and net balance for the selected profile or all profiles, based on a configurable date range or projection date.
* **Date Projection**: Preview financial summaries up to a future date.
* **Theming**: Choose between Light, Dark, and Sepia themes for user comfort.
* **Data Persistence**: All data is saved locally in the browser's `localStorage`.
* **Data Management**:
    * Import and export complete application data (profiles, transactions, settings) in JSON format.
    * Import and export exchange rate data in JSON format.
* **Responsive Design**: Basic responsiveness for usability on different screen sizes.

## Tech Stack:

* **HTML5**
* **CSS3**:
    * Custom CSS for base styling, component styles, and theming (using CSS Variables).
    * **Tailwind CSS (v3 via Play CDN)**: For utility-first styling.
* **JavaScript (ES6+)**:
    * Vanilla JavaScript (no frameworks like React, Vue, or Angular).
    * ES6 Modules for code organization.
* **Lucide Icons (via CDN)**: For icons.
* **Browser `localStorage`**: For data storage.

## Project Structure:

├── css/
│   ├── main.css        # Custom global and component styles
│   └── theme.css       # CSS variables for theming (light, dark, sepia)
├── js/
│   ├── config.js       # Global configuration constants
│   ├── domElements.js  # Centralized DOM element selections
│   ├── main.js         # Main application entry point, event listeners, render orchestration
│   ├── utils.js        # Utility functions (formatting, ID generation, etc.)
│   ├── handlers/       # Modules for handling user interactions and events
│   │   ├── appSettingsAndDataHandlers.js
│   │   ├── categoryHandlers.js
│   │   ├── exchangeRateHandlers.js
│   │   ├── profileHandlers.js
│   │   └── transactionHandlers.js
│   ├── services/       # Modules for specific services
│   │   ├── storageService.js
│   │   └── themeService.js
│   ├── state/          # Modules for managing application state
│   │   ├── appState.js
│   │   ├── categoryState.js
│   │   ├── exchangeRateState.js
│   │   ├── profileState.js
│   │   └── transactionState.js
│   └── ui/             # Modules for rendering UI components
│       ├── appSettingsUI.js
│       ├── categoryUI.js
│       ├── dashboardUI.js
│       ├── exchangeRateUI.js
│       ├── modalUIs.js
│       ├── profileUI.js
│       └── transactionUI.js
├── index.html          # Main HTML file
└── README.md           # This file


## Getting Started:

### Prerequisites:

* A modern web browser that supports ES6 Modules (e.g., Chrome, Firefox, Edge, Safari).
* An internet connection (for loading Tailwind CSS and Lucide Icons from CDNs).

### Running Locally:

1.  **Clone the repository (or download the files):**
    ```bash
    git clone [https://github.com/your-username/money-tracker-pro.git](https://github.com/your-username/money-tracker-pro.git)
    cd money-tracker-pro
    ```
    (Replace `your-username/money-tracker-pro.git` with your actual repository URL if you've pushed it.)

2.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser.

    *Note: Some browsers might have security restrictions when running ES6 modules directly from the local file system (`file:///...`). If you encounter issues related to module loading, serving the files through a simple local web server is recommended. Many code editors (like VS Code with the "Live Server" extension) provide this functionality easily, or you can use Python's built-in HTTP server:*
    ```bash
    # If you have Python 3 installed
    python -m http.server
    ```
    *Then navigate to `http://localhost:8000` (or the port shown) in your browser.*

## How to Use:

1.  **Profiles**:
    * Click the "+" button in the "Profiles" section to add a new financial profile (e.g., "Personal Savings," "Work Expenses").
    * Specify a name, currency, and the day your financial month starts.
    * Click on a profile name in the list to view its details and transactions.
    * Use the edit (pencil) and delete (trash) icons next to each profile to manage them.
    * Click "View All Profiles" to see an aggregated dashboard view.

2.  **Transactions**:
    * Once a profile is selected (or "All Profiles" for adding to a specific profile if that feature is enhanced), use the "Add Income" or "Add Outcome" buttons.
    * Fill in the description, amount, category, and date/time for the transaction.
    * For outcomes, you can mark them as "reimbursed" (e.g., a work expense you'll get back).
    * Edit or delete transactions from the list.

3.  **App Settings**:
    * **Display Currency**: Choose the currency for the "All Profiles" dashboard summary and as the default for new profiles.
    * **App Theme**: Select Light, Dark, or Sepia theme.
    * **Manage Categories**: Add, edit, or delete transaction categories.
    * **Manage Exchange Rates**: View and update exchange rates. You can also import/export rates.

4.  **Data Management**:
    * **Import App Data**: Load all application data from a previously exported JSON file. This will overwrite current data.
    * **Export App Data**: Save all current application data (profiles, transactions, settings, etc.) to a JSON file as a backup or for migration.

5.  **Date Projection**:
    * Use the "Preview Until" date picker in the dashboard header to see your financial summary projected up to a specific date. Click the calendar-X icon to reset to the current financial period.

## Future Enhancements (Ideas):

* Graphs and charts for visualizing spending patterns.
* Recurring transactions.
* Budgeting features.
* More robust data validation.
* User authentication and cloud sync (would require a backend).
* Progressive Web App (PWA) capabilities for better offline use and installation.
* Integration of a build step for Tailwind CSS (purging, `tailwind.config.js`) for production.
* Unit and end-to-end testing.

## Contributing:

Contributions, issues, and feature requests are welcome. Please feel free to fork the repository and submit a pull request.

## License:

This project is license under GNU General Public License v3.0. Feel free to use, modify, and distribute. 
