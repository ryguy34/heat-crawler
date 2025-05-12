import winston from "winston";

// Set log level based on NODE_ENV
const logLevel = process.env.NODE_ENV === "dev" ? "debug" : "info";

// Custom formatter to handle objects and arrays properly
const customFormat = winston.format.printf(
	({ level, message, timestamp, ...meta }) => {
		const formattedMessage =
			typeof message === "object"
				? JSON.stringify(message, null, 2)
				: message;

		const metaString = Object.keys(meta).length
			? JSON.stringify(meta, null, 2)
			: "";

		return `[${timestamp}] ${level}: ${formattedMessage} ${metaString}`;
	}
);

// Create the logger with a single consistent format
const logger = winston.createLogger({
	level: logLevel,
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		customFormat
	),
	transports: [new winston.transports.Console()],
});

export default logger;
