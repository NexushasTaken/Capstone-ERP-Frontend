# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-10-09

### Added

- Demand Forecast page in the sidebar (Operations), for owners and secretaries: the full forecast table with search by product, an "All products / Need ordering" filter, rows per page and Export to CSV.
- The demand chart has 6 months / 1 year / 2 years / All range buttons and a dotted "Same weeks last year" line.

### Changed

- The dashboard shows a Restock Summary (products that need ordering, forecast accuracy and the 5 running out first) in place of the full forecast table, with a "View all" link to the new page.
- Inventory Overview on the dashboard takes half the width, beside the Restock Summary, instead of being squeezed.

## [3.0.0] - 2026-10-09

### Added

- Clicking a product in the forecast card (or its *Chart* button) opens its weekly demand chart: the last 26 weeks of sales, the dashed 4-week forecast and the shaded 95% range.

### Changed

- **BREAKING:** Needs Backend 4.0.0. The dashboard's *Predicted stockouts* card is now *Demand Forecast & Restock Recommendations*. For each product it shows the forecasted demand for the next 4 weeks with its range, stock on hand, when it runs out, the suggested order and how the forecast was made. Products that run out first are on top.
- The card shows how accurate the forecast was over the last 12 weeks, compared with a simple 4-week average, and how many products need ordering.
- *Force Forecast* refreshes the card, the charts and the inventory page's count together.
- The inventory page's *Forecast risks* card is now *Need ordering* and counts products with a suggested order.

## [2.0.1] - 2026-10-09

### Fixed

- After the browser restores an open dashboard tab, the sidebar modules and the user's name and role now load right away. Before, they were missing for up to a minute.

## [2.0.0] - 2026-10-08

### Changed

- **BREAKING:** Needs Backend 3.0.0. An inventory item is now one product in one warehouse, shown by its product name.
- *Add inventory* asks for product, warehouse, quantity and reorder point. Adding a product that is already in that warehouse shows an error.
- *Edit inventory* only changes the reorder point. The product and warehouse are shown but can't be changed. The reorder point must be above 0.
- The *Restock* option *Increase Stock* is now *Receive stock*. The audit log calls it *Stock received*.
- The inventory table's *Name* column is now *Product*. Search and the A–Z sorts are by product name.
- Inventory details show the category instead of the arrival date.

### Removed

- The *Arrived from* / *Arrived to* filters, and the *Date arrived* column in the inventory CSV export.

## [1.14.1] - 2026-10-06

### Changed

- Order and sale details always show the subtotal and discount, even when the discount is 0.

## [1.14.0] - 2026-10-06

### Added

- Create order has a *Discount (%)* field. The items table and the review step show the subtotal and discount above the total.
- Order and sale details show the subtotal and discount when an order has one.
- Orders and sales CSV exports include the discount percent.

### Changed

- Order and sale totals are shown after the discount.


## [1.13.0] - 2026-10-06

### Added

- Order details show when the order was shipped, completed or cancelled.

### Changed

- The order actions menu no longer lists the order's current status.

## [1.12.0] - 2026-10-06

### Added

- Order details show the order type, status and total quantity.

### Changed

- Sales now have a "See more" button that opens the sale details in a window, instead of expanding the row.
- Order details hide the driver and addresses for walk-in orders.

## [1.11.0] - 2026-10-06

### Changed

- Orders now have a "See more" button that opens the order details in a window, instead of expanding the row.

## [1.10.1] - 2026-10-06

### Changed

- Modals open and close instantly, without the fade and zoom animation.

### Fixed

- A modal opened on top of another one (such as the order confirmation) now darkens the background again.

## [1.10.0] - 2026-10-06

### Added

- Product *See more* history now shows who created the product, when it was last updated and by whom.

## [1.9.1] - 2026-10-06

### Fixed

- The audit-log Module filter now includes the Account option.

## [1.9.0] - 2026-10-05

### Added

- Every list (products, categories, warehouses, inventory items, orders, sales, drivers, accounts and audit logs) has a Rows dropdown to show 10, 25 or 50 rows per page. Each list remembers its choice in the browser.

### Changed

- Table column headers stay at the top while scrolling a long list.
- A table's horizontal scrollbar stays at the bottom of the visible area instead of below the last row.
- The pagination footer stays at the bottom of the page on every list.

## [1.8.1] - 2026-10-05

### Fixed

- The lock icon in the login password field lines up with the email icon.

## [1.8.0] - 2026-10-05

### Added

- Password fields on the login page, the create account dialog and the account settings page have an eye button to show or hide the password.

## [1.7.0] - 2026-10-05

### Added

- The inventory list can be filtered by warehouse, category, quantity range and date arrived, with a Clear filters button.
- The inventory table and its CSV export show each item's category.

### Changed

- The inventory search, filters, sort and page are kept in the address bar, so a refresh or a shared link restores them.
- Items in the inventory filter dropdowns capitalize every word.

## [1.6.0] - 2026-10-05

### Changed

- List pages have a new header: title and buttons on the first row, a wider search box with the filters beside it on the second, so long search hints are no longer cut off and extra filters wrap cleanly.
- The Products (Categorized / Uncategorized) and Inventory (All / Available / Low stock / Critical) filters are now dropdowns that show the count for each option.

## [1.5.0] - 2026-10-05

### Changed

- Searching Products, Categories, Warehouses, Inventory, Orders, Sales, Drivers and Accounts now matches every text column in the list, and the record ID (e.g. `PR-12` or `12`). The search boxes list what they match.

## [1.4.0] - 2026-10-05

### Added

- Every form shows what's wrong under the field itself (after you leave the field or try to submit), instead of only greying out the save button.
- Errors the server finds, such as an email that's already taken or a wrong current password, appear under the matching field in the login, create account and account settings forms.
- Create order flags each order line's missing product or invalid quantity on that line.

### Changed

- Form rules now match the server's: adding inventory needs a reorder point above 0, and marking damage can't exceed the available stock for current items.

## [1.3.0] - 2026-10-05

### Added

- Warehouse page under Basic Informations: list warehouses with their item counts, search by name or address, sort, page, and add, edit or delete warehouses.

### Changed

- The dashboard shows total stock instead of total warehouse capacity.
- The "Add warehouse" link in the inventory form opens the Warehouse page.

### Removed

- Warehouse capacity: the capacity charts on the Inventory page and the maximum capacity field on warehouses. Requires backend 2.0.0.

## [1.2.0] - 2026-10-05

### Added

- Delete accounts from the Accounts page, with a confirmation dialog. Delete is not offered for the default administrator or your own account.

## [1.1.0] - 2026-10-05

### Changed

- The sidebar profile card now opens a menu with Account settings and Log out instead of a profile modal.

## [1.0.0] - 2026-10-05

First versioned release of the ERP dashboard.

### Added

- Login and logout, with dashboard routes protected by an auth guard.
- Dashboard home with sales overview and chart, inventory overview and predicted stockouts.
- Products and categories pages with add/edit modals and server-side paging, search and sort.
- Inventory page: stock, warehouse capacity and forecast risk, restocking, marking items as damaged, damaged and movement items, and movement velocity.
- Orders page: create and review orders, status changes and filters.
- Drivers page: add, update and delete drivers.
- Sales page.
- Account manager: list accounts with server-side paging, search and sort, create accounts and change roles.
- Account settings: update profile and credentials.
- Audit logs page and audit log sidebar.
- Theme based on shadcn/ui tokens, with consistent tables, modals and buttons.

### Changed

- All backend calls go through a single catch-all API proxy.
