## ADDED Requirements

### Requirement: Initialize log file with module name
The logger SHALL provide an `initLogFile(moduleName: string)` function that creates a file transport for the current run.

#### Scenario: Initialize log file for Supreme crawl
- **WHEN** `initLogFile("supreme")` is called
- **THEN** the logger adds a file transport writing to `logs/supreme-YYYY-MM-DD_HH-mm-ss.log`

#### Scenario: Initialize log file for Palace crawl
- **WHEN** `initLogFile("palace")` is called
- **THEN** the logger adds a file transport writing to `logs/palace-YYYY-MM-DD_HH-mm-ss.log`

#### Scenario: Initialize log file for Kith crawl
- **WHEN** `initLogFile("kith")` is called
- **THEN** the logger adds a file transport writing to `logs/kith-YYYY-MM-DD_HH-mm-ss.log`

### Requirement: Log file naming format
The log file name SHALL follow the pattern `<module>-YYYY-MM-DD_HH-mm-ss.log` where the timestamp reflects when `initLogFile` was called.

#### Scenario: Timestamp reflects initialization time
- **WHEN** `initLogFile("kith")` is called at 2026-02-20 20:00:00
- **THEN** the log file is named `kith-2026-02-20_20-00-00.log`

### Requirement: Log directory location
Log files SHALL be written to a `logs/` directory at the project root.

#### Scenario: Logs directory created if missing
- **WHEN** `initLogFile` is called and `logs/` does not exist
- **THEN** the `logs/` directory is created before writing the file

#### Scenario: Logs written to correct location
- **WHEN** `initLogFile("supreme")` is called
- **THEN** the log file is created at `<project-root>/logs/supreme-*.log`

### Requirement: File output mirrors console
The file transport SHALL output the same content as the console transport, excluding ANSI color codes.

#### Scenario: Same log level as console
- **WHEN** the console is set to log level "debug"
- **THEN** the file transport also logs at "debug" level

#### Scenario: Same message format without colors
- **WHEN** `logger.info("Processing drop")` is called
- **THEN** the file contains `[YYYY-MM-DD HH:mm:ss] info: Processing drop` without ANSI escape sequences

### Requirement: Graceful fallback when init not called
If `initLogFile` is not called, the logger SHALL continue to work with console output only.

#### Scenario: Console-only without initialization
- **WHEN** code calls `logger.info()` without calling `initLogFile` first
- **THEN** the message appears in the console only (no error, no file output)

### Requirement: Git exclusion
The `logs/` directory SHALL be excluded from git tracking via `.gitignore`.

#### Scenario: Logs not committed
- **WHEN** log files exist in `logs/`
- **THEN** `git status` does not show them as untracked or modified
