"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = {
    info: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m", // Red
};
const logger = (level, message) => {
    const timestamp = new Date().toISOString();
    const color = (colors === null || colors === void 0 ? void 0 : colors[level]) || "\x1b[0m"; // Default to no color
    console.log(`[${timestamp}] ${color}[${level.toUpperCase()}]: ${message}\x1b[0m`);
};
exports.default = logger;
