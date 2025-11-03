import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { load } from "cheerio";
import {
	ShopifyChannelInfo,
	ShopifyProductInfo,
} from "../interface/ShopifyInterface";
import logger from "../utility/logger";

import constants from "../utility/constants";

// Add stealth plugin and initialize
puppeteer.use(StealthPlugin());

export class Palace {
	constructor() {}

	async parsePalaceDrop(
		currentWeekFridayDate: string
	): Promise<ShopifyChannelInfo> {
		var productList: ShopifyProductInfo[] = [];
		var palaceDiscordTextChannelInfo;
		let browser: Browser | undefined;
		const url = `${constants.PALACE.COMMUNITY_BASE_URL}/droplists/${currentWeekFridayDate}`;
		try {
			browser = await puppeteer.launch({
				headless: false,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-infobars",
					"--window-position=0,0",
					"--ignore-certifcate-errors",
					"--ignore-certifcate-errors-spki-list",
					"--window-size=1920,1080",
				],
				defaultViewport: {
					width: 1920,
					height: 1080,
				},
			});
			const page = await browser.newPage();
			await page.setUserAgent({
				userAgent: constants.PALACE.HEADERS.headers["User-Agent"],
			});
			await page.goto(url, { waitUntil: "networkidle2" });
			const htmlData = await page.content();

			const $ = load(htmlData);

			var title = $(".title-font h1").text();
			const parsedChannelName = title
				.substring(title.indexOf(",") + 1)
				.trim()
				.toLowerCase()
				.split(" ");

			var month = parsedChannelName[0].substring(0, 3);
			const channelName = `${month}-${parsedChannelName[1]}`;

			const catalogItems = $(".catalog-item").toArray();

			for (const ele of catalogItems) {
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

				const imageUrl = `${constants.PALACE.COMMUNITY_BASE_URL}/collections/${season}/items/${itemId}/${itemSlug}/#gallery-1`;
				const productInfoUrl = `${constants.PALACE.COMMUNITY_BASE_URL}/collections/${season}/items/${itemId}/${itemSlug}`;
				const productName = itemName;
				const categoryUrl = `${constants.PALACE.STORE_BASE_URL}/collections/${category}`;
				var price = price === "" ? "???" : price;

				// Take screenshot using Puppeteer
				if (imageUrl) {
					try {
						// Ensure screenshots directory exists
						const fs = require("fs");
						const path = require("path");
						const screenshotsDir = path.resolve(
							__dirname,
							"../../screenshots/palace"
						);
						if (!fs.existsSync(screenshotsDir)) {
							fs.mkdirSync(screenshotsDir, { recursive: true });
						}

						const newPage = await browser!.newPage();
						await newPage.setDefaultNavigationTimeout(60000);
						await newPage.setUserAgent(
							constants.PALACE.HEADERS.headers["User-Agent"]
						);
						await newPage.setExtraHTTPHeaders({
							Accept:
								"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
							"Accept-Language": "en-US,en;q=0.5",
							Connection: "keep-alive",
							"Upgrade-Insecure-Requests": "1",
						});
						await newPage.goto(imageUrl, {
							waitUntil: "networkidle2",
							timeout: 60000,
						});
						const screenshotPath = path.join(
							screenshotsDir,
							`screenshot_${itemId || "unknown"}.png`
						);
						try {
							const fancyEl = await newPage.$(".fancybox-content");
							if (fancyEl) {
								try {
									await fancyEl.screenshot({
										path: screenshotPath,
										type: "png",
									});
								} catch (elErr) {
									logger.error(
										`Element screenshot failed, falling back: ${elErr}`
									);
									await newPage.screenshot({
										path: screenshotPath,
										type: "png",
										fullPage: true,
									});
								}
							} else {
								await newPage.screenshot({
									path: screenshotPath,
									type: "png",
									fullPage: true,
								});
							}
						} catch (sErr) {
							logger.error(`Screenshot/crop failed: ${sErr}`);
							try {
								await newPage.screenshot({
									path: screenshotPath,
									type: "png",
									fullPage: true,
								});
							} catch (ee) {
								logger.error(`Fallback screenshot failed: ${ee}`);
							}
						}
						await newPage.close();
					} catch (err) {
						logger.error(
							`Failed to take screenshot for ${imageUrl}: ${err}`
						);
					}
				}

				var palaceDropInfo = {
					productName: productName!,
					productInfoUrl: productInfoUrl,
					imageUrl: imageUrl,
					price: price,
					categoryUrl: categoryUrl,
				} as ShopifyProductInfo;

				productList.push(palaceDropInfo);
			}

			palaceDiscordTextChannelInfo = {
				channelName: channelName,
				openingMessage: title,
				products: productList,
			} as ShopifyChannelInfo;
		} catch (error: unknown) {
			logger.error(error instanceof Error ? error.message : String(error));
		} finally {
			if (browser) {
				await browser.close();
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
