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
const loadModel_1 = require("./src/utils/loadModel");
const processes_1 = require("./src/generate-embeddings/processes");
const formatLogs_1 = __importDefault(require("./src/utils/formatLogs"));
const multer_1 = __importDefault(require("multer"));
const remove_duplicate_embeddings_1 = require("./src/remove-duplicate-embeddings/remove-duplicate-embeddings");
const app = (0, express_1.default)();
const PORT = 3000; // Choose the port you want to run your server on
// Enable CORS
app.use((0, cors_1.default)());
// TODO in PRODUCTION: Make sure to add the origin in cors
// app.use(cors({
//     origin: 'http://your-react-app-domain.com',
//     // other options if needed
//   }));
// Middleware for parsing multipart/form-data
const upload = (0, multer_1.default)();
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
let imagesProcessed;
// Define the POST endpoint for image processing
app.post('/image-processing', upload.array('images'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        imagesProcessed = [];
        // Load Model
        const model = yield (0, loadModel_1.loadModel)();
        // Assuming the image data comes from a multiform with images. This variable will return Buffers
        const imageDataArray = (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => {
            return file === null || file === void 0 ? void 0 : file.buffer;
        });
        if ((imageDataArray === null || imageDataArray === void 0 ? void 0 : imageDataArray.length) === 1) {
            imagesProcessed = [imageDataArray[0]];
            return res.status(200).json({ message: "Images Processed" });
        }
        let imageBuffersAndEmbeddings = [];
        // Process each image
        const embeddings = yield Promise.all(imageDataArray === null || imageDataArray === void 0 ? void 0 : imageDataArray.map((imageData) => __awaiter(void 0, void 0, void 0, function* () {
            // Decode base64 image data
            const imageBuffer = Buffer.from(imageData, 'base64');
            // Pass image through the model to generate embeddings
            const embeddings = (0, processes_1.generateEmbeddings)(imageBuffer, model);
            imageBuffersAndEmbeddings.push({
                buffer: imageBuffer,
                embeddings: yield embeddings
            });
            // Return embeddings
            return embeddings;
        })));
        // Sort embeddings from lowest to highest
        embeddings.sort();
        const threshold = (0, remove_duplicate_embeddings_1.chooseThreshold)(embeddings); // Threshold for similarity
        const filteredEmbeddings = (0, remove_duplicate_embeddings_1.removeDuplicates)(embeddings, threshold);
        const newImages = filteredEmbeddings.map((embedding) => {
            var _a;
            // Here we search for the image with that embedding to return it to the client but idk if this comparation works
            // We are comparing Array of array to another Array of array
            return (_a = imageBuffersAndEmbeddings.find((image) => image.embeddings === embedding)) === null || _a === void 0 ? void 0 : _a.buffer;
        });
        if (newImages) {
            imagesProcessed = newImages;
            // console.log('We have images registered');
        }
        else {
            // console.log('No images found for the given embedding.');
        }
        // Send embeddings
        res.status(200).json({ message: "Images Processed" });
    }
    catch (error) {
        (0, formatLogs_1.default)('error', error);
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get('/display-images', (req, res) => {
    // Assuming imageData is the buffer containing the image data
    const imageDataArray = imagesProcessed; // Assuming you have the image buffer in req.files[0].data
    console.log("imagesProcessed", imagesProcessed.length);
    // Set the appropriate content type header for an image
    res.setHeader('Content-Type', 'application/json'); // Adjust the content type based on your image format
    // Send the image data buffer as the response
    res.send(JSON.stringify(imageDataArray));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
