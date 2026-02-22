## Context

The codebase currently has zero test coverage. It uses TypeScript with CommonJS module resolution (`"module": "CommonJS"` in tsconfig). The `Utility` class contains 8 static methods for date manipulation serving different store drop schedules (Supreme on Thursdays, Palace on Fridays, Kith on Mondays).

Several methods depend on the current date (`new Date()`), making them non-deterministic without mocking.

## Goals / Non-Goals

**Goals:**
- Establish Jest + ts-jest as the testing framework
- Achieve 100% coverage of `Utility` class methods
- Use `jest.useFakeTimers()` for deterministic date testing
- Create a repeatable pattern for future test additions
- Add ESLint with TypeScript support for static code analysis

**Non-Goals:**
- Testing modules with external dependencies (axios, puppeteer, discord.js) - deferred to Phase 2
- Integration or E2E testing
- CI/CD pipeline setup (separate change)
- SNKRS module testing (functionality incomplete)

## Decisions

### 1. Test Framework: Jest + ts-jest

**Choice:** Jest with ts-jest transformer

**Rationale:** 
- ts-jest provides native TypeScript support without pre-compilation
- Jest's built-in mocking (`jest.useFakeTimers()`) handles date-dependent functions cleanly
- Single dependency handles test runner, assertions, and mocking

**Alternatives considered:**
- Vitest: Faster, but less mature ecosystem and team familiarity
- Mocha + Chai + Sinon: More setup, multiple dependencies to coordinate

### 2. Date Mocking Strategy: jest.useFakeTimers()

**Choice:** Use Jest's fake timers with `setSystemTime()` to freeze time during tests

**Rationale:**
- No production code changes required
- Tests can set any date to verify day-of-week calculations
- Clean setup/teardown with `beforeEach`/`afterEach`

**Example pattern:**
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-19')); // Thursday
});

afterEach(() => {
  jest.useRealTimers();
});
```

**Alternatives considered:**
- Dependency injection (pass `Date` as parameter): Requires API changes
- date-fns mocking: More complex, library already used in production

### 3. Test File Location: Co-located with source

**Choice:** `src/utility/utility.test.ts` alongside `utility.ts`

**Rationale:**
- Easy to find related tests
- Matches common TypeScript project conventions
- Jest's default testMatch pattern finds `*.test.ts` files automatically

**Alternatives considered:**
- Separate `tests/` directory: Adds path complexity, no clear benefit for this scale

### 4. Jest Configuration: `jest.config.js`

**Choice:** JavaScript config file (not TypeScript)

**Rationale:**
- Simpler setup, no ts-node requirement for config parsing
- Sufficient for current needs

**Configuration:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
```

### 5. ESLint Configuration: Flat config with TypeScript

**Choice:** ESLint 9.x with flat config (`eslint.config.js`) and `@typescript-eslint`

**Rationale:**
- ESLint flat config is the modern standard (legacy `.eslintrc` deprecated)
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` provide TypeScript-aware linting
- Catches type-related issues that TypeScript alone may miss

**Configuration:**
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
  }
);
```

**Alternatives considered:**
- Biome: Faster but less TypeScript ecosystem integration
- Legacy `.eslintrc`: Deprecated, flat config is preferred

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| ts-jest version mismatch with Jest 30.x | ts-jest 29.4.6 explicitly supports Jest 30 in peerDeps; pin versions |
| Fake timers affect `date-fns` functions | Verified: `date-fns` uses native `Date`, fake timers work correctly |
| Tests passing locally but failing in CI | Ensure tests don't depend on timezone; use UTC dates where possible |
| Coverage gaps in date edge cases | Test boundary conditions: year rollover, month boundaries, leap years |
| ESLint errors on existing code | Run `lint` initially to identify issues; fix or disable rules as needed |
