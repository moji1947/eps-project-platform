# Product

## Name

EPS Project Progress, Quality and Change Control Platform

## Register

product

## Platform

web

## Product role

The platform will become the operational source of truth for construction progress submissions, review and approval, site issues, QA/QC control, drawing-revision awareness, site acknowledgements, inspections, CQD impact, and management attention.

## System boundaries

- The central application database will own operational workflow records.
- Conzol will remain authoritative for official documents, drawings, revisions, submissions, and document approval workflow.
- Excel will be limited to baseline import, historical migration, controlled bulk upload, export, and transition backup.
- Power Automate may support migration, scheduled Conzol exports, notifications, staging, and import monitoring; it will not be the permanent progress-entry channel.
- Looker Studio may remain a transitional reporting consumer while platform dashboards are validated.

## Users

- Site Engineer
- Site Supervisor
- QA/QC Engineer
- QA/QC Manager
- Project Engineer
- Designer
- Document Controller
- Project Control
- Project Manager
- Contractor
- Supplier
- System Administrator

## Design direction

The interface must be original to EPS: operational, professional, construction-oriented, legible outdoors, mobile-first for site actions, and appropriately dense on desktop control-center screens.

The `eps-project-controls-pro` repository may inform useful portfolio, map, and project-workspace interactions. Its visual identity, layout, component styling, navigation treatment, and application architecture are not production specifications.

## Initial delivery boundary

The MVP is expected to cover identity and project access, project setup, one EPS Standard baseline importer, activity assignment, direct progress updates, evidence, review and approval, site issue and QA/QC workflows, drawing revision tracking, acknowledgement, inspection and closure, basic CQD impact, PM dashboards, audit history, exports, and the portfolio map.

Advanced BIM viewing, AI prediction, and full real-time Conzol integration are excluded from the first MVP.

