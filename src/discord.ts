import {
	Client,
	ChannelType,
	EmbedBuilder,
	TextChannel,
	GuildBasedChannel,
	Collection,
} from "discord.js";
import "dotenv/config";
import fs from "fs";
import { ShopifyChannelInfo } from "./vo/shopify/shopifyChannelInfo";
import { SnkrsDropInfo } from "./vo/snkrs/snkrsDropInfo";
import logger from "./config/logger";
const constants = require("./constants");

export class Discord {
	constructor() {}

	/**
	 * makes a list of embeds for the upcoming products
	 *
	 * @param {*} textChannelInfo
	 * @param {*} channel
	 * @param {*} siteName
	 * @returns
	 */
	async sendDropInfo(
		textChannelInfo: ShopifyChannelInfo,
		channel: TextChannel,
		siteName: string
	): Promise<void> {
		let channelMessage = "";
		if (siteName === "Supreme") {
			channelMessage = textChannelInfo.openingMessage.replace(
				"Supreme",
				"<@&834439456421314560> Make sure to post W's in <#679913101269008483>"
			);
		} else if (siteName === "Palace") {
			channelMessage =
				textChannelInfo.openingMessage +
				" <@&834439872499417088>  Make sure to post W's in <#679913101269008483>";
		} else {
			logger.error("Uncaught site name");
		}

		channel.send(channelMessage);

		for (const product of textChannelInfo.products) {
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(product.productName)
				.setURL(product.productInfoUrl)
				.setThumbnail("attachment://logo.png")
				.addFields(
					{ name: "Price", value: product.price },
					{
						name: " ",
						value: `[${siteName} Category](${product.categoryUrl})`,
					}
				)
				.setImage(product.imageUrl)
				.setTimestamp()
				.setFooter({
					text: `Good luck on ${textChannelInfo.channelName}'s drops!!!`,
					iconURL: "attachment://logo.png",
				});

			const image = fs.readFileSync("./resources/logo.png");

			await channel.send({
				embeds: [embed],
				files: [{ attachment: image, name: "logo.png" }],
			});
		}
	}

	/**
	 * makes a list of embeds for the upcoming products
	 *
	 * @param {*} snkrsChannelInfo
	 * @param {*} channel
	 * @returns
	 */
	async sendSnkrsDropInfo(
		snkrsChannelInfo: SnkrsDropInfo,
		channel: TextChannel
	): Promise<void> {
		channel.send(
			"<@&834440275908755566> Make sure to post W's in <#679913101269008483>"
		);
		var embed;
		embed = new EmbedBuilder()
			.setColor(0xcc0000)
			.setTitle(snkrsChannelInfo.title)
			.setURL(snkrsChannelInfo.link)
			.setDescription(snkrsChannelInfo.description)
			.setThumbnail("attachment://logo.png")
			.addFields(
				{ name: "Price", value: snkrsChannelInfo.price },
				{ name: "Release Date", value: snkrsChannelInfo.releaseDate },
				{ name: "Release Time", value: snkrsChannelInfo.releaseTime },
				{
					name: "Resale",
					value: `[StockX](https://stockx.com/search?s=${snkrsChannelInfo.sku})`,
				}
			)
			.setTimestamp()
			.setFooter({
				text: `Good luck on the upcoming SNKRS drops!!!`,
				iconURL: "attachment://logo.png",
			});

		var embeds = [];
		embeds.push(embed);
		for (const image of snkrsChannelInfo.imageUrls) {
			var imageEmbed = new EmbedBuilder()
				.setURL(snkrsChannelInfo.link)
				.setImage(image);

			embeds.push(imageEmbed);
		}

		const image = fs.readFileSync("./resources/logo.png");

		await channel.send({
			embeds: embeds,
			files: [{ attachment: image, name: "logo.png" }],
		});
	}

	/**
	 * creates a new channel given the category and channel name
	 *
	 * @param {*} client
	 * @param {*} category
	 * @param {*} channelName
	 * @returns
	 */
	async createTextChannel(
		client: Client,
		category: GuildBasedChannel,
		channelName: string
	) {
		const guild = client.guilds.cache.get(process.env.SERVER_ID!);

		if (!guild) {
			logger.error(`Guild not found.`);
			return;
		}

		//Create a new text channel in the specified category
		const newChannel = await guild.channels.create({
			name: channelName,
			type: ChannelType.GuildText,
			parent: category.id,
			reason: `Creating a new weekly release ${channelName} under ${category.name}`,
		});

		logger.info(
			`Channel "${newChannel.name}" created in category "${category.name}".`
		);

		return newChannel!;
	}

