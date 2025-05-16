import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import cron from "node-cron";
import { Discord } from "./modules/discord";
import { Supreme } from "./modules/supreme";
import { Palace } from "./modules/palace";
import { SNKRS } from "./modules/snkrs";
import Utility from "./utility/utility";
import logger from "./config/logger";
import { Kith } from "./modules/kith";
import constants from "./utility/constants";

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

// Load the environment variables from the appropriate file
config({ path: path.resolve(process.cwd(), envFile) });

client.login(process.env.CLIENT_TOKEN);

/**
 * main function for Supreme notifications to Discord channel
 */
async function mainSupremeNotifications(): Promise<void> {
	const supreme = new Supreme();
	try {
		const currentWeekThursdayDate = Utility.getThursdayOfCurrentWeek();
		const currentYear = Utility.getFullYear();
		const currentSeason = Utility.getCurrentSeason();

		const supremeDiscordTextChannelInfo = await supreme.parseSupremeDrop(
			currentWeekThursdayDate,
			currentYear,
			currentSeason
		);

		if (supremeDiscordTextChannelInfo) {
			const value = await discord.doesChannelExistUnderCategory(
				client,
				supremeDiscordTextChannelInfo.channelName,
				constants.SUPREME.CATEGORY_ID
				//constants.TEST.CATEGORY_ID
			);

			if (!value) {
				const supremeCategory =
					await discord.getFullCategoryNameBySubstring(
						client,
						"SUPREME"
						//"TEST"
					);

				if (supremeCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						supremeCategory,
						supremeDiscordTextChannelInfo.channelName
					);

					await discord.sendDropInfo(
						supremeDiscordTextChannelInfo,
						newChannel!,
						"Supreme"
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
async function mainPalaceNotifications(): Promise<void> {
	const palace = new Palace();
	const currentWeekFridayDate = Utility.getFridayOfCurrentWeek(); // returns format: YYYY-MM-DD

	try {
		const palaceDiscordTextChannelInfo = await palace.parsePalaceDrop(
			currentWeekFridayDate
		);

		if (palaceDiscordTextChannelInfo) {
			const value = await discord.doesChannelExistUnderCategory(
				client,
				palaceDiscordTextChannelInfo.channelName,
				constants.PALACE.CATEGORY_ID
				//constants.TEST.CATEGORY_ID
			);

			if (!value) {
				const palaceCategory = await discord.getFullCategoryNameBySubstring(
					client,
					"PALACE"
					//"TEST"
				);

				if (palaceCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						palaceCategory,
						palaceDiscordTextChannelInfo.channelName
					);

					await discord.sendDropInfo(
						palaceDiscordTextChannelInfo,
						newChannel!,
						"Palace"
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
async function mainSnkrsNotifications(): Promise<void> {
	const snkrs = new SNKRS();
	var tomorrowsDate = Utility.getTomorrowsDate();

	try {
		const snkrsDrops = await snkrs.parseSnkrsDropInfo(tomorrowsDate);

		for (const snkrsDrop of snkrsDrops) {
			const existingChannel = await discord.doesChannelExistUnderCategory(
				client,
				snkrsDrop.channelName,
				constants.SNKRS.CATEGORY_ID
				//constants.TEST.CATEGORY_ID
			);

			if (!existingChannel) {
				const snkrsCategory = await discord.getFullCategoryNameBySubstring(
					client,
					"releases"
					//"TEST"
				);
				const snkrsReleaseChannel = await discord.createTextChannel(
					client,
					snkrsCategory!,
					snkrsDrop.channelName
				);

				await discord.sendSnkrsDropInfo(snkrsDrop, snkrsReleaseChannel!);
			}
		}
		//await discord.deleteOldSnkrsReleases(client);
	} catch (error) {
		logger.error(error);
	}
}

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
				constants.KITH.CATEGORY_ID
				//constants.TEST.CATEGORY_ID
			);

			if (!value) {
				const kithCategory = await discord.getFullCategoryNameBySubstring(
					client,
					"KITH MONDAY PROGRAM"
					//"TEST"
				);

				if (kithCategory) {
					const newChannel = await discord.createTextChannel(
						client,
						kithCategory,
						mondayProgramReleaseDate
					);

					await discord.sendKithInfo(
						kithMondayProgramProductList,
						newChannel!
					);
				}
			}
		}
	} catch (error) {
		logger.error(error);
	}
}

/**
 * When the script has connected to Discord successfully
 */
client.on("ready", async () => {
	logger.info("Bot is ready");

	//runs every Wednesday at 8PM
	cron.schedule("0 20 * * 3", async () => {
		logger.info("Running Supreme cron job");
		await mainSupremeNotifications();
		logger.info("Supreme drops are done");
	});

	//runs every Thursday at 8PM
	cron.schedule("0 20 * * 4", async () => {
		logger.info("Running Palace cron job");
		await mainPalaceNotifications();
		logger.info("Palace drops are done");
	});

	//runs everyday at 8PM
	// cron.schedule("0 20 * * *", () => {
	// 	logger.info("Running SNKRS cron job");
	// 	await mainSnkrsNotifications();
	// 	logger.info("SNKRS drops are done");
	// });

	//runs every Sunday at 8PM
	cron.schedule("0 20 * * 0", () => {
		logger.info("Running Kith Monday Program cron job");
		await mainKithMondayProgramNotifications();
		logger.info("Kith Monday Program drops are done");
	});
});
