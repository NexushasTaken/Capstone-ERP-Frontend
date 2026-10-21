# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.4.0] - 2026-10-21

### Added

- A Reports page (owner only, under Insights) listing every PDF report: Sales, Stock on hand (as of now), Purchases and Adjustments (daily, weekly or monthly). The Sales page's export button stays.

### Changed

- The sales export dialog is now shared with the Reports page. It works the same.

## [6.3.0] - 2026-10-21

### Changed

- Sidebar regrouped: Operations (Orders, Sales, Purchases, Inventory), Insights (Demand Forecast, Audit logs) and Records (Product, Category, Unit, Driver; was "Basic Informations"). Account Manager is unchanged. Category has its own icon.

## [6.2.0] - 2026-10-21

### Added

- A Purchases page (owner only, under Operations) for stock bought from suppliers. It lists purchases with supplier, order date, items, total cost and status, with a status filter (with counts), search and sort by order date.
- New purchase / Edit: optional supplier, order date, optional note, and items with quantity (in the product's unit), unit cost and a running total.
- Receive: each line starts at the ordered quantity and can be lowered if less arrived. Stock goes up, and the purchase is then locked.
- Cancel an ordered purchase, and "See more" with ordered vs received per line, received date and lead time.
- "Purchase" in the audit log's module filter.

## [6.1.0] - 2026-10-21

### Added

- A Units page (under Basic Informations) to list, add, rename and delete units of measurement, with how many products use each. A unit in use can't be deleted. Editing is owner only.
- The product form has a Unit choice (starts on pc), and the product list and details show it. The price reads as price per unit.
- Product import has an optional Unit column. Blank means pc.
- "Unit" in the audit log's module filter.

### Changed

- Quantities show their unit (e.g. "40 box") in Inventory (list, details, movements, adjustments), Adjust stock, orders (product picker, stock warning, confirm, details) and sales (details, returns).
- Quantity inputs name the unit: "Quantity (box)" and "Reorder point (box)" when adding inventory, "Quantity (box)" in Adjust stock, and the unit next to each order line's quantity.

## [6.0.0] - 2026-10-21

### Added

- Inventory rows have an "Adjust stock" action (owner only). Pick a reason (damaged, lost / missing, found or count correction), enter the quantity (or, for a count correction, the counted amount) and an optional note. The form previews the new stock level.
- An item's "See more" lists its adjustments with reason, signed quantity and note. Damaged customer returns show the sale they came from.

### Changed

- Stock movements read "Sale", "Return" and "Adjustment" (were "Purchase", "Restock" and "Damage").
- The audit log shows "Stock adjusted" in place of "Damaged (current)".

### Removed

- **BREAKING:** the "Restock" and "Mark as damage" actions, and the "Damaged inventory" list in "See more". Use "Adjust stock". Needs Backend 16.0.0.

## [5.7.0] - 2026-10-17

### Added

- A "3 months / Full year" choice on the sales forecast chart. Full year shows the last 52 weeks before the forecast, and the earlier years still line up under it. The chart opens on 3 months.

## [5.6.0] - 2026-10-16

### Changed

- The Inventory page has the same layout as the other list pages: one "Inventory" title, and the list fills the page. The old forecast subtitle and the separate "Inventory items" box are gone.

## [5.5.0] - 2026-10-16

### Removed

- The Sales Overview card (sales total, growth and chart) from the Dashboard.
- The Need ordering and Movement Velocity cards from the Inventory page. The number of products that need ordering is still shown on the Demand Forecast page and in the Dashboard's Restock Summary.

## [5.4.0] - 2026-10-16

### Changed

- The order discount choices and their rates come from the backend's Discounts table instead of being built into the app. The choices read like "Senior citizen (20%)", and they look and behave the same as before.

## [5.3.0] - 2026-10-16

### Removed

- The discount ID number field, and the Discount ID number in order and sale details.

## [5.2.0] - 2026-10-16

### Changed

- The ID number for a senior citizen, PWD or solo parent discount is optional, labelled "ID number (optional)".

## [5.1.0] - 2026-10-16

### Added

- Pick an order's discount from the legal presets: Senior citizen (20%), PWD (20%) or Solo parent (10%). The percent fills in and can't be changed, and the customer's ID number is required.

### Changed

- Only the owner sees the Custom discount option to type their own percent. When a secretary edits an order that has the owner's custom discount, the discount shows as "Set by the owner" and can't be changed.
- Order details, sale details, the order review step and the totals show the discount type, e.g. "Discount (Senior citizen, 20%)", plus the ID number for presets.

## [5.0.0] - 2026-10-16

### Added

- Return items on a completed sale: from the sale's details, enter how many of each product came back (some or all, over as many visits as needed), whether each is good (back to stock) or damaged, and a reason. The dialog shows the refund, after the order discount, before saving.
- A Returns tab on the Sales page lists every return with its sale, product, customer, quantity, condition, refund, reason and who processed it, with search and a date range.

### Changed

- **BREAKING:** the secretary can open the Sales page and record returns; only the owner sees Export PDF.
- The Sales table shows Total, Refunded and Total after refunds, and the list total is after refunds. Sale details show the same figures and a Returned column per product.

### Removed

- **BREAKING:** the Restock type (Receive stock / Return Stock) and the Damage type (Current Item / Return Item). Restock is always stock received, and Mark as damage always takes the units out of stock. Customer returns are recorded from the sale.

## [4.2.0] - 2026-10-16

### Added

- Import categories, products and drivers from a .csv or .xlsx file (owner only), from a new "Import" button next to Add on each page. A "Template" button downloads a CSV with the expected headers; headers match ignoring case and spaces.
- Product files can include Category (by name), Quantity and Reorder point; rows with both stock columns also get their opening stock.
- Picking a file checks every row straight away, including names that already exist, names repeated in the file and categories that don't exist. Bad cells are highlighted with the reason in a tooltip, all problems are listed under the preview, and Import stays disabled until the file has none. Picking the same file again after fixing it re-runs the checks.
- Import saves every row or none, and failures (server unreachable, session expired, old backend) show a plain message instead of a technical error.
- Needs Backend 9.2.0.

## [4.1.0] - 2026-10-16

### Added

- Needs Backend 9.1.0. Sales has an "Export PDF" button: pick Daily, Weekly (Monday to Sunday) or Monthly and a day, and the sales report for that period downloads as a PDF.

### Fixed

- The backend proxy passes response bodies through as raw bytes and forwards `Content-Disposition`, so file downloads such as PDFs arrive intact with their file name.

## [4.0.0] - 2026-10-16

### Changed

- **BREAKING:** Needs Backend 9.0.0. An inventory item is one product's stock in the store: "Add inventory" asks only for the product, quantity and reorder point, and "Edit inventory" shows only the product.
- The inventory list, its details, Movement Velocity and the dashboard's inventory overview no longer show a warehouse; the dashboard list shows the category instead. The Inventory sidebar icon is now a box icon.
- The inventory list's search no longer matches warehouse names.

### Removed

- **BREAKING:** The Warehouse page, its sidebar entry and permissions, the inventory warehouse filter, the "Warehouse ID" sort and the Warehouse audit log module filter.
- **BREAKING:** The "Pick up address" field on delivery orders (create, edit, order details and sale details).

## [3.23.0] - 2026-10-16

### Changed

- The "Create order" and "Edit order" forms show "Not enough stock: only N available." under a quantity that is more than the stock, and "Add order" / "Save changes" stay disabled until it is lowered, instead of failing only after the order is sent.

## [3.22.0] - 2026-10-16

### Changed

- The "Create order" form starts with the Walkin order type selected, also after an order is added.

## [3.21.2] - 2026-10-16

### Fixed

- The confirm-order lines show only the product name, without a product code under it.

## [3.21.1] - 2026-10-16

### Fixed

- The confirm-order lines show each product's code (PR-#) and the product form's category list shows each category's code (CAT-#), instead of a raw "ID: #" label.

## [3.21.0] - 2026-10-15

### Changed

- The "Updating..." note on the orders, sales, drivers, audit logs and forecast lists sits after the Rows dropdown instead of at the end of the "Showing ..." count.

## [3.20.1] - 2026-10-15

### Fixed

- Tables show "Loading" while the next page, a page number, a new search, filter or sort is loading, instead of leaving the previous rows on screen. Saving or deleting a row still updates the list in place without flashing.

## [3.20.0] - 2026-10-15

### Changed

- Modal headers put the title and the record on one row at the same size, e.g. "Sales forecast · Coke 1.5L" or "Edit product · PRD-0003", instead of a small caption above the title. Captions that only repeated the title ("New product item") are gone.
- The order and sale details headers show "Order details · ORD-0012" / "Sale details · SAL-0007"; the customer name moved into the details as "Customer".
- Edit warehouse shows the warehouse's ID in its header, like the other edit forms.
- The create, review and edit order modals use the same header size as every other modal.

## [3.19.0] - 2026-10-15

### Changed

- Every week on the demand chart has its own label ("W2"), with the month (and the year on the first week and in January) under the first week of each month. On narrow screens the labels turn sideways instead of being skipped.

## [3.18.0] - 2026-10-15

### Changed

- The demand chart's year buttons are labelled "Compare with earlier years:" and name the real years ("2025", "2025 + 2024", "All (2025–2021)"), and sit right above the chart they change.
- The table under the demand chart is titled "Next 4 weeks vs the same weeks in earlier years", shows each row's dates, says whether a total is expected or sold, puts the likely range on its own line, and reads "Forecast is 12% higher".

## [3.17.0] - 2026-10-15

### Changed

- The demand chart dialog explains itself: a "Weekly sales and forecast" heading with the dates and number of weeks shown, and a one-line guide to the lines and the shaded band.
- The chart's weeks are labelled by week of the month ("Oct W2"), the first week shows its year, and the tooltip shows the week's dates ("Week of Oct 12 – Oct 18").
- A "This week" line marks where the forecast starts, and a year line marks where a new year starts. With *Compare with: None* the chart ends at the last forecast week instead of showing empty weeks.
- "Units" is now "Sold" in the chart axes and the same-weeks table, and the demand line is called *Sold*.
- *Next 4 weeks* is now *Expected to sell (next 4 weeks)*, with the likely range on its own line.
- The forecast test chart uses the same week labels and axis wording.

### Fixed

- The chart note no longer says "a normal month" for a weekly range.

## [3.16.0] - 2026-10-15

### Changed

- Clicking a row in *Products*, *Sales*, *Orders* and *Inventory* opens its details, the same as *See more*. The buttons and the actions menu in the row still do only their own thing.
- The *Action* column header in *Products*, *Sales* and *Orders* is now blank.

## [3.15.0] - 2026-10-15

### Added

- *Products*, *Inventory* and *Demand Forecast* show a summary line under the header: products without a category, the stock status breakdown, and how many products need ordering. *Sales* keeps its count and total.

### Removed

- The row-count badge next to each list page title. The count is still shown at the bottom of the table.

## [3.14.1] - 2026-10-15

### Fixed

- The table page buttons highlight on hover the same way the sidebar items do, in light and dark mode, and page numbers keep an even width.

## [3.14.0] - 2026-10-15

### Removed

- The *Export to CSV* button is gone from the *Products*, *Inventory*, *Orders*, *Sales* and *Demand Forecast* pages.

## [3.13.0] - 2026-10-15

### Removed

- The *Sales* table no longer has a *Status* column: every sale is a completed order, so it always said the same thing. The sale's details still show it.

## [3.12.0] - 2026-10-15

### Changed

- The *Sales* date filter's calendar only covers the period that has sales: the year and month dropdowns run from the first sale to the latest one, days outside it are greyed out, and it opens on the latest sale's month (needs Backend 8.1.0).

## [3.11.0] - 2026-10-15

### Changed

- The *Sales* date filter's calendar has month and year dropdowns, so a far-off month (e.g. January 2024) is two clicks away instead of many arrow clicks.

## [3.10.1] - 2026-10-15

### Fixed

- The *Dashboard* sales chart shows the current month: its default range now runs to today instead of the 1st of this month (needs Backend 8.0.1, which includes the end day).
- The *Dashboard* sales chart labels each point with its own month. Before, a month without sales shifted every later label by one.

## [3.10.0] - 2026-10-15

### Added

- *Sales* has a date filter: All time, Today, This week (Monday to Sunday), This month, Last 30 days, or any day or range picked on a calendar. The range is kept in the address bar.
- *Sales* can be sorted by date (newest or oldest first), total (high or low first) or customer (A to Z or Z to A).
- *Sales* shows how many sales match the search and filters and how much they total, across all pages.

### Changed

- A sale's date on *Sales* is when the order was completed (needs Backend 8.0.0).

### Fixed

- Searching *Sales* by product shows each matching sale with all of its products and its full total, not just the searched product.

## [3.9.0] - 2026-10-15

### Added

- *Products*, *Categories*, *Accounts*, *Drivers*, *Warehouses*, *Orders*, *Sales*, *Demand Forecast* and *Audit logs* keep their search, filters, sort and page in the address bar, like *Inventory* already did. A refresh keeps the list where it was, Back/Forward step through earlier views, and the link can be bookmarked or shared. Rows per page is still remembered per browser.

### Fixed

- In the *Inventory* search box, a trailing space or text typed while the list was updating is no longer wiped out once the search is applied.
- The *Inventory* search no longer waits longer than it should when the page refreshes its data while you type.
- Changing an *Inventory* filter, sort or page no longer drops other parameters from the address bar.

## [3.8.2] - 2026-10-13

### Security

- Signing in before the page has finished loading no longer puts the email and password in the address bar.

## [3.8.1] - 2026-10-12

### Changed

- In *Create order* and *Edit order*, the _Delivery rider_ field is now called _Delivery driver_, matching the *Drivers* module. Needs Backend 7.0.0 or later.

## [3.8.0] - 2026-10-12

### Changed

- The demand chart's *Compare with* buttons start with _None_, the new default: the chart opens with no earlier years laid over it. The note under the chart only mentions the grey lines when they are shown.

## [3.7.0] - 2026-10-12

### Changed

- In *Create order* and *Edit order*, the product's _Stock_ updates as the quantity is typed, showing what would be left after this order (in *Edit order*, the quantity the order already holds counts as available). It turns red below 0. This is only a preview; stock changes when the order is saved.

## [3.6.0] - 2026-10-12

### Changed

- In *Create order* and *Edit order*, products in the item dropdown and under a chosen product show their ID as _PR-12_ followed by the current stock across all warehouses (e.g. _PR-12 · Stock: 40_), instead of _ID: 12_. Needs Backend 6.2.0.
- Creating an order or changing its status refreshes the stock shown in the product picker.

## [3.5.0] - 2026-10-12

### Added

- _Processing_ orders have an *Edit* button that opens *Edit order*. Add, remove or change the quantity of items, and change the discount, delivery rider and addresses; the order type and customer are shown but locked. A "not enough stock" rejection is shown inside the modal. Needs Backend 6.1.0.

## [3.4.0] - 2026-10-10

### Changed

- The forecast no longer calls itself "AI". The method column shows _SSA (yearly pattern)_ or _SSA (short pattern)_, the accuracy lines on the Demand Forecast page, the Restock Summary card and the demand chart compare "the SSA forecast" with the simple 4-week average, and the forecast test's chart legend and messages say "SSA" instead of "the AI". Needs Backend 6.0.0.

## [3.3.0] - 2026-10-10

### Added

- A "Show test" switch under the demand chart, off every time the chart opens. It shows the forecast test for that product: choose how many weeks to hide (4, 8, 12, 26 or 52) and when they end (now, 3, 6 or 9 months ago). The test chart draws the real sales, the AI's forecast with its 95% range and the simple 4-week guess over the hidden weeks, with how far off each was. Choices without 2 years of earlier sales are disabled, and tests of 26 or 52 weeks warn that they look much further ahead than the app's 4-week forecast. Needs Backend 5.1.0.

### Changed

- The demand chart dialog scrolls when its content is taller than the screen.

## [3.2.0] - 2026-10-09

### Changed

- The demand chart compares the forecast with the same season in earlier years: 3 months either side of the forecast start, with the same weeks of each earlier year as a grey line (lighter the older the year) and the forecast weeks highlighted. Buttons choose last year, 2 years, 3 years or all years. Needs Backend 5.0.0.

### Added

- A "Same 4 weeks" table under the demand chart: the forecast next to what sold in the same 4 weeks of each shown year, and how much higher or lower the forecast is.

### Removed

- The 6 months / 1 year / 2 years / All range buttons and the dotted "same weeks last year" line.

## [3.1.2] - 2026-10-09

### Fixed

- The forecast's method labels and hints also cover the ML.NET experiment backend: its short-pattern method shows as "AI (short pattern)", and the "Average" and "Average (fallback)" hints are true for both backends.

## [3.1.1] - 2026-10-09

### Fixed

- The Demand Forecast page's pagination sits at the right edge, like the other list pages, instead of floating in the middle.

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
