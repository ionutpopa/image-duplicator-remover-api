import fs from 'fs';
import { spawn } from 'child_process'

export const processImages = async (images: Express.Multer.File[]) => {
    const pythonProcess = spawn('python3', ['./processor.py']);
    
    // Create a json file to store all the buffers
    const jsonFile = fs.createWriteStream('buffers.json');

    jsonFile.write('[');

    // Write the images to the json file
    images.forEach((image, index) => {
        jsonFile.write(JSON.stringify({
            filename: image.originalname,
            buffer: image.buffer,
        }));

        // Add a comma if it's not the last image
        if (index !== images.length - 1) {
            jsonFile.write(',');
        }
    });

    jsonFile.write(']');

    // Close the json file
    jsonFile.end();

    // Execute the python script
    pythonProcess.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);
    })

    pythonProcess.stderr.on('data', (data) => {
        // console.error(`stderr: ${data}`);
    })

    pythonProcess.on('close', (code) => {
        // console.log(`child process exited with code ${code}`);
    })
}