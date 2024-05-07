"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = {
    info: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
};
/**
 * Logs a message to the console
 * @param message - The message to log
 * @param level - The level of the log
 */
const logger = (message, level) => {
    const timestamp = new Date().toISOString();
    const color = (colors === null || colors === void 0 ? void 0 : colors[level || 'info']) || "\x1b[0m"; // Default to no color
    console.log(`[${timestamp}] ${color}[${(level || "info").toUpperCase()}]: ${message}\x1b[0m`);
};
exports.default = logger;
