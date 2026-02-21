/**
 * Product information extracted from a Kith collection page.
 */
export interface KithProductInfo {
	productName: string;
	imageUrl: string;
	productPrice: string;
	productUrl: string;
	variantCartUrlList: { size: string; id: string }[];
}

/**
 * Variant information for a Kith product (size and cart ID).
 */
export interface KithVariantInfo {
	size: string;
	id: string;
}
