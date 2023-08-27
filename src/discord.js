require("dotenv").config();

const { Webhook, MessageBuilder } = require("discord-webhook-node");
const { ChannelType } = require("discord.js");

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

	async createTextChannel(client, channelName) {
		// TODO: change this to be the correct category name
		const categoryName = "test";

		const guild = client.guilds.cache.get(process.env.SERVER_ID);

		if (!guild) {
			return console.log(`Guild not found.`);
		}

		const category = guild.channels.cache.find((channel) => {
			return channel.name === categoryName && channel.type === 4;
		});

		if (!category) {
			return console.log(`Category "${categoryName}" not found.`);
		}

		//Create a new text channel in the specified category
		const newChannel = await guild.channels.create({
			name: channelName,
			type: ChannelType.GuildText,
			parent: category.id,
			reason: "Creating a new weekly release for Supreme",
		});

		console.log(
			`Channel "${newChannel.name}" created in category "${category.name}".`
		);
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
