import kmeans from 'node-kmeans';

export const clusterIntoBatches = (embeddings: number[][], batchSize: number) => {
    return new Promise((resolve, reject) => {
        // Perform KMeans clustering
        kmeans.clusterize(embeddings, { k: Math.ceil(embeddings.length / batchSize) }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                // Extract clusters from the result
                if (!res) {
                    reject('No clusters found');
                } else {
                    console.log("embeddings", embeddings)
                    console.log("res",res)
                    const clusters = res.map(cluster => cluster.cluster.map((_, index) => embeddings[index]));
                    resolve(clusters);
                }
            }
        });
    });
};