export class SnkrsDropInfo {
	channelName: string;
	title: string;
	imageUrls: string[];
	price: string;
	model: string;
	name: string;
	releaseDate: string;
	releaseTime: string;
	description: string;
	sku: string;
	link: string;

	constructor(
		channelName: string,
		title: string,
		imageUrls: string[],
		price: string,
		model: string,
		name: string,
		releaseDate: string,
		releaseTime: string,
		description: string,
		sku: string,
		link: string
	) {
		this.channelName = channelName;
		this.title = title;
		this.imageUrls = imageUrls;
		this.price = price;
		this.model = model;
		this.name = name;
		this.releaseDate = releaseDate;
		this.releaseTime = releaseTime;
		this.description = description;
		this.sku = sku;
		this.link = link;
	}
}
