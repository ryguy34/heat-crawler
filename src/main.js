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

		// channel is not found
		if (!value) {
			console.log(value);
			// discord create channel
			// const embedList = discord.makeSupremeEmbedList(
			// 	supremeDiscordTextChannelInfo
			// );
		}
	} catch (error) {
		console.error(error);
	}
}

client.on("ready", () => {
	console.log("Ready");
	mainSupremeNotifications();
});
