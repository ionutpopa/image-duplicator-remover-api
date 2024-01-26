import express from "express";
import cors from "cors";
import { config } from "dotenv";
import "@tensorflow/tfjs-node";
import multer from "multer";
import { doMagicAIStuff, predictImage } from "./src/processes/processes";
import { PredictionsTypes, ProbabilityTypes } from "./src/types/processes";

config();
const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    const buffers = (req?.files as any[])?.map((file) => file?.buffer);

    const probabilities = [];

    for (let i = 0; i < buffers?.length; i++) {
      const image = buffers[i];
      const probabilitiesFromMobileNet = await predictImage(image);
      probabilities?.push(probabilitiesFromMobileNet);
    }

    const combinedProbabilitiesAndBuffers: PredictionsTypes[] = [];

    probabilities?.forEach((prediction: ProbabilityTypes[] | null, predictionIndex) => {
      buffers?.forEach((buffer, bufferIndex) => {
        if (predictionIndex === bufferIndex) {
          combinedProbabilitiesAndBuffers?.push({
            prediction,
            buffer,
          });
        }
      });
    });

    // We sort the array by the className
    const sortedCombinedProbabilitiesAndBuffers = combinedProbabilitiesAndBuffers?.sort((a, b) => {
      if ((a?.prediction as ProbabilityTypes[])?.[0]?.className < (b?.prediction as ProbabilityTypes[])?.[0]?.className) {
        return -1;
      }
      if ((a?.prediction as ProbabilityTypes[])?.[0]?.className > (b?.prediction as ProbabilityTypes[])?.[0]?.className) {
        return 1;
      }
      return 0;
    });

    const results = doMagicAIStuff(sortedCombinedProbabilitiesAndBuffers);


    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error processing images" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
