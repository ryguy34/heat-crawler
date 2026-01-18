import axios from "axios";
import { load } from "cheerio";

import logger from "../utility/logger";
import constants from "../utility/constants";

interface KithProductInfo {
	productName: string;
	imageUrl: string;
	productPrice: string;
	productUrl: string;
	variantCartUrlList: { size: string; id: string }[];
}

interface KithVariantInfo {
	size: string;
	id: string;
}

export class Kith {
	constructor() {}

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
					mondayRelease &&
					mondayRelease !== "Monday 11am EST" &&
					mondayRelease !== "ENTER DRAWING IN APP" &&
					mondayRelease !== "IN APP ONLY" &&
					mondayRelease !== "SOLD OUT"
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
}
