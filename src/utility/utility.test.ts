import Utility from "./utility";

describe("Utility", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe("getDate", () => {
		it("returns frozen date when time is mocked to 2026-02-19T12:00:00Z", () => {
			// Thursday Feb 19, 2026
			jest.setSystemTime(new Date(2026, 1, 19, 12, 0, 0));
			expect(Utility.getDate()).toBe("2026-02-19");
		});

		it("handles year boundary with 2026-12-31T23:59:59Z", () => {
			// Thursday Dec 31, 2026 at noon (avoid UTC boundary issues)
			jest.setSystemTime(new Date(2026, 11, 31, 12, 0, 0));
			expect(Utility.getDate()).toBe("2026-12-31");
		});
	});

	describe("getFullYear", () => {
		it("returns mocked year 2026 when time is set to 2026-06-15T00:00:00Z", () => {
			// Monday Jun 15, 2026
			jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
			expect(Utility.getFullYear()).toBe(2026);
		});
	});

	describe("getCurrentSeason", () => {
		it("returns spring-summer before July 1 (2026-06-30T23:59:59Z)", () => {
			// Tuesday Jun 30, 2026 at noon (avoid UTC boundary issues)
			jest.setSystemTime(new Date(2026, 5, 30, 12, 0, 0));
			expect(Utility.getCurrentSeason()).toBe("spring-summer");
		});

		it("returns fall-winter on July 1 (2026-07-01T00:00:00Z)", () => {
			// Wednesday Jul 1, 2026
			jest.setSystemTime(new Date(2026, 6, 1, 0, 0, 0));
			expect(Utility.getCurrentSeason()).toBe("fall-winter");
		});

		it("returns fall-winter after July 1 (2026-11-15T00:00:00Z)", () => {
			// Sunday Nov 15, 2026
			jest.setSystemTime(new Date(2026, 10, 15, 12, 0, 0));
			expect(Utility.getCurrentSeason()).toBe("fall-winter");
		});
	});

	describe("getThursdayOfCurrentWeek", () => {
		it("returns same day when today is Thursday (2026-02-19)", () => {
			// Thursday Feb 19, 2026
			jest.setSystemTime(new Date(2026, 1, 19, 12, 0, 0));
			expect(Utility.getThursdayOfCurrentWeek()).toBe("2026-02-19");
		});

		it("returns upcoming Thursday when today is Monday (2026-02-16 → 2026-02-19)", () => {
			// Monday Feb 16, 2026
			jest.setSystemTime(new Date(2026, 1, 16, 12, 0, 0));
			expect(Utility.getThursdayOfCurrentWeek()).toBe("2026-02-19");
		});

		it("returns upcoming Thursday when today is Friday (2026-02-20 → 2026-02-26)", () => {
			// Friday Feb 20, 2026
			jest.setSystemTime(new Date(2026, 1, 20, 12, 0, 0));
			expect(Utility.getThursdayOfCurrentWeek()).toBe("2026-02-26");
		});
	});

	describe("getFridayOfCurrentWeek", () => {
		it("returns same day when today is Friday (2026-02-20)", () => {
			// Friday Feb 20, 2026
			jest.setSystemTime(new Date(2026, 1, 20, 12, 0, 0));
			expect(Utility.getFridayOfCurrentWeek()).toBe("2026-02-20");
		});

		it("returns upcoming Friday when today is Monday (2026-02-16 → 2026-02-20)", () => {
			// Monday Feb 16, 2026
			jest.setSystemTime(new Date(2026, 1, 16, 12, 0, 0));
			expect(Utility.getFridayOfCurrentWeek()).toBe("2026-02-20");
		});

		it("returns upcoming Friday when today is Saturday (2026-02-21 → 2026-02-27)", () => {
			// Saturday Feb 21, 2026
			jest.setSystemTime(new Date(2026, 1, 21, 12, 0, 0));
			expect(Utility.getFridayOfCurrentWeek()).toBe("2026-02-27");
		});
	});

	describe("convertMonthToNumber", () => {
		it("converts all 12 valid month abbreviations to 2-digit strings", () => {
			const monthMap: Record<string, string> = {
				Jan: "01",
				Feb: "02",
				Mar: "03",
				Apr: "04",
				May: "05",
				Jun: "06",
				Jul: "07",
				Aug: "08",
				Sep: "09",
				Oct: "10",
				Nov: "11",
				Dec: "12",
			};

			for (const [abbr, expected] of Object.entries(monthMap)) {
				expect(Utility.convertMonthToNumber(abbr)).toBe(expected);
			}
		});

		it('returns undefined for invalid input like "Foo"', () => {
			expect(Utility.convertMonthToNumber("Foo")).toBeUndefined();
		});
	});

	describe("getTomorrowsDate", () => {
		it("returns tomorrow's date in MM-DD format (2026-02-19 → 02-20)", () => {
			// Thursday Feb 19, 2026
			jest.setSystemTime(new Date(2026, 1, 19, 12, 0, 0));
			expect(Utility.getTomorrowsDate()).toBe("02-20");
		});

		it("handles month boundary (2026-02-28 → 03-01)", () => {
			// Saturday Feb 28, 2026
			jest.setSystemTime(new Date(2026, 1, 28, 12, 0, 0));
			expect(Utility.getTomorrowsDate()).toBe("03-01");
		});

		it("handles year boundary (2026-12-31 → 01-01)", () => {
			// Thursday Dec 31, 2026
			jest.setSystemTime(new Date(2026, 11, 31, 12, 0, 0));
			expect(Utility.getTomorrowsDate()).toBe("01-01");
		});
	});

	describe("getUpcomingMonday", () => {
		it("returns same day when today is Monday (2026-02-23 → feb-23-monday-program)", () => {
			// Monday Feb 23, 2026
			jest.setSystemTime(new Date(2026, 1, 23, 12, 0, 0));
			expect(Utility.getUpcomingMonday()).toBe("feb-23-monday-program");
		});

		it("returns upcoming Monday when today is Wednesday (2026-02-18 → feb-23-monday-program)", () => {
			// Wednesday Feb 18, 2026
			jest.setSystemTime(new Date(2026, 1, 18, 12, 0, 0));
			expect(Utility.getUpcomingMonday()).toBe("feb-23-monday-program");
		});

		it("returns upcoming Monday when today is Sunday (2026-02-22 → feb-23-monday-program)", () => {
			// Sunday Feb 22, 2026
			jest.setSystemTime(new Date(2026, 1, 22, 12, 0, 0));
			expect(Utility.getUpcomingMonday()).toBe("feb-23-monday-program");
		});
	});
});
