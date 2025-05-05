import axios from "axios";
import { load } from "cheerio";
import { ShopifyDropInfo } from "./vo/shopify/shopifyDropInfo";
import { ShopifyChannelInfo } from "./vo/shopify/shopifyChannelInfo";

import constants from "./constants";

export class Supreme {
	constructor() {}

	async parseSupremeDrop(
		currentWeekThursdayDate: string,
		currentYear: number,
		currentSeason: string
	): Promise<ShopifyChannelInfo> {
		var productList: ShopifyDropInfo[] = [];
		var supremeTextChannelInfo;

		try {
			const res = await axios.get(
				constants.SUPREME.COMMUNITY_BASE_URL +
					"/season/" +
					currentSeason +
					currentYear +
					"/droplist/" +
					currentWeekThursdayDate,
				constants.params
			);

			const htmlData = res.data;
			const $ = load(htmlData);
			var title = $("title").text();
			var channelName = title
				.substring(title.indexOf("-") + 1, title.lastIndexOf("-"))
				.trim()
				.toLocaleLowerCase()
				.replace(" ", "-");

			supremeTextChannelInfo = new ShopifyChannelInfo(channelName, title);

			$(".catalog-item").each((_: number, ele: any) => {
				var itemId = $(ele).find("a").attr("data-itemid");
				var itemSlug = $(ele).find("a").attr("data-itemslug");
				var itemName = $(ele).find("a").attr("data-itemname");
				var category = $(ele).attr("data-category");
				var png = $(ele).find("img").attr("src");

				const price = $(ele)
					.find(".catalog-label-price")
					.first()
					.text()
					.replace(/(\r\n|\n|\r)/gm, "");

				const imageUrl =
					constants.SUPREME.COMMUNITY_BASE_URL + "/resize/576" + png;
				const productName = itemName === "" ? "?" : itemName;
				var formatPrice = price === "" ? "Free or Unknown" : price;
				const categoryUrl =
					constants.SUPREME.STORE_BASE_URL + "collections/" + category;
				const productInfoUrl =
					constants.SUPREME.COMMUNITY_BASE_URL +
					"/season/itemdetails/" +
					itemId +
					"/" +
					itemSlug;

				const productInfo = new ShopifyDropInfo(
					productName!,
					productInfoUrl,
					imageUrl,
					formatPrice,
					categoryUrl
				);

				productList.push(productInfo);
			});

			supremeTextChannelInfo.products = productList;
		} catch (error) {
			console.error(error);
		}

		return supremeTextChannelInfo!;
	}
}
