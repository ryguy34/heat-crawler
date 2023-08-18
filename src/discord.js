require("dotenv").config();
const { Client, GatewayIntentBits, messageLink } = require("discord.js");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

class Discord {
	constructor() {}

	sendNotification() {
		const embed = this.makeSupremeEmbed();
		this.hook.send(embed);
	}

	makeSupremeEmbedList(supremeDropInfo) {
		var embedList = [];
		supremeDropInfo.products.each((_, product) => {
			embedList.push(
				new MessageBuilder()
					.setTitle(product.productName)
					.setDescription("Oh look a description :)")
					.setTimestamp()
			);
		});

		return embedList;
	}

	createTextChannel() {
		return;
	}

	async doesChannelExist(name) {
		console.log("Searching for channel: " + name);

		return new Promise((resolve, reject) => {
			client.on("ready", () => {
				const discordServer = client.guilds.cache.get(process.env.SERVER_ID);

				const channelExists = discordServer.channels.cache.some((channel) => {
					return channel.name == name;
				});

				console.log("Channel exists!!!");
				resolve(channelExists);
			});

			client.on("error", (error) => {
				reject(error);
			});
		});
	}
}

module.exports = Discord;
