require("dotenv").config();

const fs = require("fs");
const { ChannelType, EmbedBuilder } = require("discord.js");

class Discord {
	constructor() {}

	/**
	 * makes a list of embeds of supreme products
	 *
	 * @param {*} supremeDropInfo
	 * @param {*} channel
	 * @returns
	 */
	async sendSupremeDropInfo(supremeTextChannelInfo, channel) {
		let channelMessage = supremeTextChannelInfo.openingMessage.replace(
			"Supreme",
			"<@&834439456421314560>"
		);
		channel.send(channelMessage);

		for (const product of supremeTextChannelInfo.products) {
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(product.productName)
				.setURL(product.productInfoUrl)
				//TODO: need to get an image logo for bot
				.setThumbnail("attachment://image.png")
				.addFields(
					{ name: "Price", value: product.price },
					{
						name: " ",
						value: `[Supreme Category](${product.categoryUrl})`,
					}
				)
				.setImage(product.imageUrl)
				.setTimestamp()
				.setFooter({
					text: `Goodluck on ${supremeTextChannelInfo.channelName}'s drops!!!`,
					iconURL: "attachment://image.png",
				});

			const image = fs.readFileSync("./resources/image.png");

			await channel.send({
				embeds: [embed],
				files: [{ attachment: image, name: "image.png" }],
			});
		}
	}

	/**
	 * creates a new channel given the category and channel name
	 *
	 * @param {*} client
	 * @param {*} categoryName
	 * @param {*} channelName
	 * @returns
	 */
	async createTextChannel(client, categoryName, channelName) {
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

		return newChannel;
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
			const guild = client.guilds.cache.get(process.env.SERVER_ID);

			const channelExists = guild.channels.cache.some((channel) => {
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
