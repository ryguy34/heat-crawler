## Why

The current Kith integration only supports the Monday Program collection via a scheduled cron job. There's no way to monitor arbitrary Kith collections (e.g., collaborations like `lisa-for-kith-women-spring-2026`) on-demand. An API endpoint would enable ad-hoc collection monitoring without code changes.

## What Changes

- Add `GET /kith/:collectionSlug` endpoint that accepts any Kith collection URL slug
- Add `parseKithCollection(slug)` method to fetch and parse all products from any collection
- Add `sendKithCollectionInfo()` method (or modify `sendKithInfo`) to support custom opening messages
- Skip processing if a Discord channel with the collection slug already exists
- Return 404 if the collection doesn't exist or has no products (no Discord action)

## Capabilities

### New Capabilities
- `kith-collection-endpoint`: API endpoint for fetching any Kith collection by slug and posting products to Discord

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- **Code**: `src/modules/kith.ts`, `src/modules/discord.ts`, `src/main.ts`
- **APIs**: New `GET /kith/:collectionSlug` endpoint
- **Discord**: Creates channels named after collection slugs under the Kith category
