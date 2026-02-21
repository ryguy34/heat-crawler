import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import cron from "node-cron";
import { Discord } from "./modules/discord";
import { Supreme } from "./modules/supreme";
import { Palace } from "./modules/palace";
import { SNKRS } from "./modules/snkrs";
import Utility from "./utility/utility";
import logger, { initLogFile } from "./utility/logger";
import { Kith } from "./modules/kith";
import express from "express";

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);

const discord = new Discord();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Determine the environment (default to 'dev' if NODE_ENV is not set)
const envFile = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ""}`;

// Load the environment variables from the appropriate files.... .env first, then specific env file
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), envFile) });

client.login(process.env.CLIENT_TOKEN);

/**
 * main function for Supreme notifications to Discord channel
 */
async function mainSupremeNotifications(date: string): Promise<void> {
	const supreme = new Supreme();
	try {
		const currentSeason = Utility.getCurrentSeason();

		const supremeDiscordTextChannelInfo = await supreme.parseSupremeDrop(
			date,
			(() => {
				const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
				if (!match) {
					throw new Error(
						`Invalid date format: ${date}. Expected YYYY-MM-DD.`,
					);
				}
				return parseInt(match[1], 10);
			})(),
			currentSeason,
		);

		if (supremeDiscordTextChannelInfo) {
			const value = await discord.doesChannelExistUnderCategory(
				client,
				supremeDiscordTextChannelInfo.channelName,
				process.env.SUPREME_CATEGORY_ID!,
			);

			if (!value) {
				const supremeCategory =
					await discord.getFullCategoryNameBySubstring(
						client,
						process.env.SUPREME_CATEGORY_NAME!,
					);

				if (supremeCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						supremeCategory,
						supremeDiscordTextChannelInfo.channelName,
					);

					await discord.sendDropInfo(
						supremeDiscordTextChannelInfo,
						newChannel!,
						"Supreme",
					);
				}
			}
		}
	} catch (error) {
		logger.error(error);
	}
}

/**
 * main function for Palace notifications to Discord channel
 */
async function mainPalaceNotifications(date: string): Promise<void> {
	const palace = new Palace();

	try {
		const palaceDiscordTextChannelInfo = await palace.parsePalaceDrop(date);

		if (palaceDiscordTextChannelInfo) {
			const value = await discord.doesChannelExistUnderCategory(
				client,
				palaceDiscordTextChannelInfo.channelName,
				process.env.PALACE_CATEGORY_ID!,
			);

			if (!value) {
				const palaceCategory = await discord.getFullCategoryNameBySubstring(
					client,
					process.env.PALACE_CATEGORY_NAME!,
				);

				if (palaceCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						palaceCategory,
						palaceDiscordTextChannelInfo.channelName,
					);

					await discord.sendDropInfo(
						palaceDiscordTextChannelInfo,
						newChannel!,
						"Palace",
					);
				}
			}
		}
	} catch (error) {
		logger.error(error);
	}
}

/**
 * main function for SNKRS notifications to Discord channel
 */
// async function mainSnkrsNotifications(): Promise<void> {
// 	const snkrs = new SNKRS();
// 	var tomorrowsDate = Utility.getTomorrowsDate();

// 	try {
// 		const snkrsDrops = await snkrs.parseSnkrsDropInfo(tomorrowsDate);

// 		for (const snkrsDrop of snkrsDrops) {
// 			const existingChannel = await discord.doesChannelExistUnderCategory(
// 				client,
// 				snkrsDrop.channelName,
// 				constants.SNKRS.CATEGORY_ID
// 				//constants.TEST.CATEGORY_ID
// 			);

// 			if (!existingChannel) {
// 				const snkrsCategory = await discord.getFullCategoryNameBySubstring(
// 					client,
// 					"releases"
// 					//"TEST"
// 				);
// 				const snkrsReleaseChannel = await discord.createTextChannel(
// 					client,
// 					snkrsCategory!,
// 					snkrsDrop.channelName
// 				);
// 				await discord.sendSnkrsDropInfo(snkrsDrop, snkrsReleaseChannel!);
// 			}
// 		}
// 		//await discord.deleteOldSnkrsReleases(client);
// 	} catch (error) {
// 		logger.error(error);
// 	}
// }

/**
 * main function for Kith Monday Program notifications to Discord channel
 */
async function mainKithMondayProgramNotifications(): Promise<void> {
	const kith = new Kith();

	try {
		const kithMondayProgramProductList =
			await kith.parseKithMondayProgramDrop();

		if (kithMondayProgramProductList.length > 0) {
			// upcoming release found
			const mondayProgramReleaseDate = Utility.getUpcomingMonday();
			const value = await discord.doesChannelExistUnderCategory(
				client,
				mondayProgramReleaseDate,
				process.env.KITH_CATEGORY_ID!,
			);

			if (!value) {
				const kithCategory = await discord.getFullCategoryNameBySubstring(
					client,
					process.env.KITH_CATEGORY_NAME!,
				);

				if (kithCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						kithCategory,
						mondayProgramReleaseDate,
					);

					await discord.sendKithInfo(
						kithMondayProgramProductList,
						newChannel!,
					);
				}
			}
		}
	} catch (error) {
		logger.error(error);
	}
}

client.on("clientReady", async () => {
	logger.info("Heat Crawler Discord Bot is online");
	app.listen(port, () => {
		logger.info(`Heat Crawler API is listening at http://localhost:${port}`);
	});

	app.get("/drops/:store/:date", async (req, res) => {
		const store = req.params.store.toLowerCase();
		const date = req.params.date;
		const requestKey = `${store}-${date}`;

		try {
			let operationPromise: Promise<void>;

			switch (store) {
				case "supreme":
					initLogFile("supreme");
					logger.info("Running Supreme api job with date " + date);
					operationPromise = mainSupremeNotifications(date);
					await operationPromise;
					res.json({ message: "Supreme notifications finished", date });
					logger.info("Finished Supreme api job");
					break;
				case "palace":
					initLogFile("palace");
					logger.info("Running Palace api job with date " + date);
					operationPromise = mainPalaceNotifications(date);
					await operationPromise;
					res.json({ message: "Palace notifications finished", date });
					logger.info("Finished Palace api job");
					break;
				default:
					res.status(400).json({ error: `Unknown store: ${store}` });
			}
		} catch (error) {
			logger.error(error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	app.get("/kith/:title", async (req, res) => {
		const title = req.params.title.toLowerCase();
		res.json({ message: "Kith notifications finished", title });
	});

	//runs every Wednesday at 8PM
	cron.schedule("0 20 * * 3", async () => {
		initLogFile("supreme");
		logger.info("Running Supreme cron job");
		const targetedDate = Utility.getThursdayOfCurrentWeek(); // returns format: YYYY-MM-DD
		await mainSupremeNotifications(targetedDate);
		logger.info("Supreme drops are done");
	});

	//runs every Thursday at 8PM
	cron.schedule("0 20 * * 4", async () => {
		initLogFile("palace");
		logger.info("Running Palace cron job");
		const targetedDate = Utility.getFridayOfCurrentWeek(); // returns format: YYYY-MM-DD
		await mainPalaceNotifications(targetedDate);
		logger.info("Palace drops are done");
	});

	//runs everyday at 8PM
	// cron.schedule("0 20 * * *", () => {
	// 	logger.info("Running SNKRS cron job");
	// 	await mainSnkrsNotifications();
	// 	logger.info("SNKRS drops are done");
	// });

	//runs every Sunday at 8PM
	cron.schedule("0 20 * * 0", async () => {
		initLogFile("kith");
		logger.info("Running Kith Monday Program cron job");
		await mainKithMondayProgramNotifications();
		logger.info("Kith Monday Program drops are done");
	});
});
