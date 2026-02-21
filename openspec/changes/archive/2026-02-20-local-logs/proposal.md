## Why

Console-only logging makes debugging difficult when investigating issues from specific crawler runs. When a Supreme or Palace crawl fails at 8PM, there's no way to review what happened unless the terminal is still open. Per-run log files create a persistent record for each invocation, whether triggered via cron job or API endpoint.

## What Changes

- Add `initLogFile(moduleName)` function to logger that creates a new file transport
- Log files named with module and timestamp: `<module>-YYYY-MM-DD_HH-mm-ss.log`
- Files stored in `logs/` directory at project root
- File output mirrors console output (same log level, same format minus colors)
- `logs/` directory excluded from git tracking

## Capabilities

### New Capabilities
- `local-log-files`: Winston logger enhancement that creates per-run log files with module-based naming, mirroring console output for debugging purposes

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Files**: `src/utility/logger.ts` (add file transport and init function)
- **Files**: `src/main.ts` (call `initLogFile()` at each entry point)
- **Files**: `.gitignore` (add `logs/` exclusion)
- **Dependencies**: None (Winston already supports file transports)
- **Runtime**: Creates `logs/` directory and log files on disk
