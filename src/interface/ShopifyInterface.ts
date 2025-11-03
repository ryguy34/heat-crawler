export interface ShopifyChannelInfo {
	channelName: string;
	openingMessage: string;
	products: ShopifyProductInfo[];
}

export interface ShopifyProductInfo {
	productName: string;
	productInfoUrl: string;
	imageUrl: string;
	price: string;
	categoryUrl: string;
}
