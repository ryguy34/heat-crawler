## Context

The existing logger at `src/utility/logger.ts` uses a single Winston console transport. Log output is lost when the terminal closes or scrollback overflows. The crawler runs on cron schedules (Supreme Wed 8PM, Palace Thu 8PM, Kith Sun 8PM) and via API endpoints (`/drops/:store/:date`), making it critical to capture logs per invocation for debugging.

## Goals / Non-Goals

**Goals:**
- Create per-run log files with descriptive names
- Mirror console output to files for debugging
- Avoid polluting git with log files

**Non-Goals:**
- Log rotation or automatic cleanup (manual cleanup preferred)
- Structured JSON logging (mirroring console format is sufficient)
- Remote log shipping or aggregation

## Decisions

### 1. File naming: `<module>-YYYY-MM-DD_HH-mm-ss.log`

**Rationale**: Module name provides context at a glance; timestamp ensures uniqueness and chronological sorting in file explorers.

**Alternatives considered**:
- Sequential counters (`run-001.log`) – harder to correlate with dates
- Timestamp only – loses module context without opening the file

### 2. Explicit `initLogFile(moduleName)` function vs auto-init

**Rationale**: Explicit initialization gives callers control over when to create a log file and what to name it. Auto-detecting the module name at import time would require fragile stack inspection.

**Alternatives considered**:
- Auto-init on first log call – loses descriptive naming capability
- Singleton per-module loggers – adds complexity for minimal benefit

### 3. Log directory: `logs/` at project root

**Rationale**: Simple, discoverable location. Single directory keeps all logs together for easy browsing.

**Alternatives considered**:
- `logs/<module>/` subdirectories – adds complexity, harder to see chronological order across modules

### 4. File format: uncolorized console mirror

**Rationale**: Same format as console makes logs familiar and readable. Stripped ANSI codes prevent garbage characters in log files.

**Alternatives considered**:
- JSON lines – better for parsing, but less readable for manual debugging
- Different verbosity – adds cognitive overhead switching between console and file

## Risks / Trade-offs

- **Disk usage** → Manual cleanup; logs are small and debugging-focused, not long-term storage
- **Missing init call** → Logs only go to console (existing behavior, safe fallback)
- **Directory creation** → Will create `logs/` on first run if missing; must ensure `.gitignore` excludes it
