# EPS Project Quality Overview

Interactive construction QA/QC portfolio prototype for comparing quality performance across projects.

## Live application

https://moji1947.github.io/eps-project-platform/

## Included

- Rule-based QHI calculations with critical overrides
- Seven interactive portfolio KPIs
- Business-unit and quality-status chart filtering
- Search, combined filters, removable chips, sorting and pagination
- Ranked projects requiring attention
- Refresh-safe project detail routes
- Excel, XLS and CSV import with sheet selection, column mapping, validation and preview
- Filtered Excel and CSV export
- Browser persistence, restore demo data and clear-data confirmation
- Twelve fictional construction projects across green, yellow, red and insufficient-data states

Prototype records are stored in localStorage. No project data is sent to a server.

## Run locally

```powershell
npm install
npm run dev
```

Production build:

```powershell
npm run build
npm run preview
```
