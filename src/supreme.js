require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const constants = require("./constants");
const SupremeDropInfo = require("./vo/SupremeDropInfo");
const SupremeTextChannelInfo = require("./vo/SupremeTextChannelInfo");

class Supreme {
	constructor() {}

	async parseSupremeDrop(currentDate, currentYear, currentSeason) {
		var supremeTextChannelInfo = new SupremeTextChannelInfo();
		var productList = [];

		try {
			const res = await axios.get(
				constants.SUPREME_DROPS_URL +
					"/season/" +
					currentSeason +
					currentYear +
					"/droplist/2023-08-17", // TODO: will need to swap this with current date once cron expression executes every thursday
				constants.params
			);
			const htmlData = res.data;
			const $ = cheerio.load(htmlData);
			var title = $("title").text();
			var channelName = title
				.substring(title.indexOf("-") + 1, title.lastIndexOf("-"))
				.trim()
				.toLocaleLowerCase()
				.replace(" ", "-"); // TODO: might need to change this logic when using this field to create discord channel

			supremeTextChannelInfo.openingMessage = title;
			supremeTextChannelInfo.channelName = channelName;

			$(".catalog-item").each((_, ele) => {
				var productInfo = new SupremeDropInfo();
				var itemId = $(ele).find("a").attr("data-itemid");
				var itemSlug = $(ele).find("a").attr("data-itemslug");
				var itemName = $(ele).find("a").attr("data-itemname");

				const price = $(ele)
					.find(".catalog-label-price")
					.first()
					.text()
					.replace(/(\r\n|\n|\r)/gm, "");

				productInfo.productName = itemName === "" ? "?" : itemName;
				productInfo.price = price === "" ? "Free or Unknown" : price;
				productInfo.productInfoUrl =
					constants.SUPREME_DROPS_URL +
					"season/itemdetails/" +
					itemId +
					"/" +
					itemSlug;
				productInfo.imageUrl =
					constants.SUPREME_DROPS_URL +
					"season/itemdetails/" +
					itemId +
					"/" +
					itemSlug +
					"/#gallery-1";

				productList.push(productInfo);
			});

			supremeTextChannelInfo.products = productList;
		} catch (error) {
			console.error(error);
		}

		return supremeTextChannelInfo;
	}
}

module.exports = Supreme;
