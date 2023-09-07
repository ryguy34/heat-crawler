require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const constants = require("./constants");
const SupremeDropInfo = require("./vo/SupremeDropInfo");
const SupremeTextChannelInfo = require("./vo/SupremeTextChannelInfo");

class Supreme {
	constructor() {}

	async parseSupremeDrop(currentWeekThursdayDate, currentYear, currentSeason) {
		var supremeTextChannelInfo = new SupremeTextChannelInfo();
		var productList = [];

		try {
			const res = await axios.get(
				constants.SUPREME_COMMUNITY_BASE_URL +
					"/season/" +
					currentSeason +
					currentYear +
					"/droplist/" +
					currentWeekThursdayDate,
				constants.params
			);

			const htmlData = res.data;
			const $ = cheerio.load(htmlData);
			var title = $("title").text();
			var channelName = title
				.substring(title.indexOf("-") + 1, title.lastIndexOf("-"))
				.trim()
				.toLocaleLowerCase()
				.replace(" ", "-");

			supremeTextChannelInfo.openingMessage = title;
			supremeTextChannelInfo.channelName = channelName;

			$(".catalog-item").each((_, ele) => {
				var productInfo = new SupremeDropInfo();
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

				productInfo.imageUrl =
					constants.SUPREME_COMMUNITY_BASE_URL + "resize/576" + png;
				productInfo.productName = itemName === "" ? "?" : itemName;
				productInfo.price = price === "" ? "Free or Unknown" : price;
				productInfo.categoryUrl =
					constants.SUPREME_BASE_URL + "collections/" + category;
				productInfo.productInfoUrl =
					constants.SUPREME_COMMUNITY_BASE_URL +
					"season/itemdetails/" +
					itemId +
					"/" +
					itemSlug;

				productList.push(productInfo);
			});

			supremeTextChannelInfo.products = productList;
		} catch (error) {
			if (error.response && error.response.status === 404) {
				console.log(
					"The requested resource was not found for " +
						error.response.config.url
				);

				return null;
			}
			console.error(error);
		}

		return supremeTextChannelInfo;
	}
}

module.exports = Supreme;
