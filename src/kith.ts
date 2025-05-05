import axios from "axios";
import { load } from "cheerio";

const constants = require("./constants");

export class Kith {
	constructor() {}

	async parseProductVariants(
		productUrl: string
	): Promise<{ title: string; id: string }[]> {
		const variantUrlList: { title: string; id: string }[] = [];
		try {
			const res = await axios.get(productUrl + ".json", constants.params);
			const rawVariantList = res.data.product.variants;
			rawVariantList.forEach((variant: { title: string; id: number }) => {
				if (variant.title === "Default Title") {
					// Default Title means only one size
					variantUrlList.push({
						id: String(variant.id), // ensure string type
						title: "OS",
					});
				} else {
					variantUrlList.push({
						id: String(variant.id), // ensure string type
						title: variant.title,
					});
				}
			});
		} catch (error) {
			console.error(error);
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
					console.log(productName);
					console.log(imageUrl);
					console.log(productPrice);
					// /collections/kith-monday-program/products/nbu9975hk-ph
					console.log(productUrl);
					var variantCartUrlList = await this.parseProductVariants(
						productUrl!
					);
					console.log(variantCartUrlList);
					// send to discord
				}
			}
		} catch (error) {
			console.error(error);
		}
	}
}
