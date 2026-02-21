## Context

The `Utility.getUpcomingMonday()` function returns a date string used as the Discord channel name for Kith Monday Program drops. Currently returns `"feb-24"` format, which doesn't indicate what the channel is for.

## Goals / Non-Goals

**Goals:**
- Make Kith Monday Program channel names self-documenting by appending `-monday-program`

**Non-Goals:**
- Changing the API endpoint channel naming (`/kith/:title` remains unchanged)
- Renaming existing Discord channels

## Decisions

**Append suffix to format string**

Modify the return statement to append `"-monday-program"` to the existing date format:
```typescript
return format(nextMonday, "MMM-dd").toLowerCase() + "-monday-program";
```

*Rationale*: Simplest possible change. No new functions, no configuration, no breaking changes.

## Risks / Trade-offs

- **Longer channel names** → Acceptable trade-off for clarity
- **Existing channels unaffected** → No migration needed, old channels keep their names
