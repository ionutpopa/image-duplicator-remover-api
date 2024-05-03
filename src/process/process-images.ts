import fs from 'fs';
import { runPythonScript } from '../utils/runPythonScript';
import logger from '../utils/formatLogs';
import { filterSimilarities } from '../filter-similarities/filter-similarities';

export const processImages = async (images: Express.Multer.File[]) => {
    // Create a json file to store all the buffers
    const jsonFile = fs.createWriteStream('buffers.json');

    jsonFile.write('[');

    // Write the images to the json file
    images.forEach((image, index) => {
        jsonFile.write(JSON.stringify({
            filename: image.originalname,
            buffer: image.buffer?.toString('base64'),
        }));

        // Add a comma if it's not the last image
        if (index !== images.length - 1) {
            jsonFile.write(',');
        }
    });

    jsonFile.write(']');

    // Close the json file
    jsonFile.close(async () => {
        // Log that the json file has been closed
        logger('JSON file closed');
        
        // Run the python script
        const result = await runPythonScript('src/process/processor.py');

        console.log("result", result)

        if (result === 0) {
            logger('Python script exited successfully');

            // Filter the similarities from the embeddings.json file
            filterSimilarities();

            // Delete the json file
            fs.unlink('buffers.json', (error) => {
                if (error) {
                    logger(`Error deleting json file: ${error}`, 'error');
                } else {
                    logger('JSON file deleted');
                }
            });
        } else {
            logger('Python script exited with an error', 'error');
        }
    })
}