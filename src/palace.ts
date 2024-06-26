import axios from "axios";
import { load } from "cheerio";
import { PalaceDropInfo } from "./vo/palaceDropInfo";
import { TextChannelInfo } from "./vo/textChannelInfo";
import logger from "./config/logger";

const constants = require("./constants");

export class Palace {
	constructor() {}

	async parsePalaceDrop(currentWeekFridayDate: string) {
		var productList: PalaceDropInfo[] = [];
		var palaceDiscordTextChannelInfo;

		try {
			const res = await axios.get(
				constants.PALACE_COMMUNITY_BASE_URL +
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

			$(".catalog-item").each((_: number, ele: any) => {
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

				const imageUrl = constants.PALACE_COMMUNITY_BASE_URL + png;
				const productInfoUrl = `${constants.PALACE_COMMUNITY_BASE_URL}/collections/${season}/items/${itemId}/${itemSlug}`;
				const productName = itemName;
				const categoryUrl = `${
					constants.PALACE_BASE_URL
				}/collections/${category?.toLowerCase()}`;
				var price = price === "" ? "???" : price;
				var palaceDropInfo = new PalaceDropInfo(
					productName!,
					productInfoUrl,
					imageUrl,
					price,
					categoryUrl
				);
				productList.push(palaceDropInfo);
			});

			palaceDiscordTextChannelInfo = new TextChannelInfo(channelName, title);
			palaceDiscordTextChannelInfo.products = productList;
		} catch (error) {
			logger.error(error);
		}

		return palaceDiscordTextChannelInfo;
	}
}
