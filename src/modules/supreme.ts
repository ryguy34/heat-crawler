import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import logger from "../utility/logger";
import { load } from "cheerio";
import {
	ShopifyChannelInfo,
	ShopifyProductInfo,
} from "../interface/ShopifyInterface";
import constants from "../utility/constants";

// Add stealth plugin and initialize
puppeteer.use(StealthPlugin());

// Allow overriding Puppeteer navigation timeouts via env; default to 60s
const NAV_TIMEOUT_MS = parseInt(
	process.env.PUPPETEER_NAV_TIMEOUT_MS || "60000",
	10,
);

/**
 * Supreme module for scraping product drop information from supremecommunity.com.
 * Uses Puppeteer with stealth plugin to parse weekly droplists and capture product screenshots.
 */
export class Supreme {
	constructor() {}

	/**
	 * Parses the Supreme droplist for a specific Thursday release date.
	 * Scrapes product information including name, price, category, and captures
	 * screenshots of each item from the fancybox gallery.
	 *
	 * @param currentWeekThursdayDate - The Thursday date in YYYY-MM-DD format
	 * @param currentYear - The current year (e.g., 2026)
	 * @param currentSeason - The current Supreme season (e.g., "spring-summer" or "fall-winter")
	 * @returns ShopifyChannelInfo with channel name, opening message, and product list,
	 *          or undefined if the droplist page returns an error
	 */
	async parseSupremeDrop(
		currentWeekThursdayDate: string,
		currentYear: number,
		currentSeason: string,
	): Promise<ShopifyChannelInfo | undefined> {
		const productList: ShopifyProductInfo[] = [];
		let supremeTextChannelInfo: ShopifyChannelInfo | undefined;
		let browser: Browser | undefined;
		const executablePath =
			process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
		const url = `${constants.SUPREME.COMMUNITY_BASE_URL}/season/${currentSeason}${currentYear}/droplist/${currentWeekThursdayDate}`;
		try {
			logger.info("Launching browser for Supreme droplist parsing...");
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
				userAgent: constants.SUPREME.HEADERS.headers["User-Agent"],
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
					`Supreme droplist returned HTTP ${status}; skipping. url=${url}`,
				);
				return undefined;
			}
			const htmlData = await page.content();

			const $ = load(htmlData);
			const title = $("title").text();
			const channelName = title
				.substring(title.indexOf("-") + 1, title.lastIndexOf("-"))
				.trim()
				.toLocaleLowerCase()
				.replace(" ", "-");

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

				logger.info(
					`Parsed Supreme product: ${productName?.trim()} | ${formatPrice.trim()}`,
				);

				// Take screenshot using Puppeteer
				if (imageUrl) {
					try {
						const newPage = await browser!.newPage();
						// Set a longer timeout and modify navigation settings
						newPage.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
						await newPage.setUserAgent({
							userAgent: constants.SUPREME.HEADERS.headers["User-Agent"],
						});

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
							timeout: NAV_TIMEOUT_MS,
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
						} catch (_e) {
							// selector not found or click failed - continue
						}

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
										path: `screenshots/supreme/screenshot_${
											itemId || "unknown"
										}.png`,
										type: "png",
									});
								} catch (elErr) {
									logger.error(
										`Element screenshot failed, falling back: ${elErr}`,
									);
									await newPage.screenshot({
										path: `screenshots/supreme/screenshot_${
											itemId || "unknown"
										}.png`,
										type: "png",
										fullPage: true,
									});
								}
							} else {
								// no fancybox, fallback to full page
								await newPage.screenshot({
									path: `screenshots/supreme/screenshot_${
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
									path: `screenshots/supreme/screenshot_${
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
							`Failed to take screenshot for ${imageUrl}: ${err}`,
						);
					}
				}

				const productInfo = {
					productName: productName!,
					productInfoUrl: productInfoUrl,
					imageUrl: imageUrl,
					price: formatPrice,
					categoryUrl: categoryUrl,
				};

				productList.push(productInfo);
			}

			supremeTextChannelInfo = {
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
		return supremeTextChannelInfo;
	}
}
