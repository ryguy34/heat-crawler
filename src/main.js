require("dotenv").config();

const Discord = require("./discord");
const DiscordJS = require("discord.js");
const SNKRS = require("./snkrs");
const Supreme = require("./supreme");
const Palace = require("./palace");
const Utility = require("./utility");
const cron = require("node-cron");
const { GatewayIntentBits } = require("discord.js");
const constants = require("./constants");

const snkrs = new SNKRS();
const supreme = new Supreme();
const discord = new Discord();
const palace = new Palace();
const client = new DiscordJS.Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.login(process.env.CLIENT_TOKEN);

/**
 * main function for Supreme notifications to Discord channel
 */
async function mainSupremeNotifications() {
	try {
		const currentWeekThursdayDate = Utility.getThursdayOfCurrentWeek(); // returns format: YYYY-MM-DD
		const currentYear = Utility.getFullYear(); // YYYY
		const currentSeason = Utility.getCurrentSeason();

		const supremeDiscordTextChannelInfo = await supreme.parseSupremeDrop(
			currentWeekThursdayDate,
			currentYear,
			currentSeason
		);

		//console.log(supremeDiscordTextChannelInfo);

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

					discord.sendDropInfo(
						supremeDiscordTextChannelInfo,
						newChannel,
						"Supreme"
					);
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
}

async function mainPalaceNotifications() {
	const currentWeekFridayDate = Utility.getFridayOfCurrentWeek(); // returns format: YYYY-MM-DD

	try {
		const palaceDiscordTextChannelInfo = await palace.parsePalaceDrop(
			currentWeekFridayDate
			//"2023-09-08"
		);

		console.log(palaceDiscordTextChannelInfo);

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

					discord.sendDropInfo(
						palaceDiscordTextChannelInfo,
						newChannel,
						"Palace"
					);
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
}

client.on("ready", () => {
	console.log("Bot is ready");

	//runs every Wednesday at 8PM
	cron.schedule("0 20 * * 3", () => {
		console.log("Running Supreme cron job");
		mainSupremeNotifications();
		console.log("Supreme drops are done");
	});

	//runs every Thursday at 8PM
	cron.schedule("0 20 * * 4", () => {
		console.log("Running Palace cron job");
		mainPalaceNotifications();
		console.log("Palace drops are done");
	});
});
