/**
 * @fileoverview Heat Crawler - Discord bot for streetwear drop notifications.
 *
 * This module serves as the main entry point for the Heat Crawler application.
 * It initializes the Discord bot, Express API server, and scheduled cron jobs
 * to monitor and notify users about upcoming product drops from:
 * - Supreme (Thursday drops)
 * - Palace (Friday drops)
 * - Kith Monday Program (Monday drops)
 *
 * @module main
 */

import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import cron from "node-cron";
import { Discord } from "./modules/discord";
import { Supreme } from "./modules/supreme";
import { Palace } from "./modules/palace";
import Utility from "./utility/utility";
import logger, { initLogFile } from "./utility/logger";
import { Kith } from "./modules/kith";
import express from "express";

/** Express application instance for the REST API */
const app = express();

/** Port number for the Express server, defaults to 8080 */
const port = parseInt(process.env.PORT || "8080", 10);

/** Discord utility class instance for channel management */
const discord = new Discord();

/** Discord.js client instance with required intents for guild/message operations */
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
 * Scrapes Supreme drop information and sends notifications to Discord.
 *
 * Parses product data from the Supreme website for the given date,
 * creates a new Discord channel under the Supreme category if one
 * doesn't already exist, and posts drop information with product images.
 *
 * @param date - Target drop date in YYYY-MM-DD format
 * @returns Resolves when notifications are sent or if channel already exists
 * @throws Logs error if parsing or Discord operations fail
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
 * Scrapes Palace drop information and sends notifications to Discord.
 *
 * Parses product data from the Palace community site for the given date,
 * creates a new Discord channel under the Palace category if one
 * doesn't already exist, and posts drop information with screenshots.
 *
 * @param date - Target drop date in YYYY-MM-DD format
 * @returns Resolves when notifications are sent or if channel already exists
 * @throws Logs error if parsing or Discord operations fail
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
 * Scrapes Kith Monday Program drop information and sends notifications to Discord.
 *
 * Parses the upcoming Monday Program products from the Kith website,
 * creates a new Discord channel under the Kith category named with
 * the upcoming Monday's date, and posts product information.
 *
 * @returns Resolves when notifications are sent or if channel already exists
 * @throws Logs error if parsing or Discord operations fail
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

/**
 * Discord client ready event handler.
 *
 * Initializes the Express API server and registers all routes and cron jobs
 * once the Discord bot successfully connects and is ready.
 */
client.on("clientReady", async () => {
	logger.info("Heat Crawler Discord Bot is online");
	app.listen(port, () => {
		logger.info(`Heat Crawler API is listening at http://localhost:${port}`);
	});

	/**
	 * GET /drops/:store/:date
	 *
	 * Manually trigger drop notifications for a specific store and date.
	 *
	 * @route GET /drops/:store/:date
	 * @param store - Store name ("supreme" or "palace")
	 * @param date - Drop date in YYYY-MM-DD format
	 * @returns JSON with success message or error
	 */
	app.get("/drops/:store/:date", async (req, res) => {
		const store = req.params.store.toLowerCase();
		const date = req.params.date;

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
	/**
	 * GET /kith/:title
	 *
	 * Manually trigger notifications for a specific Kith collection.
	 *
	 * @route GET /kith/:title
	 * @param title - Collection slug (e.g., \"kith-monday-program\")
	 * @returns JSON with success message, \"Already processed\", or 404 if not found
	 */ app.get("/kith/:title", async (req, res) => {
		const collectionSlug = req.params.title.toLowerCase();
		const kith = new Kith();

		try {
			initLogFile("kith");
			logger.info(`Running Kith collection api job for: ${collectionSlug}`);

			// Check if channel already exists
			const channelExists = await discord.doesChannelExistUnderCategory(
				client,
				collectionSlug,
				process.env.KITH_CATEGORY_ID!,
			);

			if (channelExists) {
				logger.info(`Channel ${collectionSlug} already exists`);
				res.json({ message: "Already processed", collectionSlug });
				return;
			}

			// Parse the collection
			const products = await kith.parseKithCollection(collectionSlug);

			if (products.length === 0) {
				logger.info(`Collection not found or empty: ${collectionSlug}`);
				res.status(404).json({ error: "Collection not found" });
				return;
			}

			// Create Discord channel
			const kithCategory = await discord.getFullCategoryNameBySubstring(
				client,
				process.env.KITH_CATEGORY_NAME!,
			);

			if (kithCategory) {
				const newChannel = await discord.createTextChannel(
					client,
					kithCategory,
					collectionSlug,
				);

				// Send notifications with custom message
				const openingMessage = `<@&834439628295241758> Check out the ${collectionSlug} collection!`;
				await discord.sendKithInfo(products, newChannel!, openingMessage);
			}

			res.json({ message: "Kith notifications finished", collectionSlug });
			logger.info(`Finished Kith collection api job for: ${collectionSlug}`);
		} catch (error) {
			logger.error(error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	/**
	 * Supreme cron job - Runs every Wednesday at 8PM EST.
	 * Fetches Thursday's Supreme drop info and posts to Discord.
	 */
	cron.schedule("0 20 * * 3", async () => {
		initLogFile("supreme");
		logger.info("Running Supreme cron job");
		const targetedDate = Utility.getThursdayOfCurrentWeek(); // returns format: YYYY-MM-DD
		await mainSupremeNotifications(targetedDate);
		logger.info("Supreme drops are done");
	});

	/**
	 * Palace cron job - Runs every Thursday at 8PM EST.
	 * Fetches Friday's Palace drop info and posts to Discord.
	 */
	cron.schedule("0 20 * * 4", async () => {
		initLogFile("palace");
		logger.info("Running Palace cron job");
		const targetedDate = Utility.getFridayOfCurrentWeek(); // returns format: YYYY-MM-DD
		await mainPalaceNotifications(targetedDate);
		logger.info("Palace drops are done");
	});

	/**
	 * Kith Monday Program cron job - Runs every Sunday at 8PM EST.
	 * Fetches Monday's Kith drop info and posts to Discord.
	 */
	cron.schedule("0 20 * * 0", async () => {
		initLogFile("kith");
		logger.info("Running Kith Monday Program cron job");
		await mainKithMondayProgramNotifications();
		logger.info("Kith Monday Program drops are done");
	});
});
