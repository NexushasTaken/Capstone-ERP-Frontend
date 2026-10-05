# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