	/**
	 * returns a boolean of whether or not the channel exists under the given category
	 *
	 * @param {*} client
	 * @param {*} channelName
	 * @param {*} categoryId
	 * @returns
	 */
	async doesChannelExistUnderCategory(
		client: Client,
		channelName: string,
		categoryId: string
	): Promise<GuildBasedChannel> {
		logger.info(`Searching for channel: ${channelName}`);

		return new Promise((resolve) => {
			const guild = client.guilds.cache.get(process.env.SERVER_ID!);

			const channelExists = guild?.channels.cache.find((channel) => {
				return (
					channel.name === channelName && channel.parentId === categoryId
				);
			});

			if (channelExists) {
				logger.warn(
					`Channel ${channelName} exists under categoryId ${categoryId}`
				);
			} else {
				logger.info(
					`Channel ${channelName} doesn't exist under categoryId ${categoryId}`
				);
			}

			resolve(channelExists!);
		});
	}

	/**
	 * returns full category by its substring
	 *
	 * @param {*} client
	 * @param {*} partialCategoryName
	 * @returns
	 */
	async getFullCategoryNameBySubstring(
		client: Client,
		partialCategoryName: string
	) {
		const guild = client.guilds.cache.get(process.env.SERVER_ID!);

		const category = guild?.channels.cache.find(
			(channel) =>
				channel.type === 4 && channel.name.includes(partialCategoryName)
		);

		if (category) {
			logger.info(`Category name ${category.name}`);
		} else {
			logger.error(`Category name not found for ${partialCategoryName}`);
			return;
		}

		return category;
	}

	async cleanUpOldReleasesByMonthAndDay(
		client: Client,
		dateToday: Date,
		categoryId: string
	): Promise<void> {
		const guild = client.guilds.cache.get(process.env.SERVER_ID!);
		const monthDayToday = dateToday.getMonth() * 100 + dateToday.getDate();

		const releaseList = guild!.channels.cache.filter((channel) => {
			return channel.parentId === categoryId;
		});

		const oldReleasesList = releaseList.filter((channel) => {
			const channelDateList = channel.name.split("-");
			const channelDate = new Date(
				`${dateToday.getFullYear()}-${channelDateList[0]}-${
					channelDateList[1]
				}`
			);
			const monthDayChannelDay =
				(channelDate.getMonth() + 1) * 100 + channelDate.getDate();

			return monthDayToday > monthDayChannelDay;
		});

		oldReleasesList.map(async (oldChannel) => {
			try {
				const channelToRemove = await guild!.channels.fetch(oldChannel.id);
				if (channelToRemove) {
					await channelToRemove.delete();
					console.log(
						`Channel ${channelToRemove.name} has been successfully removed.`
					);
				} else {
					console.log(`Channel with ID ${oldChannel.id} not found.`);
				}
			} catch (error) {
				console.error("Error deleting channel(s):", error);
			}
		});

		console.log("Done deleting old releases");
	}

	async sortSnkrsDrops(client: Client) {
		const guild = await client.guilds.fetch(process.env.SERVER_ID!);

		try {
			// Fetch all channels in the guild
			const channels = guild.channels.cache;

			// Filter channels under the specified category and sort them by position
			const sortedChannels = channels
				.filter(
					(channel): channel is TextChannel =>
						channel.parentId === constants.SNKRS.CATEGORY_ID &&
						channel.isTextBased()
				)
				.sort((a, b) => a.name.localeCompare(b.name));

			// sortedChannels.forEach((channel, index) => {
			// 	const newPosition = +index + 1; // Calculate the new position
			// 	channel
			// 		.setPosition(newPosition) // Ensure newPosition is a number
			// 		.then((updatedChannel) => {
			// 			console.log(
			// 				`Moved ${updatedChannel.name} to position ${newPosition}`
			// 			);
			// 		});
			// });

			for (let i = 0; i < sortedChannels.size; i++) {
				const newPosition = i + 1; // Calculate the new position
				//var channel = sortedChannels[i];
				sortedChannels!.at(i)!.setPosition(newPosition); // Ensure newPosition is a number
			}
		} catch (error) {
			console.error("Error sorting channels:", error);
		}
	}
}
