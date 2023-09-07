require("dotenv").config();

const Discord = require("./discord");
const DiscordJS = require("discord.js");
const SNKRS = require("./snkrs");
const Supreme = require("./supreme");
const Utility = require("./utility");
const cron = require("node-cron");
const { GatewayIntentBits } = require("discord.js");
const constants = require("./constants");

const snkrs = new SNKRS();
const supreme = new Supreme();
const discord = new Discord();
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

		if (supremeDiscordTextChannelInfo) {
			//console.log(supremeDiscordTextChannelInfo);

			const value = await discord.doesChannelExistUnderCategory(
				client,
				supremeDiscordTextChannelInfo.channelName,
				constants.SUPREME_DROPS_CATEGORY_ID
			);
			// TODO: get correct category name here and pass as 2nd parameter
			if (!value) {
				const newChannel = await discord.createTextChannel(
					client,
					"SUPREME FALL/WINTER 2023",
					supremeDiscordTextChannelInfo.channelName
				);

				discord.sendSupremeDropInfo(
					supremeDiscordTextChannelInfo,
					newChannel
				);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

client.on("ready", () => {
	console.log("Bot is ready");

	//discord.getFullCategoryNameBySubstring(client, "SUPREME");

	//runs every Wednesday at 8PM
	cron.schedule("0 20 * * 3", () => {
		console.log("Running Supreme cron job");
		mainSupremeNotifications();
	});
});
