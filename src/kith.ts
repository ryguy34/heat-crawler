import axios from "axios";
import { load } from "cheerio";

import logger from "./config/logger";
import constants from "./constants";

export class Kith {
	constructor() {}

	async parseProductVariants(
		productUrl: string
	): Promise<{ size: string; id: string }[]> {
		const variantUrlList: { size: string; id: string }[] = [];
		try {
			const res = await axios.get(productUrl + ".json", constants.params);
			const rawVariantList = res.data.product.variants;
			rawVariantList.forEach((variant: { size: string; id: number }) => {
				if (variant.size === "Default Title") {
					// Default Title means only one size
					logger.debug("Default Title found, setting size to OS");
					variantUrlList.push({
						id: String(variant.id), // ensure string type
						size: "One Size",
					});
				} else {
					variantUrlList.push({
						id: String(variant.id), // ensure string type
						size: variant.size,
					});
				}
			});
		} catch (error) {
			logger.error(error);
		}
		return variantUrlList;
	}

	async parseKithMondayProgramDrop(): Promise<
		{
			productName: string;
			imageUrl: string;
			productPrice: string;
			productUrl: string;
			variantCartUrlList: { size: string; id: string }[];
		}[]
	> {
		try {
			const res = await axios.get(
				constants.KITH.MONDAY_PROGRAM_URL,
				constants.params
			);

			const htmlData = res.data;
			const $ = load(htmlData);
			const productCards = $(".product-card").toArray();
			var productList = [];

			for (const ele of productCards) {
				// find text where "MONDAY 11AM EST" and only parse cards that contain this text
				var mondayRelease = $(ele).find(".text-10").first().text().trim();
				if (mondayRelease && mondayRelease !== "Monday 11am EST") {
					// do nothing
					logger.info("No upcoming Kith Monday Program found");
					break;
				} else {
					// this item is releasing as part of the monday program
					var productName = $(ele)
						.find("div.text-black")
						.last()
						.text()
						.trim();
					var imageUrl =
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
						productUrl!
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
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
