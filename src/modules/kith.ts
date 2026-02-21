import axios from "axios";
import { load } from "cheerio";

import logger from "../utility/logger";
import constants from "../utility/constants";
import { KithProductInfo, KithVariantInfo } from "../interface/KithInterface";

/**
 * Kith module for scraping product information from kith.com.
 * Handles parsing of Monday Program drops and generic collection pages.
 */
export class Kith {
	constructor() {}

	/**
	 * Fetches variant information (size and ID) for a Kith product.
	 * Retrieves the product JSON and extracts all available size variants.
	 * Handles "Default Title" variants by converting them to "One Size".
	 *
	 * @param productUrl - The full URL to the Kith product page
	 * @returns Array of variant objects with size and ID, or empty array on error
	 */
	async parseProductVariants(productUrl: string): Promise<KithVariantInfo[]> {
		const variantInfoList: KithVariantInfo[] = [];
		try {
			const res = await axios.get(productUrl + ".json", constants.params);
			const rawVariantList = res.data.product.variants;
			rawVariantList.forEach((variant: { title: string; id: number }) => {
				if (variant.title === "Default Title") {
					// Default Title means only one size
					logger.debug("Default Title found, setting size to OS");
					variantInfoList.push({
						id: String(variant.id), // ensure string type
						size: "One Size",
					});
				} else {
					variantInfoList.push({
						id: String(variant.id), // ensure string type
						size: variant.title,
					});
				}
			});
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				logger.error(
					`Axios error: ${error.message}, Response: ${JSON.stringify(
						error.response?.data,
					)}`,
				);
			} else if (error instanceof Error) {
				logger.error(error.message);
			} else {
				logger.error(String(error));
			}
		}

		return variantInfoList;
	}

	/**
	 * Fetches product JSON and returns both the product name and variant info.
	 * More reliable than parsing HTML since product names are inconsistently structured.
	 *
	 * @param productUrl - The full URL to the Kith product page
	 * @returns Object with productName and variantCartUrlList, or defaults on error
	 */
	async parseProductWithName(productUrl: string): Promise<{
		productName: string;
		variantCartUrlList: KithVariantInfo[];
	}> {
		const variantCartUrlList: KithVariantInfo[] = [];
		let productName = "";

		try {
			const res = await axios.get(productUrl + ".json", constants.params);
			const product = res.data.product;
			productName = product.title || "";

			const rawVariantList = product.variants;
			rawVariantList.forEach((variant: { title: string; id: number }) => {
				if (variant.title === "Default Title") {
					variantCartUrlList.push({
						id: String(variant.id),
						size: "One Size",
					});
				} else {
					variantCartUrlList.push({
						id: String(variant.id),
						size: variant.title,
					});
				}
			});
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				logger.error(
					`Axios error: ${error.message}, Response: ${JSON.stringify(
						error.response?.data,
					)}`,
				);
			} else if (error instanceof Error) {
				logger.error(error.message);
			} else {
				logger.error(String(error));
			}
		}

		return { productName, variantCartUrlList };
	}

	/**
	 * Parses upcoming Kith Monday Program drops from the collection page.
	 * Filters products to only include those with upcoming Monday releases,
	 * excluding sold out, app-only, and drawing items.
	 *
	 * @returns Array of KithProductInfo objects for upcoming Monday Program products,
	 *          or empty array if none found or on error
	 */
	async parseKithMondayProgramDrop(): Promise<KithProductInfo[]> {
		try {
			const res = await axios.get(
				constants.KITH.MONDAY_PROGRAM_URL,
				constants.params,
			);

			const htmlData = res.data;
			const $ = load(htmlData);
			const productCards = $(".product-card").toArray();
			var productList = [];

			for (const ele of productCards) {
				// find text where "MONDAY 11AM EST" and only parse cards that contain this text
				var mondayRelease = $(ele).find(".text-10").first().text().trim();
				if (
					!mondayRelease ||
					mondayRelease === "ENTER DRAWING IN APP" ||
					mondayRelease === "IN APP ONLY" ||
					mondayRelease === "SOLD OUT"
				) {
					// do nothing
					logger.info("No upcoming Kith Monday Program found");
					break;
				} else {
					// this item is releasing as part of the monday program
					var productName = $(ele)
						.find("a.text-black.bg-white")
						.last()
						.text()
						.trim();
					var imageUrl =
						"https://" +
							$(ele).find("img").attr("src")?.replace("//", "") ||
						"default-image-url";
					var productPrice = $(ele).find(".text-10").last().text().trim();
					var productUrl =
						"https://kith.com" + $(ele).find("a").attr("href");
					logger.info(`Product found: ${productName}`);
					logger.debug(imageUrl);
					logger.debug(productPrice);
					// /collections/kith-monday-program/products/nbu9975hk-ph
					logger.debug(productUrl);
					var variantCartUrlList = await this.parseProductVariants(
						productUrl!,
					);
					logger.debug(variantCartUrlList);
					productList.push({
						productName: productName,
						imageUrl: imageUrl,
						productPrice: productPrice,
						productUrl: productUrl,
						variantCartUrlList: variantCartUrlList,
					});
				}
			}
			return productList;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				logger.error(
					`Axios error: ${error.message}, Response: ${JSON.stringify(
						error.response?.data,
					)}`,
				);
			} else if (error instanceof Error) {
				logger.error(error.message);
			} else {
				logger.error(String(error));
			}

			return [];
		}
	}

	/**
	 * Parses all products from a Kith collection page by slug.
	 * Fetches the collection page, extracts product info from the first
	 * .collection-break__subcollection-products container, and retrieves
	 * variant information for each product.
	 *
	 * @param slug - The URL slug of the Kith collection (e.g., "lisa-for-kith-women-spring-2026")
	 * @returns Array of KithProductInfo objects, or empty array if collection not found or fetch fails
	 */
	async parseKithCollection(slug: string): Promise<KithProductInfo[]> {
		try {
			const collectionUrl = `https://kith.com/collections/${slug}`;
			const res = await axios.get(collectionUrl, constants.params);

			const htmlData = res.data;
			const $ = load(htmlData);

			// Select first .collection-break__subcollection-products container only
			const firstContainer = $(
				".collection-break__subcollection-products",
			).first();
			const productElements = firstContainer
				.find(".collection-break__subcollection-product")
				.toArray();

			if (productElements.length === 0) {
				logger.info(`No products found in collection: ${slug}`);
				return [];
			}

			const productList: KithProductInfo[] = [];

			for (const ele of productElements) {
				const productLink = $(ele).find('a[href*="/products/"]').first();
				const productUrl = "https://kith.com" + productLink.attr("href");
				const imageUrl =
					"https://" +
					($(ele).find("img").attr("src")?.replace("//", "") ||
						"default-image-url");
				const productPrice = $(ele).find(".text-10").last().text().trim();

				// Fetch product JSON to get reliable name and variants
				const { productName, variantCartUrlList } =
					await this.parseProductWithName(productUrl);

				logger.info(`Product found: ${productName}`);
				logger.debug(imageUrl);
				logger.debug(productPrice);
				logger.debug(productUrl);
				logger.debug(variantCartUrlList);

				productList.push({
					productName,
					imageUrl,
					productPrice,
					productUrl,
					variantCartUrlList,
				});
			}

			return productList;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				logger.error(
					`Axios error: ${error.message}, Response: ${JSON.stringify(
						error.response?.data,
					)}`,
				);
			} else if (error instanceof Error) {
				logger.error(error.message);
			} else {
				logger.error(String(error));
			}

			return [];
		}
	}
}
