"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const tfNode = __importStar(require("@tensorflow/tfjs-node"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const formatLogs_1 = __importDefault(require("./src/utils/formatLogs"));
require("@tensorflow/tfjs-node");
const mobilenet_1 = require("@tensorflow-models/mobilenet");
const multer_1 = __importDefault(require("multer"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
// const upload = multer({ dest: "uploads/" });
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const loadModel = () => __awaiter(void 0, void 0, void 0, function* () {
    const model = yield (0, mobilenet_1.load)();
    return model;
});
const processImage = (buffer) => {
    const tensor = tfNode.node.decodeImage(buffer);
    const batchedTensor = tensor.expandDims();
    const processedTensor = batchedTensor
        .toFloat()
        .div(tfNode.scalar(127))
        .sub(tfNode.scalar(1));
    tensor.dispose(); // Clean up the intermediate tensor
    return processedTensor;
};
const predictImage = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = yield loadModel();
        const processedTensor = processImage(buffer);
        const predictions = yield model.classify(processedTensor);
        processedTensor.dispose(); // Clean up the processed tensor
        return predictions;
    }
    catch (error) {
        (0, formatLogs_1.default)("error", "Error while predicting: " + error);
        return null;
    }
});
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
        const predictions = [];
        for (let i = 0; i < (buffers === null || buffers === void 0 ? void 0 : buffers.length); i++) {
            const image = buffers[i];
            const predictionsFromMobileNet = yield predictImage(image);
            predictions === null || predictions === void 0 ? void 0 : predictions.push(predictionsFromMobileNet);
            if (!stop) {
                stop = true;
            }
        }
        if (stop) {
            res.status(200).json(predictions);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error processing images" });
    }
}));
// app.post("/predict", (req, res) => {
//   if (!model) {
//     formatLog("info", "Model is not loaded yet!");
//     res.status(500).send("Model is not loaded yet!");
//     return;
//   }
// if (!req?.headers["content-type"]?.startsWith("multipart/form-data")) {
//   res.status(400).send("Incorrect content-type header");
//   return;
// }
//   const bb = busboy({ headers: req.headers });
//   bb.on(
//     "file",
//     (
//       fieldname: any,
//       file: any,
//       filename: any,
//       encoding: any,
//       mimetype: any
//     ) => {
//       const buffer: any[] = [];
//       file.on("data", (data: any) => {
//         buffer.push(data);
//       });
//       file.on("end", async () => {
//         const image = decodeImage(Buffer.concat(buffer));
//         const predictions = await model?.detect((image as any), 3, 0.25);
//         res.json(predictions);
//       });
//     }
//   );
//   req.pipe(bb);
// });
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
