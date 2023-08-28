require("dotenv").config();

const Discord = require("./discord");
const DiscordJS = require("discord.js");
const SNKRS = require("./snkrs");
const Supreme = require("./supreme");
const Utility = require("./utility");
const cron = require("node-cron");
const { GatewayIntentBits } = require("discord.js");

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
		const currentDate = Utility.getDate();
		const currentYear = Utility.getFullYear();
		const currentSeason = Utility.getCurrentSeason();

		const supremeDiscordTextChannelInfo = await supreme.parseSupremeDrop(
			currentDate,
			currentYear,
			currentSeason
		);

		console.log(supremeDiscordTextChannelInfo);

		const value = await discord.doesChannelExist(
			client,
			supremeDiscordTextChannelInfo.channelName
		);

		// channel not found
		if (!value) {
			const newChannel = await discord.createTextChannel(
				client,
				"test",
				supremeDiscordTextChannelInfo.channelName
			);
			discord.sendSupremeDropInfo(supremeDiscordTextChannelInfo, newChannel);
		}
	} catch (error) {
		console.error(error);
	}
}

client.on("ready", () => {
	console.log("Bot is ready");

	cron.schedule("* * * * *", () => {
		mainSupremeNotifications();
	});
});
