import { format, addDays } from "date-fns";

class Utility {
	constructor() {}

	/**
	 *
	 * @returns string
	 */
	static getDate(): string {
		return new Date().toISOString().slice(0, 10);
	}

	/**
	 * Returns in format YYYY
	 * @returns number
	 */
	static getFullYear(): number {
		return new Date().getFullYear();
	}

	/**
	 * Gets current season fall-winter or spring-summer
	 * @returns string
	 */
	static getCurrentSeason(): string {
		const todaysDate = new Date();
		const currentYear = todaysDate.getFullYear();
		if (todaysDate >= new Date(`${currentYear}-07-01`)) {
			return "fall-winter";
		} else {
			return "spring-summer";
		}
	}

	/**
	 * Gets the closest Thursday date in YYYY-MM-DD (including current day if today is Thursday)
	 * @returns string
	 */
	static getThursdayOfCurrentWeek(): string {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilThursday = (4 - currentDayOfWeek + 7) % 7; // Calculate how many days to Thursday, 0 if today is Thursday

		// Set the date to Thursday of the current week
		today.setDate(today.getDate() + daysUntilThursday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	/**
	 * Gets the closest Friday date in YYYY-MM-DD (including current day if today is Friday)
	 * @returns string
	 */
	static getFridayOfCurrentWeek(): string {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilFriday = (5 - currentDayOfWeek + 7) % 7; // Calculate how many days to Friday, 0 if today is Friday

		// Set the date to Friday of the current week
		today.setDate(today.getDate() + daysUntilFriday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	/**
	 * Returns string type of numbered version of month passed in
	 *
	 * @param {*} month
	 * @returns
	 */
	static convertMonthToNumber(month: string) {
		switch (month) {
			case "Jan":
				return "01";
			case "Feb":
				return "02";
			case "Mar":
				return "03";
			case "Apr":
				return "04";
			case "May":
				return "05";
			case "Jun":
				return "06";
			case "Jul":
				return "07";
			case "Aug":
				return "08";
			case "Sep":
				return "09";
			case "Oct":
				return "10";
			case "Nov":
				return "11";
			case "Dec":
				return "12";
		}
	}

	/**
	 * Returns tomorrows date in MM-DD format
	 *
	 * @returns
	 */
	static getTomorrowsDate() {
		const currentDate = new Date();

		// Calculate tomorrow's date
		const tomorrowDate = new Date(currentDate);
		tomorrowDate.setDate(currentDate.getDate() + 1);

		// Get the day and month components of tomorrow's date
		const day = tomorrowDate.getDate().toString().padStart(2, "0");
		const month = (tomorrowDate.getMonth() + 1).toString().padStart(2, "0");

		return `${month}-${day}`;
	}

	/**
	 * Returns closest Monday date in MMM-dd format (including current day if today is Monday)
	 *
	 * @returns
	 */
	static getUpcomingMonday(): string {
		const today = new Date();
		const daysUntilMonday = (8 - today.getDay()) % 7; // Calculate days until next Monday, 0 if today is Monday
		const nextMonday = addDays(today, daysUntilMonday);
		return format(nextMonday, "MMM-dd").toLowerCase(); // Format as "mmm-dd" and convert to lowercase
	}
}

export default Utility;
