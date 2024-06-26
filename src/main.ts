import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import * as cron from "node-cron";

import { Discord } from "./discord";
import { Supreme } from "./supreme";
import { Palace } from "./palace";
import { Utility } from "./utility";
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

client.login(process.env.CLIENT_TOKEN);

/**
 * main function for supreme notifications to Discord channel
 */
async function mainSupremeNotifications() {
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
		console.error(error);
	}
}

/**
 * main function for palace notifications to Discord channel
 */
async function mainPalaceNotifications() {
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
		console.error(error);
	}
}

// async function mainSnkrsNotifications() {
// 	var tomorrowsDate = Utility.getTomorrowsDate();
// 	var snkrsDrops = [];

// 	try {
// 		snkrsDrops = await snkrs.parseSnkrsDropInfo(tomorrowsDate);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

/**
 * When the script has connected to Discord successfully
 */
client.on("ready", async () => {
	console.log("Bot is ready");

	//runs every Wednesday at 8PM
	cron.schedule("0 20 * * 3", async () => {
		console.log("Running Supreme cron job");
		await mainSupremeNotifications();
		console.log("Supreme drops are done");
	});

	//runs every Thursday at 8PM
	cron.schedule("0 20 * * 4", async () => {
		console.log("Running Palace cron job");
		await mainPalaceNotifications();
		console.log("Palace drops are done");
	});

	//runs everyday at 8PM
	// cron.schedule("0 20 * * *", () => {
	// console.log("Running SNKRS cron job");
	// await mainSnkrsNotifications();
	// console.log("SNKRS drops are done");
	// });
});
