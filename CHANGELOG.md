# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
