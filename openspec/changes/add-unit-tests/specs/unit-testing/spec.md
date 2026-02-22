## ADDED Requirements

### Requirement: Jest framework configuration
The system SHALL have a Jest configuration file (`jest.config.js`) that configures ts-jest as the transformer for TypeScript files.

#### Scenario: Jest config exists with ts-jest preset
- **WHEN** the project is set up
- **THEN** a `jest.config.js` file SHALL exist at the project root with `preset: 'ts-jest'` and `testEnvironment: 'node'`

#### Scenario: Jest finds TypeScript test files
- **WHEN** Jest runs
- **THEN** it SHALL discover all `*.test.ts` files in the `src/` directory

---

### Requirement: Test script in package.json
The system SHALL have a `test` script in `package.json` that runs Jest.

#### Scenario: Run tests via npm script
- **WHEN** user executes `pnpm test`
- **THEN** Jest SHALL run all test files and report results

---

### Requirement: ESLint configuration
The system SHALL have an ESLint flat configuration file (`eslint.config.js`) with TypeScript support.

#### Scenario: ESLint config exists with TypeScript parser
- **WHEN** the project is set up
- **THEN** an `eslint.config.js` file SHALL exist using `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`

#### Scenario: ESLint ignores build output
- **WHEN** ESLint runs
- **THEN** it SHALL ignore the `dist/` and `node_modules/` directories

---

### Requirement: Lint script in package.json
The system SHALL have a `lint` script in `package.json` that runs ESLint.

#### Scenario: Run linting via npm script
- **WHEN** user executes `pnpm lint`
- **THEN** ESLint SHALL analyze all TypeScript files in `src/` and report issues

---

### Requirement: Utility.getDate() test coverage
The system SHALL have tests verifying `Utility.getDate()` returns the current date in YYYY-MM-DD format.

#### Scenario: Returns frozen date when time is mocked
- **WHEN** system time is set to `2026-02-19T12:00:00Z` using `jest.setSystemTime()`
- **THEN** `Utility.getDate()` SHALL return `"2026-02-19"`

#### Scenario: Handles year boundary
- **WHEN** system time is set to `2026-12-31T23:59:59Z`
- **THEN** `Utility.getDate()` SHALL return `"2026-12-31"`

---

### Requirement: Utility.getFullYear() test coverage
The system SHALL have tests verifying `Utility.getFullYear()` returns the current 4-digit year.

#### Scenario: Returns mocked year
- **WHEN** system time is set to `2026-06-15T00:00:00Z`
- **THEN** `Utility.getFullYear()` SHALL return `2026`

---

### Requirement: Utility.getCurrentSeason() test coverage
The system SHALL have tests verifying `Utility.getCurrentSeason()` returns the correct Supreme season.

#### Scenario: Returns spring-summer before July 1
- **WHEN** system time is set to `2026-06-30T23:59:59Z`
- **THEN** `Utility.getCurrentSeason()` SHALL return `"spring-summer"`

#### Scenario: Returns fall-winter on July 1
- **WHEN** system time is set to `2026-07-01T00:00:00Z`
- **THEN** `Utility.getCurrentSeason()` SHALL return `"fall-winter"`

#### Scenario: Returns fall-winter after July 1
- **WHEN** system time is set to `2026-11-15T00:00:00Z`
- **THEN** `Utility.getCurrentSeason()` SHALL return `"fall-winter"`

---

### Requirement: Utility.getThursdayOfCurrentWeek() test coverage
The system SHALL have tests verifying `Utility.getThursdayOfCurrentWeek()` returns the upcoming Thursday.

#### Scenario: Returns same day when today is Thursday
- **WHEN** system time is set to Thursday `2026-02-19T00:00:00Z`
- **THEN** `Utility.getThursdayOfCurrentWeek()` SHALL return `"2026-02-19"`

#### Scenario: Returns upcoming Thursday when today is Monday
- **WHEN** system time is set to Monday `2026-02-16T00:00:00Z`
- **THEN** `Utility.getThursdayOfCurrentWeek()` SHALL return `"2026-02-19"`

