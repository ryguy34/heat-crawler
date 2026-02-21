## 1. Logger Enhancement

- [x] 1.1 Add `initLogFile(moduleName: string)` function to `src/utility/logger.ts`
- [x] 1.2 Generate timestamp-based filename in format `<module>-YYYY-MM-DD_HH-mm-ss.log`
- [x] 1.3 Create `logs/` directory if it doesn't exist (use `fs.mkdirSync` with `recursive: true`)
- [x] 1.4 Add Winston file transport with uncolorized format matching console output

## 2. Integration

- [x] 2.1 Export `initLogFile` from logger module
- [x] 2.2 Call `initLogFile("supreme")` in Supreme API endpoint and cron job
- [x] 2.3 Call `initLogFile("palace")` in Palace API endpoint and cron job
- [x] 2.4 Call `initLogFile("kith")` in Kith cron job

## 3. Git Configuration

- [x] 3.1 Add `logs/` to `.gitignore`

## 4. Verification

- [x] 4.1 Run a crawl and verify log file is created with correct naming
- [x] 4.2 Verify log content matches console output (minus colors)
- [x] 4.3 Verify `git status` does not show log files
