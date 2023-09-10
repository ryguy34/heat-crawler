const constants = require("./constants");
const axios = require("axios");
const cheerio = require("cheerio");
const PalaceDropInfo = require("./vo/palaceDropInfo");
const PalaceTextChannelInfo = require("./vo/palaceTextChannelInfo");

class Palace {
	constructor() {}

	async parsePalaceDrop(currentWeekFridayDate) {
		var palaceDiscordTextChannelInfo = new PalaceTextChannelInfo();

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
			const channelName = title.substring(title.indexOf(",") + 1).trim();

			palaceDiscordTextChannelInfo.channelName = channelName;
			palaceDiscordTextChannelInfo.openingMessage = title;

			$(".catalog-item").each((_, ele) => {
				var palaceDropInfo = new PalaceDropInfo();
				var itemId = $(ele).find("a").attr("data-itemid");
				var itemSlug = $(ele).find("a").attr("data-itemslug");
				var itemName = $(ele).find("a").attr("data-itemname");
				var category = $(ele).attr("data-category");

				// TODO: find price and image url
			});

			console.log(channelName);
		} catch (error) {
			console.log(error);
		}
	}
}

module.exports = Palace;
