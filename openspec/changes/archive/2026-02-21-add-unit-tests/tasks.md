## 1. Install Dependencies

- [x] 1.1 Install Jest and ts-jest: `pnpm add -D jest@^30.2.0 ts-jest@^29.4.6 @types/jest@^30.0.0`
- [x] 1.2 Install ESLint with TypeScript support: `pnpm add -D eslint typescript-eslint`
- [x] 1.3 Verify no vulnerabilities with `pnpm audit`

## 2. Configuration Files

- [x] 2.1 Create `jest.config.js` with ts-jest preset and node test environment
- [x] 2.2 Create `eslint.config.js` with TypeScript parser and recommended rules
- [x] 2.3 Add `test` script to package.json: `"test": "jest"`
- [x] 2.4 Add `lint` script to package.json: `"lint": "eslint src/"`

## 3. Test File Setup

- [x] 3.1 Create `src/utility/utility.test.ts` with Jest imports and describe block
- [x] 3.2 Add `beforeEach` with `jest.useFakeTimers()` and `afterEach` with `jest.useRealTimers()`

## 4. Utility.getDate() Tests

- [x] 4.1 Test returns frozen date when time is mocked to `2026-02-19T12:00:00Z`
- [x] 4.2 Test handles year boundary with `2026-12-31T23:59:59Z`

## 5. Utility.getFullYear() Tests

- [x] 5.1 Test returns mocked year `2026` when time is set to `2026-06-15T00:00:00Z`

## 6. Utility.getCurrentSeason() Tests

- [x] 6.1 Test returns `"spring-summer"` before July 1 (`2026-06-30T23:59:59Z`)
- [x] 6.2 Test returns `"fall-winter"` on July 1 (`2026-07-01T00:00:00Z`)
- [x] 6.3 Test returns `"fall-winter"` after July 1 (`2026-11-15T00:00:00Z`)

## 7. Utility.getThursdayOfCurrentWeek() Tests

- [x] 7.1 Test returns same day when today is Thursday (`2026-02-19`)
- [x] 7.2 Test returns upcoming Thursday when today is Monday (`2026-02-16` → `2026-02-19`)
- [x] 7.3 Test returns upcoming Thursday when today is Friday (`2026-02-20` → `2026-02-26`)

## 8. Utility.getFridayOfCurrentWeek() Tests

- [x] 8.1 Test returns same day when today is Friday (`2026-02-20`)
- [x] 8.2 Test returns upcoming Friday when today is Monday (`2026-02-16` → `2026-02-20`)
- [x] 8.3 Test returns upcoming Friday when today is Saturday (`2026-02-21` → `2026-02-27`)

## 9. Utility.convertMonthToNumber() Tests

- [x] 9.1 Test converts all 12 valid month abbreviations to 2-digit strings
- [x] 9.2 Test returns `undefined` for invalid input like `"Foo"`

## 10. Utility.getTomorrowsDate() Tests

- [x] 10.1 Test returns tomorrow's date in MM-DD format (`2026-02-19` → `"02-20"`)
- [x] 10.2 Test handles month boundary (`2026-02-28` → `"03-01"`)
- [x] 10.3 Test handles year boundary (`2026-12-31` → `"01-01"`)

## 11. Utility.getUpcomingMonday() Tests

- [x] 11.1 Test returns same day when today is Monday (`2026-02-23` → `"feb-23-monday-program"`)
- [x] 11.2 Test returns upcoming Monday when today is Wednesday (`2026-02-18` → `"feb-23-monday-program"`)
- [x] 11.3 Test returns upcoming Monday when today is Sunday (`2026-02-22` → `"feb-23-monday-program"`)

## 12. Verification

- [x] 12.1 Run `pnpm test` and verify all tests pass
- [x] 12.2 Run `pnpm lint` and fix any linting errors
- [x] 12.3 Verify test coverage report shows 100% coverage for utility.ts
