## Context

The Supreme and Palace modules use Puppeteer to capture product gallery screenshots. Currently, navigation uses `networkidle2` which fires when network activity settles, but this happens before the fancybox gallery JavaScript finishes loading images. The `#gallery-1` URL hash triggers async JS that opens the gallery modal — this runs after `networkidle2` fires.

Current flow:
1. `goto(url#gallery-1, networkidle2)` 
2. Check if `.fancybox-content` exists
3. Screenshot immediately

The element may exist but still be loading (showing spinner).

## Goals / Non-Goals

**Goals:**
- Reliably capture fully-loaded gallery images
- Maintain fallback behavior when fancybox doesn't appear
- Apply consistent fix to both Supreme and Palace modules

**Non-Goals:**
- Optimizing screenshot speed (reliability over speed)
- Changing screenshot output format or location
- Handling other page load issues outside fancybox gallery

## Decisions

### Wait Strategy: Element visibility + image load check

**Choice:** Wait for `.fancybox-content` to be visible, then wait for `img.complete && img.naturalWidth > 0`

**Rationale:** 
- `waitForSelector` with `visible: true` ensures the modal is rendered
- `waitForFunction` checking image properties ensures actual content is loaded
- This is more reliable than fixed delays and more precise than just `networkidle0`

**Alternatives considered:**
- Fixed delay after navigation — fragile, either too slow or still too fast
- `networkidle0` — still doesn't guarantee JS-triggered content
- Wait for spinner to disappear — requires knowing spinner selector, less direct

### Timeout Strategy

**Choice:** 15 second timeout for fancybox, 15 second timeout for image load, with graceful fallback

**Rationale:**
- Long enough for slow connections
- On timeout, still take a screenshot (something > nothing)
- Existing fallback to fullPage screenshot remains

### Render Buffer

**Choice:** 300ms delay after image load before screenshot

**Rationale:**
- Allows any final CSS transitions/rendering to complete
- Negligible impact on total time
- Guards against edge cases

## Risks / Trade-offs

- **[Slower screenshots]** → Acceptable trade-off for reliability; typically adds 1-3 seconds
- **[Selector changes]** → If site changes `.fancybox-content` class, detection fails → falls back to fullPage screenshot (graceful degradation)
- **[Image never loads]** → Timeout fires, we screenshot anyway with whatever state exists
