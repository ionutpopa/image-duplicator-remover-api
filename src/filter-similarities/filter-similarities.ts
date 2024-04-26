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

    // Calculate pairwise distances between embeddings
    const distances = math.zeros(embeddings.length, embeddings.length);
    for (let i = 0; i < embeddings.length; i++) {
        for (let j = 0; j < embeddings.length; j++) {
            console.log("distances", distances)
        }
    }
};