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
					variantUrlList.push({
						id: String(variant.id), // ensure string type
						size: "OS",
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

	async parseKithMondayProgramDrop(): Promise<void> {
		try {
			const res = await axios.get(
				constants.KITH_MONDAY_PROGRAM,
				constants.params
			);

			const htmlData = res.data;
			const $ = load(htmlData);
			const productCards = $(".product-card").toArray();

			for (const ele of productCards) {
				// find text where "MONDAY 11AM EST" and only parse cards that contain this text
				var mondayRelease = $(ele).find(".text-10").first().text().trim();
				if (mondayRelease && mondayRelease !== "Monday 11am EST") {
					// do nothing
					logger.info("No upcoming releases found.");
					break;
				} else {
					// this item is releasing as part of the monday program
					var productName = $(ele)
						.find("div.text-black")
						.last()
						.text()
						.trim();
					var imageUrl = $(ele).find("img").attr("src")?.replace("//", "");
					var productPrice = $(ele).find(".text-10").last().text().trim();
					var productUrl =
						"https://kith.com" + $(ele).find("a").attr("href");
					logger.debug(productName);
					logger.debug(imageUrl);
					logger.debug(productPrice);
					// /collections/kith-monday-program/products/nbu9975hk-ph
					logger.debug(productUrl);
					var variantCartUrlList = await this.parseProductVariants(
						productUrl!
					);
					logger.debug(variantCartUrlList);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}
}
