const euclideanDistance = (a: number[], b: number[]) => {
    if (a.length !== b.length) {
        throw new Error('Both arrays must have the same length');
    }
    
    return Math.sqrt(
        a.reduce((acc, _, i) => acc + Math.pow(a[i] - b[i], 2), 0)
    );
}