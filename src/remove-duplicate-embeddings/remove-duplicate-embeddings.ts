

function isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
}

// Function to calculate Euclidean distance between two embeddings
function euclideanDistance(embedding1: number[][], embedding2: number[][]): number {
    if (embedding1.length !== embedding2.length) {
        throw new Error('Embeddings must have the same dimensionality');
    }

    for (let i = 0; i < embedding1.length; i++) {
        if (embedding1[i].length !== embedding2[i].length) {
            throw new Error('Embeddings must have the same dimensionality');
        }
        for (let j = 0; j < embedding1[i].length; j++) {
            if (!isValidNumber(embedding1[i][j]) || !isValidNumber(embedding2[i][j])) {
                throw new Error('Invalid value in embeddings');
            }
        }
    }

    let sum = 0;
    for (let i = 0; i < embedding1.length; i++) {
        for (let j = 0; j < embedding1[i].length; j++) {
            sum += Math.pow(embedding1[i][j] - embedding2[i][j], 2);
        }
    }

    return Math.sqrt(sum);
}

// Function to analyze distance distribution and choose threshold
export function chooseThreshold(embeddings: number[][]): number {
  const distances: number[] = [];

  // Calculate distances between all pairs of embeddings
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      // @ts-ignore
      const distance = euclideanDistance(embeddings[i], embeddings[j]);
      distances.push(distance);
    }
  }

  // Check if distances array is empty
  if (distances.length === 0) {
    throw new Error("No distances found");
  }

  // Sort distances in ascending order
  distances.sort((a, b) => a - b);

  // Compute threshold based on statistical analysis
  const median = distances[Math.floor(distances.length / 2)];
  const stdDev = Math.sqrt(
    distances.reduce((acc, val) => acc + Math.pow(val - median, 2), 0) /
      distances.length
  );

  const threshold = median - stdDev;  // Adjust threshold to be more strict

  return threshold;
}

// Remove similar embeddings
export const removeSimilarEmbeddings = (embeddings: string | any[], threshold: number) => {
  const uniqueEmbeddings = [];
  for (let i = 0; i < embeddings.length; i++) {
      let isSimilar = false;
      for (let j = 0; j < uniqueEmbeddings.length; j++) {
          const similarity = cosineSimilarity(embeddings[i], uniqueEmbeddings[j]);
          if (similarity > threshold) {
              isSimilar = true;
              break;
          }
      }
      if (!isSimilar) {
          uniqueEmbeddings.push(embeddings[i]);
      }
  }
  return uniqueEmbeddings;
}

// Calculate cosine similarity
const cosineSimilarity = (vec1: number[], vec2: number[]) => {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val ** 2, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val ** 2, 0));
  return dotProduct / (magnitude1 * magnitude2);
}