// Step 1: Import dependencies
import express from 'express';
import multer from 'multer';
// import * as tf from '@tensorflow/tfjs';
import * as tfNode from "@tensorflow/tfjs-node";
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

// Step 2: Initialize Express app and configure Multer
const app = express();
const upload = multer({ dest: 'uploads/' });

// Step 3: Initialize TensorFlow.js
let mobilenetModel: mobilenet.MobileNet;
let classifier;

async function loadModels() {
  mobilenetModel = await mobilenet.load();
  classifier = await knnClassifier.create();
}

loadModels();

// Step 4: Define endpoint for processing images
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageBuffer = req.file.buffer;
    const img = tfNode.decodeImage(imageBuffer);

    // Generate embedding for the image
    const embeddings = await mobilenetModel.infer(img, 'conv_preds');

    // Compare embeddings and remove similar ones
    // Here you would implement your comparison algorithm
    // and remove similar embeddings

    // Send response with processed data
    res.status(200).json({ message: 'Image processed successfully' });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Step 5: Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});