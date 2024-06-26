export class TextChannelInfo {
	channelName: string;
	openingMessage: string;
	products: any[];

	constructor(channelName: string, openingMessage: string) {
		this.channelName = channelName;
		this.openingMessage = openingMessage;
		this.products = [];
	}
}
