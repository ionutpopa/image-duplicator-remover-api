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
const dotenv_1 = require("dotenv");
require("@tensorflow/tfjs-node");
const multer_1 = __importDefault(require("multer"));
const processes_1 = require("./src/processes/processes");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.post("/upload", upload.array("images"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!((_a = req === null || req === void 0 ? void 0 : req.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.startsWith("multipart/form-data"))) {
        res.status(400).send("Incorrect content-type header");
        return;
    }
    if (((_b = req === null || req === void 0 ? void 0 : req.files) === null || _b === void 0 ? void 0 : _b.length) === 0) {
        res.status(400).send("No files uploaded.");
        return;
    }
    try {
        let stop = false;
        const buffers = (_c = req === null || req === void 0 ? void 0 : req.files) === null || _c === void 0 ? void 0 : _c.map((file) => file === null || file === void 0 ? void 0 : file.buffer);
        const probabilities = [];
        for (let i = 0; i < (buffers === null || buffers === void 0 ? void 0 : buffers.length); i++) {
            const image = buffers[i];
            const probabilitiesFromMobileNet = yield (0, processes_1.predictImage)(image);
            probabilities === null || probabilities === void 0 ? void 0 : probabilities.push(probabilitiesFromMobileNet);
            if (!stop) {
                stop = true;
            }
        }
        if (stop) {
            const combinedProbabilitiesAndBuffers = [];
            probabilities === null || probabilities === void 0 ? void 0 : probabilities.forEach((prediction, predictionIndex) => {
                buffers === null || buffers === void 0 ? void 0 : buffers.forEach((buffer, bufferIndex) => {
                    if (predictionIndex === bufferIndex) {
                        combinedProbabilitiesAndBuffers === null || combinedProbabilitiesAndBuffers === void 0 ? void 0 : combinedProbabilitiesAndBuffers.push({
                            prediction,
                            buffer,
                        });
                    }
                });
            });
            // We sort the array by the className
            const sortedCombinedProbabilitiesAndBuffers = combinedProbabilitiesAndBuffers === null || combinedProbabilitiesAndBuffers === void 0 ? void 0 : combinedProbabilitiesAndBuffers.sort((a, b) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (((_b = (_a = a === null || a === void 0 ? void 0 : a.prediction) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.className) < ((_d = (_c = b === null || b === void 0 ? void 0 : b.prediction) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.className)) {
                    return -1;
                }
                if (((_f = (_e = a === null || a === void 0 ? void 0 : a.prediction) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.className) > ((_h = (_g = b === null || b === void 0 ? void 0 : b.prediction) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.className)) {
                    return 1;
                }
                return 0;
            });
            const results = (0, processes_1.doMagicAIStuff)(sortedCombinedProbabilitiesAndBuffers);
            res.status(200).send(results);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error processing images" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
