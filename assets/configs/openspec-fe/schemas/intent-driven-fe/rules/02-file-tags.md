# File Tag Rules

## [NEW]
Create only declared component, hook, page, style, test, or support file within approved ownership. Reuse approved primitives, tokens, assets, contracts, and i18n.

## [MODIFY]
Change only approved bounded section. Preserve public behavior and component API unless contract change is documented.

## [TEST]
Test declared observable behavior, then run focused and affected neighboring tests.

## [WIRE]
Connect approved routing, layouts, state, hooks, data, and entry points only. Preserve Server/Client ownership and cache/navigation constraints.

## [DELETE]
Check callers, routes, exports, assets, tests, and shared impact before removal.

## [EXISTING]
Reference or reuse only. Never modify. Stop and update artifacts if modification becomes necessary.
