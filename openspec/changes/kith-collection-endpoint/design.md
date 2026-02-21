## Context

The Kith module currently supports only the Monday Program collection via `parseKithMondayProgramDrop()`, which is triggered by a Sunday cron job. This method has hardcoded filtering logic specific to Monday Program releases (checking for "MONDAY 11AM EST" text, filtering out "SOLD OUT" items).

The existing stub endpoint `GET /kith/:title` returns a placeholder response. The Discord module has `sendKithInfo()` with a hardcoded Monday Program message.

## Goals / Non-Goals

**Goals:**
- Enable on-demand fetching of any Kith collection by URL slug
- Reuse existing patterns (channel creation, embed formatting, variant parsing)
- Graceful error handling for invalid/empty collections

**Non-Goals:**
- Pagination support (collections are typically single-page)
- Modifying the existing Monday Program cron flow
- Real-time monitoring or webhooks

## Decisions

### 1. Generic collection parser vs. modifying existing method

**Decision**: Create new `parseKithCollection(slug: string)` method.

**Rationale**: The Monday Program parser has specific filtering logic (release text checks, sold-out filtering) that doesn't apply to generic collections. A separate method keeps concerns isolated and avoids regressions.

**Alternative considered**: Parameterizing `parseKithMondayProgramDrop()` — rejected because it would complicate the method with conditional branches.

### 2. Discord message handling

**Decision**: Add optional `openingMessage` parameter to `sendKithInfo()` rather than creating a new method.

**Rationale**: The embed generation and chunking logic is identical. Only the opening message differs. Adding a parameter keeps DRY without duplicating ~50 lines of embed code.

**Alternative considered**: New `sendKithCollectionInfo()` method — rejected due to code duplication.

### 3. Channel naming

**Decision**: Use the collection slug directly as the channel name (e.g., `lisa-for-kith-women-spring-2026`).

**Rationale**: Slugs are already kebab-case and Discord-friendly. No transformation needed. Uniqueness is guaranteed by Kith's URL structure.

### 4. Empty collection handling

**Decision**: Return 404 with no Discord action if collection fetch fails or returns zero products.

**Rationale**: Prevents creating empty channels. The caller can distinguish between "not found" (404) and "already processed" (200 with message).

## Risks / Trade-offs

- **Rate limiting**: Fetching variant info for each product makes N+1 requests. → Acceptable for typical collection sizes (<50 products). Could add batching later if needed.
- **HTML structure changes**: Relies on first `.collection-break__subcollection-products` container and `.collection-break__subcollection-product` elements within it. → Same risk as existing Monday Program parser. No mitigation beyond monitoring.
- **Long channel names**: Some collection slugs may exceed Discord's 100-char limit. → Truncate if needed, though most slugs are reasonable length.
