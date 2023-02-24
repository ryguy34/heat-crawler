require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const constants = require("./constants");
const SupremeDropInfo = require("./vo/SupremeDropInfo");
const SupremeTextChannelInfo = require("./vo/SupremeTextChannelInfo");

class Supreme {
	constructor() {}

	async parseSupremeDrop() {
		var supremeTextChannelInfo = new SupremeTextChannelInfo();
		var productList = [];

		try {
			const res = await axios.get(constants.SUPREME_URL, constants.params);
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

			$(".catalog-list").each((index, ele) => {
				var productInfo = new SupremeDropInfo();
				const prodName = $(ele)
					.find(".catalog-item__title")
					.first()
					.text()
					.replace(/(\r\n|\n|\r)/gm, "");

				const price = $(ele)
					.find(".catalog-label-price")
					.first()
					.text()
					.replace(/(\r\n|\n|\r)/gm, "");

				productInfo.productName = prodName;
				productInfo.price = price;

				productList.push(productInfo);
			});
			//TODO: parse 'data-itemid' and 'data-itemslug' 'data-itemname'
			supremeTextChannelInfo.products = productList;
			console.log(supremeTextChannelInfo);
		} catch (error) {
			console.error(error);
		}
	}

	async getChannelName() {}
}

module.exports = Supreme;
