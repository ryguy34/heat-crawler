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

// Allow overriding Puppeteer navigation timeouts via env; default to 60s
const NAV_TIMEOUT_MS = parseInt(
	process.env.PUPPETEER_NAV_TIMEOUT_MS || "60000",
	10,
);

/**
 * Palace module for scraping product drop information from palacecmty.com.
 * Uses Puppeteer with stealth plugin to parse weekly droplists and capture product screenshots.
 */
export class Palace {
	constructor() {}

	/**
	 * Parses the Palace droplist for a specific Friday release date.
	 * Scrapes product information including name, price, category, and captures
	 * screenshots of each item from the fancybox gallery.
	 *
	 * @param currentWeekFridayDate - The Friday date in YYYY-MM-DD format
	 * @returns ShopifyChannelInfo with channel name, opening message, and product list,
	 *          or undefined if the droplist page returns an error
	 */
	async parsePalaceDrop(
		currentWeekFridayDate: string,
	): Promise<ShopifyChannelInfo | undefined> {
		var productList: ShopifyProductInfo[] = [];
		var palaceDiscordTextChannelInfo;
		let browser: Browser | undefined;
		const executablePath =
			process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
		const url = `${constants.PALACE.COMMUNITY_BASE_URL}/droplists/${currentWeekFridayDate}`;
		try {
			logger.info("Launching browser for Palace droplist parsing...");
			browser = await puppeteer.launch({
				headless:
					process.env.HEADLESS === undefined ||
					process.env.HEADLESS === "true",
				...(executablePath ? { executablePath } : {}),
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-infobars",
					"--window-position=0,0",
					"--ignore-certificate-errors",
					"--ignore-certificate-errors-spki-list",
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
			page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
			page.setDefaultTimeout(NAV_TIMEOUT_MS);
			const response = await page.goto(url, {
				waitUntil: "networkidle2",
				timeout: NAV_TIMEOUT_MS,
			});
			const status = response?.status();
			if (status !== undefined && status >= 400 && status < 500) {
				logger.error(
					`Palace droplist returned HTTP ${status}; skipping. url=${url}`,
				);
				return undefined;
			}
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

				logger.info(
					`Parsed Palace product: ${productName?.trim()} | ${price.trim()}`,
				);

				// Take screenshot using Puppeteer
				if (imageUrl) {
					try {
						// Ensure screenshots directory exists
						const fs = require("fs");
						const path = require("path");
						const screenshotsDir = path.resolve(
							__dirname,
							"../../screenshots/palace",
						);
						if (!fs.existsSync(screenshotsDir)) {
							fs.mkdirSync(screenshotsDir, { recursive: true });
						}

						const newPage = await browser!.newPage();
						newPage.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
						await newPage.setUserAgent({
							userAgent: constants.PALACE.HEADERS.headers["User-Agent"],
						});
						await newPage.setExtraHTTPHeaders({
							Accept:
								"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
							"Accept-Language": "en-US,en;q=0.5",
							Connection: "keep-alive",
							"Upgrade-Insecure-Requests": "1",
						});
						await newPage.goto(imageUrl, {
							waitUntil: "networkidle2",
							timeout: NAV_TIMEOUT_MS,
						});
						const screenshotPath = path.join(
							screenshotsDir,
							`screenshot_${itemId || "unknown"}.png`,
						);

						// Wait for fancybox content to be visible and image to load
						let fancyEl = null;
						try {
							// Wait for fancybox-content to appear and be visible
							await newPage.waitForSelector(".fancybox-content", {
								visible: true,
								timeout: 15000,
							});

							// Wait for image inside fancybox to fully load
							await newPage.waitForFunction(
								() => {
									const img = document.querySelector(
										".fancybox-content img",
									) as HTMLImageElement | null;
									return img && img.complete && img.naturalWidth > 0;
								},
								{ timeout: 15000 },
							);

							// Small render buffer for any final CSS transitions
							await new Promise((res) => setTimeout(res, 300));

							fancyEl = await newPage.$(".fancybox-content");
						} catch (waitErr) {
							logger.warn(
								`Fancybox/image load wait timed out, proceeding with screenshot: ${waitErr}`,
							);
							// Try to get fancybox element anyway for best-effort screenshot
							fancyEl = await newPage.$(".fancybox-content");
						}

						// Take screenshot
						try {
							if (fancyEl) {
								try {
									await fancyEl.screenshot({
										path: screenshotPath,
										type: "png",
									});
								} catch (elErr) {
									logger.error(
										`Element screenshot failed, falling back: ${elErr}`,
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
							`Failed to take screenshot for ${imageUrl}: ${err}`,
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

	/**
	 * Maps Palace community category names to the official store category slugs.
	 * Handles special cases like hoods within sweatshirts and wallets within accessories.
	 *
	 * @param category - The category name from the community site
	 * @param itemSlug - The item slug used for special case detection
	 * @returns The mapped store category slug
	 */
	async mapPalaceCategory(
		category: string,
		itemSlug: string,
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
