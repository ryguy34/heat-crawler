## ADDED Requirements

### Requirement: Fetch collection by slug
The system SHALL accept a GET request to `/kith/:collectionSlug` where `collectionSlug` is a valid Kith collection URL slug.

#### Scenario: Valid collection slug provided
- **WHEN** a GET request is made to `/kith/lisa-for-kith-women-spring-2026`
- **THEN** the system SHALL fetch products from `https://kith.com/collections/lisa-for-kith-women-spring-2026`

### Requirement: Parse all visible products
The system SHALL parse all `.collection-break__subcollection-product` elements from the FIRST `.collection-break__subcollection-products` container only.

#### Scenario: Collection has multiple product sections
- **WHEN** the collection page contains multiple `.collection-break__subcollection-products` containers
- **THEN** the system SHALL only parse products from the first container

#### Scenario: Collection has multiple products
- **WHEN** the first `.collection-break__subcollection-products` container contains `.collection-break__subcollection-product` elements
- **THEN** the system SHALL extract productName, imageUrl, productPrice, and productUrl (from the `href` attribute) for each product

#### Scenario: Product variant retrieval
- **WHEN** a product is parsed from the collection
- **THEN** the system SHALL use the `href` from the product element to fetch variant information (size, id) from `{productUrl}.json`

### Requirement: Skip duplicate processing
The system SHALL check if a Discord channel with the collection slug already exists under the Kith category before processing.

#### Scenario: Channel already exists
- **WHEN** a channel named `lisa-for-kith-women-spring-2026` exists under the Kith category
- **THEN** the system SHALL return 200 with message "Already processed" and take no further action

#### Scenario: Channel does not exist
- **WHEN** no channel with the collection slug exists
- **THEN** the system SHALL proceed with collection parsing and channel creation

### Requirement: Create Discord channel
The system SHALL create a new text channel under the Kith category named after the collection slug.

#### Scenario: Successful channel creation
- **WHEN** products are found and no existing channel exists
- **THEN** the system SHALL create a channel named with the collection slug (e.g., `lisa-for-kith-women-spring-2026`)

### Requirement: Send collection notification
The system SHALL send an opening message and product embeds to the newly created channel.

#### Scenario: Opening message format
- **WHEN** sending notifications to the channel
- **THEN** the system SHALL send `"<@&834439628295241758> Check out the {collectionSlug} collection!"` as the opening message

#### Scenario: Product embeds sent
- **WHEN** products are available
- **THEN** the system SHALL send embeds with product name, URL, price, image, and auto-cart links for each product

### Requirement: Handle invalid collections
The system SHALL return 404 when a collection cannot be found or contains no products.

#### Scenario: Collection does not exist
- **WHEN** the fetch to Kith returns an error or empty response
- **THEN** the system SHALL return 404 with message "Collection not found" and send nothing to Discord

#### Scenario: Collection has no products
- **WHEN** the first `.collection-break__subcollection-products` container contains zero `.collection-break__subcollection-product` elements
- **THEN** the system SHALL return 404 with message "Collection not found" and send nothing to Discord

### Requirement: Return success response
The system SHALL return a success response after processing completes.

#### Scenario: Successful processing
- **WHEN** products are fetched, channel created, and notifications sent
- **THEN** the system SHALL return 200 with `{ "message": "Kith notifications finished", "collectionSlug": "<slug>" }`
