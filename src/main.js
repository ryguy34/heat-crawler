const Discord = require("./discord");
const SNKRS = require("./snkrs");
const Supreme = require("./supreme");
const Utility = require("./utility");
const cron = require("node-cron");

const snkrs = new SNKRS();
const supreme = new Supreme();
const discord = new Discord();

async function mainSupremeNotifications() {
	try {
		const currentDate = Utility.getDate();
		const currentYear = Utility.getFullYear();
		const currentSeason = Utility.getCurrentSeason();

		console.log(currentDate);
		console.log(currentYear);
		console.log(currentSeason);

		const supremeDiscordTextChannelInfo = await supreme.parseSupremeDrop(
			currentDate,
			currentYear,
			currentSeason
		);

		console.log(supremeDiscordTextChannelInfo);
		const value = await discord.doesChannelExist(
			supremeDiscordTextChannelInfo.channelName
		);

		if (!value) {
			// discord create channel
			// const embedList = discord.makeSupremeEmbedList(
			// 	supremeDiscordTextChannelInfo
			// );
		}
	} catch (error) {
		console.error(error);
	}
}

mainSupremeNotifications();
