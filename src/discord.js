require("dotenv").config();

const { Webhook, MessageBuilder } = require("discord-webhook-node");

class Discord {
	constructor() {}

	sendNotification() {
		const embed = this.makeSupremeEmbed();
		this.hook.send(embed);
	}

	/**
	 * makes a list of embeds of supreme products
	 *
	 * @param {*} supremeDropInfo
	 * @returns
	 */
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

	/**
	 * returns a boolean of whether or not the channel exists
	 *
	 * @param {*} client
	 * @param {*} name
	 * @returns
	 */
	async doesChannelExist(client, name) {
		console.log("Searching for channel: " + name);

		return new Promise((resolve) => {
			const discordServer = client.guilds.cache.get(process.env.SERVER_ID);

			const channelExists = discordServer.channels.cache.some((channel) => {
				return channel.name == name;
			});

			if (channelExists) {
				console.log("Channel " + name + " exists");
			} else {
				console.log("Channel " + name + " doesn't exist");
			}
			resolve(channelExists);
		});
	}
}

module.exports = Discord;
