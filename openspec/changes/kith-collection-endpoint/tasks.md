## 1. Kith Module

- [x] 1.1 Add `parseKithCollection(slug: string)` method to `src/modules/kith.ts`
- [x] 1.2 Fetch collection page from `https://kith.com/collections/{slug}`
- [x] 1.3 Select first `.collection-break__subcollection-products` container
- [x] 1.4 Parse all `.collection-break__subcollection-product` elements within it
- [x] 1.5 Extract productName, imageUrl, productPrice, and productUrl (from `href`) for each product
- [x] 1.6 Reuse `parseProductVariants()` to fetch variants for each product
- [x] 1.7 Return empty array if fetch fails or no products found

## 2. Discord Module

- [x] 2.1 Add optional `openingMessage` parameter to `sendKithInfo()` in `src/modules/discord.ts`
- [x] 2.2 Default to existing Monday Program message when parameter is not provided
- [x] 2.3 Use custom message when parameter is provided

## 3. Main Endpoint

- [x] 3.1 Update `/kith/:title` endpoint in `src/main.ts` to extract `collectionSlug` from params
- [x] 3.2 Check if channel with `collectionSlug` name exists under Kith category
- [x] 3.3 Return 200 with "Already processed" if channel exists
- [x] 3.4 Call `kith.parseKithCollection(collectionSlug)`
- [x] 3.5 Return 404 with "Collection not found" if no products returned
- [x] 3.6 Create Discord channel named `collectionSlug` under Kith category
- [x] 3.7 Call `discord.sendKithInfo()` with custom message: `"<@&834439628295241758> Check out the {collectionSlug} collection!"`
- [x] 3.8 Return 200 with success response

## 4. Verification

- [ ] 4.1 Test endpoint with valid collection slug
- [ ] 4.2 Test endpoint with invalid/nonexistent collection slug (expect 404)
- [ ] 4.3 Test duplicate request handling (expect "Already processed")
