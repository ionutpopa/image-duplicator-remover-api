import { MobileNet } from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs-node';

export async function generateEmbeddings(imageData: Buffer, model: MobileNet): Promise<number[]> {
    // Convert image data to TensorFlow.js tensor
    const imageTensor = tf.node.decodeImage(imageData);
    
    // Preprocess image
    const processedImage = tf.image.resizeBilinear(imageTensor, [224, 224])
                                    .toFloat()
                                    .div(255) // Normalize pixel values to [0, 1] range
                                    .expandDims(); // Add batch dimension
    
    // Perform inference to generate embeddings 
    // @ts-ignore - check what type infer wants
    const embeddingsTensor = model.infer(processedImage);
    
    // Convert embeddings tensor to JavaScript array
    const embeddingsArray = await embeddingsTensor.array() as number[];

    // Dispose of intermediate tensors
    // @ts-ignore - Type 'Tensor<Rank>' is not assignable to type 'TensorContainer'.
    tf.dispose([imageTensor, processedImage, embeddingsTensor]);

    return embeddingsArray;
}