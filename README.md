# Money Tracker Pro (In-Development)

Money Tracker Pro is a web-based application designed to help users manage their finances across multiple profiles. Users can track income and expenses for personal use, different business ventures, or any other distinct financial entities. The application aims to provide a clear, user-friendly interface for financial oversight, with data stored locally in the browser.

## Features Implemented So Far:

* **Multi-Profile Management:**
    * **Create Profiles:** Users can create multiple financial profiles (e.g., "Personal," "Company A," "Side Hustle").
    * **Profile-Specific Currency:** Each profile can have its own default currency (IDR, USD, JPY, EUR, SGD supported).
    * **Select Active Profile:** Users can select a specific profile to view its dashboard and manage its transactions.
    * **"View All Profiles" Mode:** A dashboard view that aggregates financial summaries (currently sums amounts directly, future versions may include currency conversion logic).
* **Transaction Management (Per Profile):**
    * **Add Income/Outcome:** Users can add income and outcome transactions to the currently selected profile.
    * **Transaction Details:** Each transaction includes a description, amount, date, and time.
    * **Edit Transactions:** Existing transactions can be modified (description, amount, date, type).
    * **Delete Transactions:** Transactions can be removed from a profile.
* **Dashboard & Summary:**
    * **Financial Overview:** Displays Total Income, Total Outcome, and Net Balance for the selected profile or all profiles.
    * **Recent Transactions List:** Shows a list of transactions for the selected profile, sorted by date (newest first). In "All Profiles" mode, it lists transactions from all profiles, indicating the source profile.
* **Data Persistence:**
    * **Local Storage:** All profile and transaction data is saved in the browser's `localStorage`, allowing data to persist between sessions.
* **User Interface:**
    * **Responsive Design:** Built with Tailwind CSS for a clean and responsive layout.
    * **Icons:** Uses Lucide Icons for better visual cues on buttons and important elements.
    * **Modals:** Non-intrusive modals for adding/editing profiles and transactions.
* **Settings:**
    * **Global Default Currency:** Users can set a default currency that is pre-selected when creating new profiles.

## Technology Stack::

* **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
* **Styling:** Tailwind CSS
* **Icons:** Lucide Icons
* **Data Storage:** Browser `localStorage`

## Current Structure (Single HTML File):

The application is currently contained within a single `index.html` file which includes:
* HTML structure for the layout, modals, and various UI elements.
* CSS (inline `<style>` block and Tailwind CSS via CDN) for styling.
* JavaScript (inline `<script>` block) for all application logic, including:
    * State management.
    * DOM manipulation and rendering.
    * Event handling.
    * `localStorage` interaction.
    * Modal controls.
    * Profile and transaction CRUD (Create, Read, Update, Delete) operations.

## How to Run:

1.  Save the HTML code as an `.html` file (e.g., `money_tracker.html`).
2.  Open this file in a modern web browser that supports `localStorage`.

## Future Development Ideas:

* **Profile Editing/Deletion in UI:** More explicit controls for managing profiles beyond just adding.
* **Import/Export Functionality:** Implement the logic for importing and exporting data (e.g., as JSON).
* **Advanced "All Profiles" View:** Currency conversion for accurate aggregation when profiles use different currencies.
* **Data Visualization:** Charts and graphs for financial insights.
* **Transaction Categories & Filtering/Sorting.**
* **Recurring Transactions.**
* **Budgeting Features.**
* **Code Modularization:** Splitting JavaScript into separate files for better organization (as requested by the user for next steps).
