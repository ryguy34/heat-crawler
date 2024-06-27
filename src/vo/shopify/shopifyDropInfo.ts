export class ShopifyDropInfo {
	productName: string;
	productInfoUrl: string;
	imageUrl: string;
	price: string;
	categoryUrl: string;

	constructor(
		productName: string,
		productInfoUrl: string,
		imageUrl: string,
		price: string,
		categoryUrl: string
	) {
		this.productName = productName;
		this.productInfoUrl = productInfoUrl;
		this.imageUrl = imageUrl;
		this.price = price;
		this.categoryUrl = categoryUrl;
	}
}
