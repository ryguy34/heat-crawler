## Why

The Kith Monday Program cron job creates Discord channels named only by date (e.g., `feb-24`), which doesn't clearly indicate what the channel is for. Adding `-monday-program` suffix makes the channel purpose immediately recognizable.

## What Changes

- Modify `Utility.getUpcomingMonday()` to return `"feb-24-monday-program"` format instead of `"feb-24"`
- Channel names become more descriptive and self-documenting

## Capabilities

### New Capabilities

None - this is a minor adjustment to existing functionality.

### Modified Capabilities

None - no spec-level behavior changes, just formatting of output.

## Impact

- **Code**: `src/utility/utility.ts` - `getUpcomingMonday()` function
- **Discord**: Future Kith Monday Program channels will have longer names
- **Existing channels**: Not affected (Discord channels already created keep their names)
