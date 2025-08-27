import puppeteer from "puppeteer";
import logger from "../config/logger";
import { load } from "cheerio";
import { ShopifyDropInfo } from "../vo/shopify/shopifyDropInfo";
import { ShopifyChannelInfo } from "../vo/shopify/shopifyChannelInfo";
import constants from "../utility/constants";

export class Supreme {
	constructor() {}

	async parseSupremeDrop(
		currentWeekThursdayDate: string,
		currentYear: number,
		currentSeason: string
	): Promise<ShopifyChannelInfo> {
		let productList: ShopifyDropInfo[] = [];
		let supremeTextChannelInfo;
		const url = `${constants.SUPREME.COMMUNITY_BASE_URL}/season/${currentSeason}${currentYear}/droplist/${currentWeekThursdayDate}`;
		try {
			const browser = await puppeteer.launch({ headless: true });
			const page = await browser.newPage();
			await page.setUserAgent(constants.SNKRS.HEADERS.headers["User-Agent"]);
			await page.goto(url, { waitUntil: "networkidle2" });
			const htmlData = await page.content();
			await browser.close();

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
		} catch (error: unknown) {
			logger.error(error instanceof Error ? error.message : String(error));
		}
		return supremeTextChannelInfo!;
	}
}
