import {
	Client,
	ChannelType,
	EmbedBuilder,
	TextChannel,
	GuildBasedChannel,
} from "discord.js";
import "dotenv/config";
import fs from "fs";
import { ShopifyChannelInfo } from "../interface/ShopifyInterface";
import { SnkrsDropInfo } from "../interface/SnkrsInterface";
import logger from "../utility/logger";

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
			const productId = product.productInfoUrl.split("/").slice(-2)[0];
			const screenshotPath = `./screenshots/${siteName}/screenshot_${productId}.png`;

			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(product.productName)
				.setURL(product.productInfoUrl)
				.setThumbnail("attachment://logo.png")
				.addFields(
					...(product.price && product.price !== "???"
						? [{ name: "Price", value: product.price }]
						: []),
					{
						name: " ",
						value: `[${siteName} Category](${product.categoryUrl})`,
					}
				)
				.setImage("attachment://screenshot.png")
				.setTimestamp()
				.setFooter({
					text: `Good luck on ${textChannelInfo.channelName}'s drops!!!`,
					iconURL: "attachment://logo.png",
				});

			const logoImage = fs.readFileSync("./resources/logo.png");
			const files = [{ attachment: logoImage, name: "logo.png" }];

			// Add screenshot if it exists
			if (fs.existsSync(screenshotPath)) {
				const screenshotImage = fs.readFileSync(screenshotPath);
				files.push({ attachment: screenshotImage, name: "screenshot.png" });
			}

			await channel.send({
				embeds: [embed],
				files: files,
			});
		}

		// After sending all product messages, clear screenshots directory
		try {
			const screenshotsDir = `./screenshots/${siteName}`;
			if (fs.existsSync(screenshotsDir)) {
				const filesInDir = fs.readdirSync(screenshotsDir);
				for (const file of filesInDir) {
					const filePath = `${screenshotsDir}/${file}`;
					try {
						fs.unlinkSync(filePath);
					} catch (e) {
						logger.error(`Failed to delete screenshot ${filePath}: ${e}`);
					}
				}
			}
		} catch (err) {
			logger.error(`Failed to clear screenshots directory: ${err}`);
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
				{ name: "Release Time", value: snkrsChannelInfo.releaseTime }
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
	 * makes a list of embeds for the upcoming products and sends them to the channel
	 *
	 * @param {*} kithMondayProgramProductList
	 * @param {*} channel
	 * @returns
	 */
	async sendKithInfo(
		kithMondayProgramProductList: {
			productName: string;
			imageUrl: string;
			productPrice: string;
			productUrl: string;
			variantCartUrlList: { size: string; id: string }[];
		}[],
		channel: TextChannel
	): Promise<void> {
		channel.send(
			"<@&834439628295241758> Kith Monday Program drops are live at 10AM CST! Make sure to post W's in <#679913101269008483>"
		);
		var embeds = [];
		logger.debug(kithMondayProgramProductList);
		for (const product of kithMondayProgramProductList) {
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(product.productName)
				.setURL(product.productUrl)
				.setThumbnail("attachment://logo.png")
				.addFields(
					{ name: "Price", value: product.productPrice },
					{ name: "Auto Cart Links", value: "" },
					...(product.variantCartUrlList
						?.filter((variant) => {
							const sizeNum = Number(variant.size);
							return isNaN(sizeNum) || (sizeNum >= 5 && sizeNum <= 13);
						})
						.map((variant) => ({
							name: "",
							value: `[${variant.size}](https://kith.com/cart/${variant.id}:1)`,
						})) || [])
				)
				.setImage(product.imageUrl)
				.setTimestamp()
				.setFooter({
					text: `Good luck on the Kith drops!!!`,
					iconURL: "attachment://logo.png",
				});
			embeds.push(embed);
		}

		const image = fs.readFileSync("./resources/logo.png");

		// Discord only allows up to 10 embeds per message
		for (let i = 0; i < embeds.length; i += 10) {
			const embedsChunk = embeds.slice(i, i + 10);
			await channel.send({
				embeds: embedsChunk,
				files: [{ attachment: image, name: "logo.png" }],
			});
		}
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

	// async sortSnkrsDrops(client: Client) {
	// 	const guild = await client.guilds.fetch(process.env.SERVER_ID!);

	// 	try {
	// 		// Fetch all channels in the guild
	// 		const channels = guild.channels.cache;

	// 		// Filter channels under the specified category and sort them by position
	// 		const sortedChannels = channels
	// 			.filter(
	// 				(channel): channel is TextChannel =>
	// 					channel.parentId === constants.SNKRS.CATEGORY_ID &&
	// 					channel.isTextBased()
	// 			)
	// 			.sort((a, b) => a.name.localeCompare(b.name));

	// 		// sortedChannels.forEach((channel, index) => {
	// 		// 	const newPosition = +index + 1; // Calculate the new position
	// 		// 	channel
	// 		// 		.setPosition(newPosition) // Ensure newPosition is a number
	// 		// 		.then((updatedChannel) => {
	// 		// 			console.log(
	// 		// 				`Moved ${updatedChannel.name} to position ${newPosition}`
	// 		// 			);
	// 		// 		});
	// 		// });

	// 		for (let i = 0; i < sortedChannels.size; i++) {
	// 			const newPosition = i + 1; // Calculate the new position
	// 			//var channel = sortedChannels[i];
	// 			sortedChannels!.at(i)!.setPosition(newPosition); // Ensure newPosition is a number
	// 		}
	// 	} catch (error) {
	// 		console.error("Error sorting channels:", error);
	// 	}
	// }

	// isReleaseInPast(name: string): boolean {
	// 	const parts = name.split("/");

	// 	// Extract the month and day parts
	// 	const monthStr = parts[0];
	// 	const dayStr = parts[1];

	// 	// Get the current date
	// 	const currentDate = new Date();

	// 	// Create a new Date object for the provided month and day (default to current year)
	// 	const providedDate = new Date(
	// 		currentDate.getFullYear(),
	// 		parseInt(monthStr) - 1,
	// 		parseInt(dayStr)
	// 	);

	// 	// Compare the provided date with the current date
	// 	return providedDate < currentDate;
	// }

	// async deleteOldSnkrsReleases(client: Client) {
	// 	try {
	// 		const guild = await client.guilds.fetch(process.env.SERVER_ID!);
	// 		const channels = guild.channels.cache;
	// 		const oldChannelsToDelete = channels.filter(
	// 			(channel): channel is TextChannel =>
	// 				channel.parentId === constants.TEST.TEST_CATEGORY_ID &&
	// 				channel.isTextBased() &&
	// 				this.isReleaseInPast(channel.name)
	// 		);

	// 		oldChannelsToDelete.forEach(async (channel) => {
	// 			const fetchedChannel = guild.channels.cache.get(channel.id);
	// 			await fetchedChannel!.delete();
	// 		});
	// 	} catch (error) {
	// 		console.error("Error deleting channels:", error);
	// 	}
	//}
}
