import express from 'express';
import cors from 'cors';
import logger from './src/utils/formatLogs';
import multer from 'multer';
import { processImages } from './src/process/process-images';
import { createClient } from 'redis';
import { Global } from './src/types/global/global';

declare let global: Global

// global.REDIS_CLIENT = createClient({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   } as any)

// global.REDIS_CLIENT.connect()

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing multipart/form-data
const upload = multer();

// Enable CORS
app.use(cors());

// Use JSON
app.use(express.json());

/**
 * Route to process the images
 * This route will process the images and store the embeddings remaining after filtering in a JSON file
 * The images that came from the request are multipart/form-data
 * @param {Express.Multer.File[]} images - The images to process
 */
app.post('/image-processing', upload.array('images'), async (req, res) => {
    try {
        // Get the images from the request
        const images = req.files as Express.Multer.File[];
    
        processImages(images);
            
        res.send({
            message: 'Images processed successfully',
        })
    } catch (error) {
        const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
        logger(errorMessage, 'error');
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});