#### Scenario: Returns upcoming Thursday when today is Friday
- **WHEN** system time is set to Friday `2026-02-20T00:00:00Z`
- **THEN** `Utility.getThursdayOfCurrentWeek()` SHALL return `"2026-02-26"`

---

### Requirement: Utility.getFridayOfCurrentWeek() test coverage
The system SHALL have tests verifying `Utility.getFridayOfCurrentWeek()` returns the upcoming Friday.

#### Scenario: Returns same day when today is Friday
- **WHEN** system time is set to Friday `2026-02-20T00:00:00Z`
- **THEN** `Utility.getFridayOfCurrentWeek()` SHALL return `"2026-02-20"`

#### Scenario: Returns upcoming Friday when today is Monday
- **WHEN** system time is set to Monday `2026-02-16T00:00:00Z`
- **THEN** `Utility.getFridayOfCurrentWeek()` SHALL return `"2026-02-20"`

#### Scenario: Returns upcoming Friday when today is Saturday
- **WHEN** system time is set to Saturday `2026-02-21T00:00:00Z`
- **THEN** `Utility.getFridayOfCurrentWeek()` SHALL return `"2026-02-27"`

---

### Requirement: Utility.convertMonthToNumber() test coverage
The system SHALL have tests verifying `Utility.convertMonthToNumber()` converts month abbreviations correctly.

#### Scenario: Converts all valid month abbreviations
- **WHEN** `Utility.convertMonthToNumber()` is called with each valid 3-letter abbreviation
- **THEN** it SHALL return the corresponding 2-digit string ("Jan"→"01", "Feb"→"02", ... "Dec"→"12")

#### Scenario: Returns undefined for invalid input
- **WHEN** `Utility.convertMonthToNumber()` is called with an invalid string like "Foo"
- **THEN** it SHALL return `undefined`

---

### Requirement: Utility.getTomorrowsDate() test coverage
The system SHALL have tests verifying `Utility.getTomorrowsDate()` returns tomorrow's date in MM-DD format.

#### Scenario: Returns tomorrow's date
- **WHEN** system time is set to `2026-02-19T00:00:00Z`
- **THEN** `Utility.getTomorrowsDate()` SHALL return `"02-20"`

#### Scenario: Handles month boundary
- **WHEN** system time is set to `2026-02-28T00:00:00Z`
- **THEN** `Utility.getTomorrowsDate()` SHALL return `"03-01"`

#### Scenario: Handles year boundary
- **WHEN** system time is set to `2026-12-31T00:00:00Z`
- **THEN** `Utility.getTomorrowsDate()` SHALL return `"01-01"`

---

### Requirement: Utility.getUpcomingMonday() test coverage
The system SHALL have tests verifying `Utility.getUpcomingMonday()` returns the upcoming Monday in Kith format.

#### Scenario: Returns same day when today is Monday
- **WHEN** system time is set to Monday `2026-02-23T00:00:00Z`
- **THEN** `Utility.getUpcomingMonday()` SHALL return `"feb-23-monday-program"`

#### Scenario: Returns upcoming Monday when today is Wednesday
- **WHEN** system time is set to Wednesday `2026-02-18T00:00:00Z`
- **THEN** `Utility.getUpcomingMonday()` SHALL return `"feb-23-monday-program"`

#### Scenario: Returns upcoming Monday when today is Sunday
- **WHEN** system time is set to Sunday `2026-02-22T00:00:00Z`
- **THEN** `Utility.getUpcomingMonday()` SHALL return `"feb-23-monday-program"`

---

### Requirement: Test file co-location
Test files SHALL be co-located with their source files using the `*.test.ts` naming convention.

#### Scenario: Utility tests are co-located
- **WHEN** the test suite is implemented
- **THEN** `src/utility/utility.test.ts` SHALL exist alongside `src/utility/utility.ts`
