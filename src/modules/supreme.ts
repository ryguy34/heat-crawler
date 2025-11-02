import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import logger from "../utility/logger";
import { load } from "cheerio";
import { ShopifyDropInfo } from "../vo/shopify/shopifyDropInfo";
import { ShopifyChannelInfo } from "../vo/shopify/shopifyChannelInfo";
import constants from "../utility/constants";

// Add stealth plugin and initialize
puppeteer.use(StealthPlugin());

export class Supreme {
	constructor() {}

	async parseSupremeDrop(
		currentWeekThursdayDate: string,
		currentYear: number,
		currentSeason: string
	): Promise<ShopifyChannelInfo> {
		let productList: ShopifyDropInfo[] = [];
		let supremeTextChannelInfo;
		let browser: Browser | undefined;
		const url = `${constants.SUPREME.COMMUNITY_BASE_URL}/season/${currentSeason}${currentYear}/droplist/${currentWeekThursdayDate}`;
		try {
			browser = await puppeteer.launch({
				headless: true,
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

						// Just wait for the page to load
						await newPage.goto(imageUrl, {
							waitUntil: "networkidle2",
							timeout: 60000,
						});

						// Close cookie banner if present (#cookiescript_close)
						try {
							await newPage.waitForSelector("#cookiescript_close", {
								timeout: 3000,
								visible: true,
							});
							await newPage.click("#cookiescript_close");
							// small delay to allow any animation to finish
							await new Promise((res) => setTimeout(res, 500));
						} catch (e) {
							// selector not found or click failed - continue
						}

						// Try to locate a fancybox content box and use its style/rect to crop the screenshot.
						try {
							const fancyEl = await newPage.$(".fancybox-content");
							if (fancyEl) {
								// Simpler and more robust: let Puppeteer capture the element directly.
								try {
									await fancyEl.screenshot({
										path: `screenshots/screenshot_${
											itemId || "unknown"
										}.png`,
										type: "png",
									});
								} catch (elErr) {
									logger.error(
										`Element screenshot failed, falling back: ${elErr}`
									);
									await newPage.screenshot({
										path: `screenshots/screenshot_${
											itemId || "unknown"
										}.png`,
										type: "png",
										fullPage: true,
									});
								}
							} else {
								// no fancybox, fallback to full page
								await newPage.screenshot({
									path: `screenshots/screenshot_${
										itemId || "unknown"
									}.png`,
									type: "png",
									fullPage: true,
								});
							}
						} catch (sErr) {
							logger.error(`Screenshot/crop failed: ${sErr}`);
							// fallback
							try {
								await newPage.screenshot({
									path: `screenshots/screenshot_${
										itemId || "unknown"
									}.png`,
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
