import axios from "axios";
import { load } from "cheerio";
import { ShopifyDropInfo } from "../vo/shopify/shopifyDropInfo";
import { ShopifyChannelInfo } from "../vo/shopify/shopifyChannelInfo";
import logger from "../utility/logger";

import constants from "../utility/constants";

export class Palace {
	constructor() {}

	async parsePalaceDrop(
		currentWeekFridayDate: string
	): Promise<ShopifyChannelInfo> {
		var productList: ShopifyDropInfo[] = [];
		var palaceDiscordTextChannelInfo;

		try {
			const res = await axios.get(
				constants.PALACE.COMMUNITY_BASE_URL +
					"/droplists/" +
					currentWeekFridayDate,
				constants.params
			);

			const htmlData = res.data;
			const $ = load(htmlData);

			var title = $(".title-font h1").text();
			const parsedChannelName = title
				.substring(title.indexOf(",") + 1)
				.trim()
				.toLowerCase()
				.split(" ");

			var month = parsedChannelName[0].substring(0, 3);
			const channelName = `${month}-${parsedChannelName[1]}`;

			await Promise.all(
				$(".catalog-item")
					.map(async (_: number, ele: any) => {
						var itemId = $(ele).find("a").attr("data-itemid");
						var itemSlug = $(ele).find("a").attr("data-itemslug");
						var itemName = $(ele).find("a").attr("data-itemname");
						var category = $(ele).attr("data-category");
						var price = $(ele)
							.find(".catalog-label-price")
							.first()
							.text()
							.replace(/(\r\n|\n|\r)/gm, "")
							.replace("€", "$")
							.trim();
						var png = $(ele).find("img").attr("data-src");

						var parts = itemSlug?.split("-");
						var season = "";
						if (parts) {
							season = `${parts[0]}-${parts[1]}`;
						}

						category = await this.mapPalaceCategory(category!, itemSlug!);

						const imageUrl = constants.PALACE.COMMUNITY_BASE_URL + png;
						const productInfoUrl = `${constants.PALACE.COMMUNITY_BASE_URL}/collections/${season}/items/${itemId}/${itemSlug}`;
						const productName = itemName;
						const categoryUrl = `${constants.PALACE.STORE_BASE_URL}/collections/${category}`;
						var price = price === "" ? "???" : price;
						var palaceDropInfo = new ShopifyDropInfo(
							productName!,
							productInfoUrl,
							imageUrl,
							price,
							categoryUrl
						);
						productList.push(palaceDropInfo);
					})
					.get()
			);

			palaceDiscordTextChannelInfo = new ShopifyChannelInfo(
				channelName,
				title
			);
			palaceDiscordTextChannelInfo.products = productList;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				logger.error(
					`Axios error: ${error.message}, Response: ${JSON.stringify(
						error.response?.data
					)}`
				);
			} else if (error instanceof Error) {
				logger.error(error.message);
			} else {
				logger.error(String(error));
			}
		}

		return palaceDiscordTextChannelInfo!;
	}

	async mapPalaceCategory(
		category: string,
		itemSlug: string
	): Promise<string> {
		const categoryMap: { [key: string]: string } = {
			hoods: "hoods",
			sweatshirts: "sweatshirts",
			bottoms: "trousers",
			jackets: "jackets",
			hats: "hats",
			accessories: "accessories",
			skateboardhardware: "hardware",
			customtops: "tops",
			tracksuits: "tracksuits",
			footwear: "footwear",
			trousers: "trousers",
			shirting: "shirting",
			shorts: "shorts",
			"t-shirts": "t-shirts",
			luggage: "bags",
			knitwear: "tops",
		};

		if (
			itemSlug.includes("hood") &&
			categoryMap[category.toLowerCase()] === "sweatshirts"
		) {
			return "hoods";
		} else if (
			itemSlug.includes("wallet") &&
			categoryMap[category.toLowerCase()] === "accessories"
		) {
			return "bags";
		}

		return categoryMap[category.toLowerCase()] || category.toLowerCase();
	}
}
