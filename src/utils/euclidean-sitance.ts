/**
 * Calculates the euclidean distance between two arrays
 * @param a - The first array
 * @param b - The second array
 * @returns The euclidean distance between the two arrays
 */
const euclideanDistance = (a: number[], b: number[]) => {
    if (a.length !== b.length) {
        throw new Error('Both arrays must have the same length');
    }
    
    return Math.sqrt(
        a.reduce((acc, _, i) => acc + Math.pow(a[i] - b[i], 2), 0)
    );
}