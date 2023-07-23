import tf from "@tensorflow/tfjs";
import * as tfNode from "@tensorflow/tfjs-node";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import formatLog from "./src/utils/formatLogs";
import "@tensorflow/tfjs-node";
import { load } from "@tensorflow-models/mobilenet";
import fs from "fs";
import multer from "multer";

config();
const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());

// const upload = multer({ dest: "uploads/" });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const loadModel = async () => {
  const model = await load();
  return model;
};

const processImage = (buffer: Uint8Array) => {
  const tensor = tfNode.node.decodeImage(buffer);
  const batchedTensor = tensor.expandDims();
  const processedTensor = batchedTensor
    .toFloat()
    .div(tfNode.scalar(127))
    .sub(tfNode.scalar(1));
  tensor.dispose(); // Clean up the intermediate tensor
  return processedTensor;
};

const predictImage = async (buffer: Uint8Array) => {
  try {
    const model = await loadModel();
    const processedTensor = processImage(buffer);
    const predictions = await model.classify(processedTensor as any);

    processedTensor.dispose(); // Clean up the processed tensor
    return predictions;
  } catch (error) {
    formatLog("error", "Error while predicting: " + error);
    return null;
  }
};

app.post("/upload", upload.array("images"), async (req, res) => {
  if (!req?.headers["content-type"]?.startsWith("multipart/form-data")) {
    res.status(400).send("Incorrect content-type header");
    return;
  }

  if (req?.files?.length === 0) {
    res.status(400).send("No files uploaded.");
    return;
  }

  try {
    let stop = false;
    const buffers = (req?.files as any[])?.map((file) => file?.buffer);

    const predictions = [];
    for (let i = 0; i < buffers?.length; i++) {
      const image = buffers[i];
      const predictionsFromMobileNet = await predictImage(image);
      predictions?.push(predictionsFromMobileNet);

      if (!stop) {
        stop = true;
      }
    }

    if (stop) {
      res.status(200).json(predictions);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error processing images" });
  }
});

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
