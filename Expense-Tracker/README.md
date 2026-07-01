# FinTrack Pro

A clean, browser-based Personal Finance Tracker built with **HTML5, CSS3 and JavaScript ES6+**.

## Features

- Add income and expense transactions
- Live balance, income and expense summary
- Canvas-based cash flow chart
- Filter by All, Income and Expense
- Search transaction history
- Delete transactions instantly
- Multi-currency support: USD, EUR, GBP, INR and JPY
- Profile settings: name and preferred currency
- Dark mode with saved preference
- Automatic Local Storage persistence
- One-click reset for saved browser data
- Fully responsive layout

## How to run

Open `index.html` directly in your browser.

No backend, database, package install or login is required.

## Note on currency conversion

The app uses static demo rates inside `script.js` so it can run fully offline in the browser. For real production finance usage, replace those demo rates with a reliable exchange-rate API.


## Testing checklist

Use these steps to verify the app manually:

1. Open `index.html` in Chrome or Edge. Check that the page loads without console errors.
2. Add one income transaction, for example Salary, 50000, INR, Income. Balance, total income and income count should update instantly.
3. Add one expense transaction, for example Rent, 10000, INR, Expense. Balance should become income minus expense.
4. Add a transaction in another currency, such as USD. The summary should convert it into your preferred currency.
5. Check the cash flow chart. Bars should appear after transactions are added.
6. Use the All, Income and Expense filters. Only matching transactions should show.
7. Search by title or category. The transaction list should filter live.
8. Delete a transaction. Counts, balance, history and chart should update.
9. Update profile name and preferred currency. Refresh the page and confirm the settings stay saved.
10. Toggle dark mode. Refresh the page and confirm the selected theme stays saved.
11. Click Reset all saved data. Confirm that transactions, profile and theme return to default.
12. Test responsiveness by opening DevTools and checking mobile sizes like 375px and tablet sizes like 768px.

## Font choice

The project uses **Manrope** for UI text and **Fraunces** for headings and money highlights. This gives it a polished finance/editorial feel instead of a typical neon AI theme. If Google Fonts cannot load, the app automatically falls back to safe system fonts.
