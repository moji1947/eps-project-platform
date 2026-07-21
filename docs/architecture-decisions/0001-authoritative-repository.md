# ADR-0001: Establish a separate authoritative production repository

- Status: Accepted
- Date: 2026-07-21

## Context

The workspace contains multiple EPS dashboard and quality/change concepts. They are useful references but do not provide an approved production architecture for the operational platform.

## Decision

`C:\Users\Moji\eps-project-platform` is the authoritative local repository for the production platform.

`C:\Users\Moji\Downloads\eps-project-controls-pro` is reference-only, with particular relevance to portfolio, project map, and project workspace UX concepts.

`C:\Users\Moji\Downloads\eps-construction-dashboard` remains a previous concept and is also reference-only.

The production platform will be designed and implemented independently. No existing mockup repository will be modified or used as the production architecture at this stage.

## Consequences

- Technology, deployment, data architecture, security, and module boundaries require explicit decisions in this repository.
- Useful interaction concepts may be reinterpreted, but visual trade dress and frontend structures must not be copied wholesale.
- Future implementation work must target this repository unless a later ADR supersedes this decision.
- A remote origin, infrastructure environment, and application scaffold remain intentionally undecided.

