## Why

No test coverage exists in the codebase. Adding Jest unit tests establishes a testing foundation, enabling confident refactoring and catching regressions early. Starting with pure functions provides quick wins before tackling modules with external dependencies.

## What Changes

- Add Jest testing framework with TypeScript support (ts-jest)
- Add test script to package.json
- Add ESLint with TypeScript support and lint script to package.json
- Create unit tests for all `Utility` class methods with date mocking via `jest.useFakeTimers()`
- Establish test file conventions (`*.test.ts` alongside source or in `tests/` directory)

## Capabilities

### New Capabilities

- `unit-testing`: Jest configuration, test scripts, and test coverage for pure utility functions and SNKRS helper methods

### Modified Capabilities

None - this change adds testing infrastructure without modifying existing functionality.

## Impact

- **Dependencies**: New devDependencies (pinned versions, no known vulnerabilities as of 2026-02-21):
  - `jest@^30.2.0`
  - `ts-jest@^29.4.6` (supports Jest 30.x per peerDependencies)
  - `@types/jest@^30.0.0`
  - `eslint` (latest stable)
  - `@typescript-eslint/parser` (latest stable)
  - `@typescript-eslint/eslint-plugin` (latest stable)
- **Config files**: New `jest.config.js`, new `eslint.config.js` (flat config)
- **Scripts**: New `test` and `lint` scripts in package.json
- **Code**: No production code changes; tests validate existing behavior
