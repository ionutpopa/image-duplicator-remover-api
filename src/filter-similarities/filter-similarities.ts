import fs from 'fs';
import logger from '../utils/formatLogs';
import { DataType, FilteredDataType } from '../types/data/data';
import { sortData } from '../sort/sort';

/**
 * Filter the similarities from the embeddings.json file and save the filtered embeddings to a new file called filteredEmbeddings.json
 * @returns A promise that resolves to an array of data
 */
export const filterSimilarities = async () => {
    // Read the embeddings.json file
    const data = await sortData();

    return new Promise<string[]>((resolve, reject) => {
        const embeddings = data.map((item) => item.embedding);
        const filenames = data.map((item) => item.filename);

        // Create a new array to store the filtered embeddings
        const filteredEmbeddings: FilteredDataType = [];

        // Calculate pairwise cosine similarity
        for (let i = 0; i < embeddings.length; i++) {
            for (let j = i + 1; j < embeddings.length; j++) {
                const firstVector = embeddings[i];
                const nextVector = embeddings[j];

                if (firstVector.length !== nextVector.length) {
                    throw new Error('The length of the vectors should be the same');
                }

                if (!firstVector.length) {
                    throw new Error('The vectors should not be empty');
                }

                if (!nextVector.length) {
                    throw new Error('The vectors should not be empty');
                }

                let dotProduct = 0;

                let firstVectorMagnitude = 0;
                let nextVectorMagnitude = 0;

                for (let k = 0; k < firstVector.length; k++) {
                    dotProduct += firstVector[k] * nextVector[k];
                    firstVectorMagnitude += firstVector[k] ** 2;
                    nextVectorMagnitude += nextVector[k] ** 2;
                }

                firstVectorMagnitude = Math.sqrt(firstVectorMagnitude) as number;
                nextVectorMagnitude = Math.sqrt(nextVectorMagnitude) as number;

                const similarity = dotProduct / (firstVectorMagnitude * nextVectorMagnitude);

                // If the similarity is greater than 0.9, add it to the filtered embeddings
                if (similarity > 0.9) {
                    filteredEmbeddings.push({
                        imageToRemoveName: filenames[j],
                        similarity,
                    });
                }
            }
        }

        if (filteredEmbeddings?.length) {
            logger('Filtered embeddings', 'info');
            const newEmbeddings = data.filter((item) => !filteredEmbeddings.some((filteredItem) => filteredItem.imageToRemoveName === item.filename)).map((item) => item.filename)
            resolve(newEmbeddings)
        } else {
            logger('No similar images found', 'error');
            reject([])
        }
    })
};