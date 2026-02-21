## Why

Screenshots are capturing pages mid-load, showing a spinner instead of the actual product gallery image. The current `networkidle2` wait strategy fires before the fancybox gallery JavaScript finishes loading the image content, resulting in unusable screenshots.

## What Changes

- Add explicit wait for `.fancybox-content` element to become visible after navigation
- Add wait for image inside fancybox to fully load (`img.complete && img.naturalWidth > 0`)
- Add small render buffer before capturing screenshot
- Apply fix to both Supreme and Palace modules (same pattern)

## Capabilities

### New Capabilities

None — this is a bug fix to existing functionality.

### Modified Capabilities

None — no spec-level behavior changes, only implementation timing fix.

## Impact

- **Code**: `src/modules/supreme.ts` and `src/modules/palace.ts` screenshot logic
- **Behavior**: Screenshots will take slightly longer but will reliably capture loaded content
- **Dependencies**: No new dependencies, uses existing Puppeteer APIs (`waitForSelector`, `waitForFunction`)
