import fs from 'fs';
import math from 'mathjs';

type DataType = {
    filename: string;
    embedding: number[];
};

export const filterSimilarities = async () => {
    // Read the embeddings.json file
    const data = JSON.parse(fs.readFileSync('embeddings.json', 'utf-8')) as DataType[]

    const embeddings = data.map((item) => item.embedding);
    const filenames = data.map((item) => item.filename);

    // Create a new array to store the filtered embeddings
    const filteredEmbeddings = [];

    // Calculate pairwise cosine similarity
    for (let i = 0; i < embeddings.length; i++) {
        for (let j = i + 1; j < embeddings.length; j++) {
            const similarity = math.dot(embeddings[i], embeddings[j]) / ((math.norm(embeddings[i]) as number) * (math.norm(embeddings[j]) as number));

            console.log("similarity", similarity)

            // If the similarity is greater than 0.9, add it to the filtered embeddings
            if (similarity > 0.9) {
                filteredEmbeddings.push({
                    image1: filenames[i],
                    image2: filenames[j],
                    similarity,
                });
            }
        }
    }
};