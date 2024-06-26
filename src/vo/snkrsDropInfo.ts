export class SnkrsDropInfo {
	channelName: string;
	title: string;
	imageUrl: string;

	constructor(title: string, imageUrl: string, channelName: string) {
		this.channelName = channelName;
		this.title = title;
		this.imageUrl = imageUrl;
	}
}
