import * as puppeteer from "puppeteer";
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
		let browser: puppeteer.Browser | undefined;
		const url = `${constants.SUPREME.COMMUNITY_BASE_URL}/season/${currentSeason}${currentYear}/droplist/${currentWeekThursdayDate}`;
		try {
			browser = await puppeteer.launch({ headless: false });
			const page = await browser.newPage();
			await page.setUserAgent(constants.SNKRS.HEADERS.headers["User-Agent"]);
			await page.goto(url, { waitUntil: "networkidle2" });
			const htmlData = await page.content();

			const $ = load(htmlData);
			var title = $("title").text();
			var channelName = title
				.substring(title.indexOf("-") + 1, title.lastIndexOf("-"))
				.trim()
				.toLocaleLowerCase()
				.replace(" ", "-");

			supremeTextChannelInfo = new ShopifyChannelInfo(channelName, title);

			const catalogItems = $(".catalog-item").toArray();

			// Process items one at a time
			for (const ele of catalogItems) {
				const itemId = $(ele).find("a").attr("data-itemid");
				const itemSlug = $(ele).find("a").attr("data-itemslug");
				const itemName = $(ele).find("a").attr("data-itemname");
				const category = $(ele).attr("data-category");

				const price = $(ele)
					.find(".catalog-label-price")
					.first()
					.text()
					.replace(/(\r\n|\n|\r)/gm, "");

				const imageUrl =
					constants.SUPREME.COMMUNITY_BASE_URL +
					"/season/itemdetails/" +
					itemId +
					"/" +
					itemSlug +
					"/#gallery-1";
				const productName = itemName === "" ? "?" : itemName;
				const formatPrice = price === "" ? "Free or Unknown" : price;
				const categoryUrl =
					constants.SUPREME.STORE_BASE_URL + "collections/" + category;
				const productInfoUrl =
					constants.SUPREME.COMMUNITY_BASE_URL +
					"/season/itemdetails/" +
					itemId +
					"/" +
					itemSlug;

				// Take screenshot using Puppeteer
				if (imageUrl) {
					try {
						const newPage = await browser!.newPage();
						// Set a longer timeout and modify navigation settings
						await newPage.setDefaultNavigationTimeout(60000);
						await newPage.setUserAgent(
							constants.SNKRS.HEADERS.headers["User-Agent"]
						);

						// Set additional headers
						await newPage.setExtraHTTPHeaders({
							Accept:
								"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
							"Accept-Language": "en-US,en;q=0.5",
							Connection: "keep-alive",
							"Upgrade-Insecure-Requests": "1",
						});

						// Just wait for the page to load and take a screenshot
						await newPage.goto(imageUrl, {
							waitUntil: "networkidle2",
							timeout: 60000,
						});

						await newPage.screenshot({
							path: `screenshots/screenshot_${itemId || "unknown"}.png`,
							type: "png",
							fullPage: true,
						});
						await newPage.close();
					} catch (err) {
						logger.error(
							`Failed to take screenshot for ${imageUrl}: ${err}`
						);
					}
				}

				const productInfo = new ShopifyDropInfo(
					productName!,
					productInfoUrl,
					imageUrl!,
					formatPrice,
					categoryUrl
				);

				productList.push(productInfo);
			}

			supremeTextChannelInfo.products = productList;
		} catch (error: unknown) {
			logger.error(error instanceof Error ? error.message : String(error));
		} finally {
			if (browser) {
				await browser.close();
			}
		}
		return supremeTextChannelInfo!;
	}
}
