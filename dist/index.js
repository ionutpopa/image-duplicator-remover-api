"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const formatLogs_1 = __importDefault(require("./src/utils/formatLogs"));
const multer_1 = __importDefault(require("multer"));
const process_images_1 = require("./src/process/process-images");
// global.REDIS_CLIENT = createClient({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   } as any)
// global.REDIS_CLIENT.connect()
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware for parsing multipart/form-data
const upload = (0, multer_1.default)();
// Enable CORS
app.use((0, cors_1.default)());
// Use JSON
app.use(express_1.default.json());
app.post('/image-processing', upload.array('images'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the images from the request
        const images = req.files;
        (0, process_images_1.processImages)(images);
        res.send({
            message: 'Images processed successfully',
        });
    }
    catch (error) {
        const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
        (0, formatLogs_1.default)(errorMessage, 'error');
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
