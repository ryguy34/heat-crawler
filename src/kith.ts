import axios from "axios";
import { load } from "cheerio";
import { Variant } from "./vo/kith/variant";

const constants = require("./constants");

export class Kith {
	constructor() {}

	parseProductVariants(productUrl: string): Variant[] {
		var variant = [];
		try {
		} catch (error) {
			console.error(error);
		}
		return [];
	}

	async parseKithMondayProgramDrop(): Promise<void> {
		try {
			const res = await axios.get(
				constants.KITH_MONDAY_PROGRAM,
				constants.params
			);

			const htmlData = res.data;
			const $ = load(htmlData);
			$(".product-card").each((_: number, ele: any) => {
				// find text where "MONDAY 11AM EST" and only parse cards that contain this text
				var mondayRelease = $(ele).find(".text-10").first().text().trim();
				if (mondayRelease && mondayRelease !== "Monday 11am EST") {
					return false;
				} else {
					// this item is releasing as part of the monday program
					var productName = $(ele).find("img").attr("alt");
					var imageUrl = $(ele).find("img").attr("src");
					var productPrice = $(ele).find(".text-10").last().text().trim();
					var productUrl = $(ele).find("a").attr("href");
					console.log(productName);
					console.log(imageUrl);
					console.log(productPrice);
					// /collections/kith-monday-program/products/nbu9975hk-ph
					console.log(productUrl);
					var variantCartUrlList = this.parseProductVariants(productUrl!);
				}
			});
		} catch (error) {
			console.error(error);
		}
	}
}
