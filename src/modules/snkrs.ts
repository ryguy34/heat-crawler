import axios from "axios";
import { load } from "cheerio";
import puppeteer from "puppeteer";
import zlib from "zlib";
import logger from "../config/logger";
//import { SnkrsDropInfo } from "../vo/snkrs/snkrsDropInfo";
import constants from "../utility/constants";

interface SnkrsDropInfo {
	channelName: string;
	title: string;
	imageUrls: string[];
	price: string;
	model: string;
	name: string;
	releaseDate: string;
	releaseTime: string;
	description: string;
	sku: string;
	link: string;
}

export class SNKRS {
	constructor() {}

	async parseSnkrsDropInfo(tomorrowsDate: string): Promise<SnkrsDropInfo[]> {
		var productLinks: string[] = [];
		const options = {
			method: "get",
			url: constants.SNKRS.URL,
			headers: constants.SNKRS.HEADERS.headers,
			responseType: "arraybuffer" as const,
			transformResponse: [
				(data: any) => {
					if (data.slice(0, 2).toString("hex") === "1f8b") {
						// Check if data is gzip-encoded
						return zlib.gunzipSync(data).toString("utf8");
					}
					// Assume it's utf8-encoded otherwise
					return data.toString("utf-8");
				},
			],
		};

		try {
			const res = await axios(options);
			const $ = load(res.data);

			$(".product-card").each((_: number, ele: any) => {
				var link = $(ele).find("a").attr("href");
				// https://www.nike.com/launch/t/acg-rufus-sequoia
				const productLink = `${constants.SNKRS.BASE_URL}${link}`.split(
					"?"
				)[0];
				productLinks.push(productLink);
			});
		} catch (error) {
			logger.error("Error gathering SNKRS release links: " + error);
		}

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		var snkrsDrops = [];
		for (const link of productLinks) {
			try {
				options.url = link;
				await page.goto(link);
				const dynamicContent = await page.content();
				const $ = load(dynamicContent);
				const model = $(".product-info").find("h1").first().text();
				const name = $(".product-info").find("h2").first().text();
				const price = $(".product-info").find("div").first().text();
				const availableAt = $(".product-info .test-available-date")
					.find("div")
					.text()
					.replace("2:00 PM", "9:00 AM")
					.replace("Available ", "");
				const dateTime = this.parseDateTime(availableAt);
				// TODO: only send releases that are one week out
				const releaseDate = dateTime[0];
				const releaseTime = dateTime[1];
				const descriptionAndSku = $(".product-info .description-text")
					.find("p")
					.first()
					.text()
					.split("\n");
				const description = descriptionAndSku[0];
				const sku = descriptionAndSku[1].trim().replace("SKU: ", "");
				const channelName = this.cleanChannelName(name, model, releaseDate);

				var imageLinks = await page.evaluate(() => {
					const imgs = document.querySelectorAll("img");
					return Array.from(imgs).map((img) => img.src);
				});

				imageLinks = imageLinks.filter((i) => {
					return i.includes("t_prod");
				});
				// const snkrsDropInfo = new SnkrsDropInfo(
				// 	channelName,
				// 	`${model} ${name}`,
				// 	imageLinks,
				// 	price,
				// 	model,
				// 	name,
				// 	releaseDate,
				// 	releaseTime,
				// 	description,
				// 	sku,
				// 	link
				// );

				const snkrsDropInfo = {
					channelName: channelName,
					title: `${model} ${name}`,
					imageUrls: imageLinks,
					price: price,
					model: model,
					name: name,
					releaseDate: releaseDate,
					releaseTime: releaseTime,
					description: description,
					sku: sku,
					link: link,
				};

				snkrsDrops.push(snkrsDropInfo);
				// logger.info("link: " + link);
				// logger.info("model: " + model);
				// logger.info("name: " + name);
				// logger.info("price: " + price);
				// logger.info("releaseDate: " + releaseDate);
				// logger.info("releaseTime: " + releaseTime);
				// logger.info("description: " + description);
				// logger.info("channelName: " + channelName);
				// logger.info("sku: " + sku + "\n");
			} catch (error) {
				logger.error("Error parsing SNKRS release: " + error);
			}
		}

		return snkrsDrops;
	}

	parseDateTime(availableAt: string): string[] {
		// [date, time]
		return availableAt.split(" at ");
	}

	cleanChannelName(name: string, model: string, date: string): string {
		var cleanedDate = date.replace("/", "-");
		var cleanName = name
			.replace(/\s+/g, "-")
			.replace(/[^a-zA-Z0-9-]/g, "")
			.toLowerCase();
		var cleanModel = model
			.replace("Air Jordan ", "aj")
			.replace(/\s+/g, "-")
			.replace(/[^a-zA-Z0-9-]/g, "")
			.toLowerCase();

		return `${cleanedDate}-${cleanModel}-${cleanName}`;
	}
}
