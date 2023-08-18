require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const constants = require("./constants");
const SupremeDropInfo = require("./vo/SupremeDropInfo");
const SupremeTextChannelInfo = require("./vo/SupremeTextChannelInfo");

/*
<div id="list">
  <div class="item-level-a">
    <div class="item-level-b">
      <a href="http://www.example.com/1"></a>
    </div>
  </div>

  <div class="item-level-a">
    <div class="item-level-b">
      <a href="http://www.example.com/2"></a>
    </div>
  </div>

  <div class="item-level-a">
    <div class="item-level-b">
      <a href="http://www.example.com/3"></a>
    </div>
  </div>
</div>

var list = [];
$('div[id="list"]').find('div > div > a').each(function (index, element) {
  list.push($(element).attr('href'));
});
console.dir(list);

*/

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

			$(".catalog-item").each((_, ele) => {
				var productInfo = new SupremeDropInfo();
				//const itemId = $(".a").attr("data-itemid");
				var itemId = $(ele).find("a").attr("data-itemid");
				console.log("ItemId: " + itemId);
				//const itemId = $(ele).children("catalog-item__thumb").attr("data-src");
				//console.log("ItemId: " + itemId);
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

				productInfo.productName = prodName === "" ? "?" : prodName;
				productInfo.price = price === "" ? "Free or Unknown" : price;

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
