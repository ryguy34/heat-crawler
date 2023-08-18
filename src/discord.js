require("dotenv").config();
const { Client, GatewayIntentBits, messageLink } = require("discord.js");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const SnkrsDropInfo = require("./vo/snkrsDropInfo");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

class Discord {
	constructor() {
		this.hook = new Webhook(process.env.CHANNEL_URL);
		// client.on("ready", () => {
		// 	console.log(`Logged in as ${client.user.tag}!`);
		// });

		client.login(process.env.CLIENT_TOKEN);
	}

	sendNotification(snkrsDropInfo) {
		if (this.doesChannelExist("channelName")) {
			const embed = this.makeEmbed(snkrsDropInfo);
			this.hook.send(embed);
		}
	}

	makeEmbed(snkrsDropInfo) {
		return new MessageBuilder()
			.setTitle("Title")
			.setDescription("Oh look a description :)")
			.setTimestamp();
	}

	createTextChannel() {
		return;
	}

	async doesChannelExist(channelName) {
		console.log("Searched for channel: " + channelName);
		var exists = false;
		var channelNames = [];
		await client.on("ready", () => {
			const discordServer = client.guilds.cache.get(process.env.SERVER_ID);
			channelNames = discordServer.channels.cache.map((channel) => {
				console.log(channel.name);
				if (channel.name === channelName) {
					channel.name;
				}
			});

			// console.log(channelNames);

			// //exists = channelNames.includes(channelName);
			// exists = Array.isArray(channelName);
			// console.log("asasasa: " + exists);
		});

		console.log(channelNames);

		return true;
	}
}

module.exports = Discord;
