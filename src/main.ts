import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import cron from "node-cron";
import { Discord } from "./discord";
import { Supreme } from "./supreme";
import { Palace } from "./palace";
import { SNKRS } from "./snkrs";
import { Utility } from "./utility";
import logger from "./config/logger";
const constants = require("./constants");

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
				constants.SUPREME_DROPS_CATEGORY_ID
				//constants.TEST_CATEGORY_ID
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
				constants.PALACE_DROPS_CATEGORY_ID
				//constants.TEST_CATEGORY_ID
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
// 		await discord.deleteOldSnkrsReleases(client);
// 	} catch (error) {
// 		logger.error(error);
// 	}
// }

/**
 * When the script has connected to Discord successfully
 */
client.on("ready", async () => {
	logger.info("Bot is ready\n");

	//runs every Wednesday at 8PM
	// cron.schedule("0 20 * * 3", async () => {
	// 	logger.info("Running Supreme cron job");
	// 	await mainSupremeNotifications();
	// 	logger.info("Supreme drops are done");
	// });

	//runs every Thursday at 8PM
	//cron.schedule("0 20 * * 4", async () => {
	logger.info("Running Palace cron job");
	await mainPalaceNotifications();
	logger.info("Palace drops are done");
	//});

	//runs everyday at 8PM
	// cron.schedule("0 20 * * *", () => {
	// 	logger.info("Running SNKRS cron job");
	// 	await mainSnkrsNotifications();
	// 	logger.info("SNKRS drops are done");
	// });
});
