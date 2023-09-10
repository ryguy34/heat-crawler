const constants = require("./constants");
const axios = require("axios");
const cheerio = require("cheerio");
const PalaceDropInfo = require("./vo/palaceDropInfo");
const PalaceTextChannelInfo = require("./vo/palaceTextChannelInfo");

class Palace {
	constructor() {}

	async parsePalaceDrop(currentWeekFridayDate) {
		var palaceDiscordTextChannelInfo = new PalaceTextChannelInfo();
		var productList = [];

		try {
			const res = await axios.get(
				constants.PALACE_COMMUNITY_BASE_URL +
					"/droplists/" +
					currentWeekFridayDate,
				constants.params
			);

			const htmlData = res.data;
			const $ = cheerio.load(htmlData);

			var title = $(".title-font h1").text();
			// TODO: clean up channel name to look better as a text channel
			const channelName = title
				.substring(title.indexOf(",") + 1)
				.trim()
				.replace(" ", "-")
				.toLowerCase();

			palaceDiscordTextChannelInfo.channelName = channelName;
			palaceDiscordTextChannelInfo.openingMessage = title;

			$(".catalog-item").each((_, ele) => {
				var palaceDropInfo = new PalaceDropInfo();
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

				var parts = itemSlug.split("-");
				var season = `${parts[0]}-${parts[1]}`;

				palaceDropInfo.imageUrl = constants.PALACE_COMMUNITY_BASE_URL + png;
				palaceDropInfo.productInfoUrl = `${constants.PALACE_COMMUNITY_BASE_URL}/collections/${season}/items/${itemId}/${itemSlug}`;
				palaceDropInfo.productName = itemName;
				palaceDropInfo.categoryUrl = `${
					constants.PALACE_BASE_URL
				}/collections/${category.toLowerCase()}`;
				palaceDropInfo.price = price;

				//console.log(palaceDropInfo);

				productList.push(palaceDropInfo);
			});

			palaceDiscordTextChannelInfo.products = productList;
		} catch (error) {
			console.log(error);
		}

		return palaceDiscordTextChannelInfo;
	}
}

module.exports = Palace;
