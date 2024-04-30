import express from 'express';
import cors from 'cors';
import { loadModel } from './src/utils/loadModel';
import { generateEmbeddings } from './src/generate-embeddings/processes';
import logger from './src/utils/formatLogs';
import multer from 'multer';
import { chooseThreshold, removeSimilarEmbeddings } from './src/remove-duplicate-embeddings/remove-duplicate-embeddings';
import { clusterIntoBatches } from './src/utils/kmeans';

const app = express();
const PORT = 3000; // Choose the port you want to run your server on

// Enable CORS
app.use(cors());

// TODO in PRODUCTION: Make sure to add the origin in cors
// app.use(cors({
//     origin: 'http://your-react-app-domain.com',
//     // other options if needed
//   }));

// Middleware for parsing multipart/form-data
const upload = multer();

// Middleware to parse JSON request bodies
app.use(express.json());

let imagesProcessed: any[];

// Define the POST endpoint for image processing
app.post('/image-processing', upload.array('images'), async (req, res) => {
    try {
        imagesProcessed = [];
        // Load Model
        const model = await loadModel()

        // Assuming the image data comes from a multiform with images. This variable will return Buffers
        const imageDataArray: string[] = (req.files as any[])?.map((file: { buffer: any; }) => {
            return file?.buffer
        })

        if (imageDataArray?.length === 1) {
            imagesProcessed = [imageDataArray[0]];
            return res.status(200).json({ message: "Images Processed" });
        }

        let imageBuffersAndEmbeddings: { buffer: Buffer; embeddings: number[]; }[] = []
        
        // Process each image
        const embeddings = await Promise.all(imageDataArray?.map(async (imageData: string) => {
            // Decode base64 image data
            const imageBuffer = Buffer.from(imageData, 'base64');

            // Pass image through the model to generate embeddings
            const embeddings = generateEmbeddings(imageBuffer, model);

            imageBuffersAndEmbeddings.push({
                buffer: imageBuffer,
                embeddings: await embeddings
            })
            
            // Return embeddings
            return embeddings;
        }));

        logger('info', `Embeddings: ${embeddings.length}`);
        logger('info', `Embeddings dimensionality: ${embeddings[0].length}`);

        const batchSize = 2;
        logger('info', `Batch size: ${batchSize}`);

        const threshold = chooseThreshold(embeddings); // Threshold for similarity
        console.log('Threshold:', threshold);
        const filteredEmbeddings = removeSimilarEmbeddings(embeddings, threshold);

        console.log(filteredEmbeddings)

        // const newImages = filteredEmbeddings.map((embedding) => {
        //     // Here we search for the image with that embedding to return it to the client but idk if this comparation works
        //     // We are comparing Array of array to another Array of array
        //     return imageBuffersAndEmbeddings.find((image) => image.embeddings === embedding)?.buffer
        // })

        // if (newImages) {
        //     imagesProcessed = newImages;
        //     // console.log('We have images registered');
        // } else {
        //     // console.log('No images found for the given embedding.');
        // }

        // Send embeddings
        res.status(200).json({ message: "Images Processed" });
    } catch (error) {
        logger('error', error as string)
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// app.get('/display-images', (req, res) => {
//     // Assuming imageData is the buffer containing the image data
//     const imageDataArray = imagesProcessed; // Assuming you have the image buffer in req.files[0].data
//     console.log("imagesProcessed", imagesProcessed.length)
//     // Set the appropriate content type header for an image
//     res.setHeader('Content-Type', 'application/json'); // Adjust the content type based on your image format

//     // Send the image data buffer as the response
//     res.send(JSON.stringify(imageDataArray));
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});