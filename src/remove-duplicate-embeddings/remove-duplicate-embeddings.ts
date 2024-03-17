export function removeDuplicates(
  embeddings: number[][],
  threshold: number
): number[][] {
  const similarIndices: Set<number> = new Set();

  for (let i = 0; i < embeddings.length; i++) {
    if (similarIndices.has(i)) {
      continue; // Skip if embedding already marked for removal
    }

    for (let j = i + 1; j < embeddings.length; j++) {
      if (similarIndices.has(j)) {
        continue; // Skip if embedding already marked for removal
      }

      // Calculate Euclidean distance between embeddings
      // @ts-ignore
      const distance = euclideanDistance(embeddings[i], embeddings[j]);
    
      // Check if distance is within tolerance (threshold)
      if (distance < 1 && distance <= threshold) {
        // Mark one of the embeddings for removal
        similarIndices.add(j);
      }
    }
  }

  // Filter out embeddings marked for removal
  const filteredEmbeddings = embeddings.filter(
    (embedding, index) => !similarIndices.has(index)
  );

  return filteredEmbeddings;
}

// Let's rebuild removeDuplicates to work with param embeddings: number[] instead of number[][]
// Function to remove duplicate embeddings based on a threshold
// export function removeDuplicates(
//   embeddings: number[],
//   threshold: number
// ): number[] {
//   const similarIndices: Set<number> = new Set();

//   for (let i = 0; i < embeddings.length; i++) {
//     if (similarIndices.has(i)) {
//       continue; // Skip if embedding already marked for removal
//     }

//     for (let j = i + 1; j < embeddings.length; j++) {
//       if (similarIndices.has(j)) {
//         continue; // Skip if embedding already marked for removal
//       }

//       // Calculate Euclidean distance between embeddings
//       // @ts-ignore
//       const distance = euclideanDistance(embeddings[i], embeddings[j]);
    
//       // Check if distance is within tolerance (threshold)
//       if (distance <= threshold) {
//         // Mark one of the embeddings for removal
//         similarIndices.add(j);
//         console.log('Threshold that decided to take down distance:', threshold);
//         console.log('Distance to remove:', distance);
//       }
//     }
//   }

//   // Filter out embeddings marked for removal
//   const filteredEmbeddings = embeddings.filter(
//     (embedding, index) => !similarIndices.has(index)
//   );

//   return filteredEmbeddings;
// }

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

// Let's rebuild euclideanDistance to work with param embeddings: number[] instead of number[][]
// Function to calculate Euclidean distance between two embeddings
// function euclideanDistance(embedding1: number[], embedding2: number[]): number {
//   if (embedding1.length !== embedding2.length) {
//     throw new Error('Embeddings must have the same dimensionality');
//   }

//   for (let i = 0; i < embedding1.length; i++) {
//     if (!isValidNumber(embedding1[i]) || !isValidNumber(embedding2[i])) {
//       throw new Error('Invalid value in embeddings');
//     }
//   }

//   let sum = 0;
//   for (let i = 0; i < embedding1.length; i++) {
//     sum += Math.pow(embedding1[i] - embedding2[i], 2);
//   }

//   return Math.sqrt(sum);
// }

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

// Let's rebuild chooseThreshold to work with param embeddings: number[] instead of number[][]
// Function to analyze distance distribution and choose threshold
// export function chooseThreshold(embeddings: number[]): number {
//   const distances: number[] = [];

//   // Calculate distances between all pairs of embeddings
//   for (let i = 0; i < embeddings.length; i++) {
//     for (let j = i + 1; j < embeddings.length; j++) {
//       // @ts-ignore
//       const distance = euclideanDistance(embeddings[i], embeddings[j]);
//       distances.push(distance);
//     }
//   }

//   // Check if distances array is empty
//   if (distances.length === 0) {
//     throw new Error("No distances found");
//   }

//   // Sort distances in ascending order
//   distances.sort((a, b) => a - b);

//   // Compute threshold based on statistical analysis
//   const median = distances[Math.floor(distances.length / 2)];
//   const stdDev = Math.sqrt(
//     distances.reduce((acc, val) => acc + Math.pow(val - median, 2), 0) /
//       distances.length
//   );

//   const threshold = median - stdDev;  // Adjust threshold to be more strict

//   return threshold;
// }