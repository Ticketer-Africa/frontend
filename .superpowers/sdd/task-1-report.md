# Task 1 Report: Shared Routing and Loading State

## Changes

- Extended the header's `isHome` predicate to cover ticket, organizer, verification, wallet, settings, legal, and nested organizer routes while retaining existing dark-route checks.
- Applied the same route scope to `RouteLoader`, which now uses `home-theme` and `--home-bg` for those routes.
- Kept the loader spinner and added an accessible status label for screen readers.

## Verification

- `git diff --check`: passed.
- `npm run lint`: could not run to completion because the repository has no ESLint configuration or ESLint packages; `next lint` opens its first-time interactive setup prompt instead of returning a lint result.

## Scope

- Modified only the two Task 1 implementation files and this required report.
