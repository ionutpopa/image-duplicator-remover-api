import { load } from "@tensorflow-models/mobilenet";
import * as tfNode from "@tensorflow/tfjs-node";
import formatLog from "../utils/formatLogs";
import { PredictionsTypes, ProbabilityTypes } from "../types/processes";
import { areNumbersAlmostSame } from "../utils/utilities";

/**
 * Loads the model from the tensorflow hub
 * @returns {Promise<MobileNet>}
 */
export const loadModel = async () => {
    const model = await load();
    return model;
};

/**
 * Process the image buffer
 * @param buffer {Uint8Array}
 * @returns {tfNode.Tensor<tfNode.Rank>}
 */
export const processImage = (buffer: Uint8Array): tfNode.Tensor<tfNode.Rank> => {
    const tensor = tfNode.node.decodeImage(buffer);
    const batchedTensor = tensor.expandDims(0);
    const processedTensor = batchedTensor
        .toFloat() // The next line was 127 before 64
        .div(tfNode.scalar(1))
        // It was 1 beofre 5
        .sub(tfNode.scalar(5));

    tensor.dispose(); // Clean up the intermediate tensor

    formatLog("info", "Image processed");

    // Adjust birghtness on processedTensor
    const adjustedBrightnessTensor = tfNode.mul(processedTensor, tfNode.scalar(1.2));
    // Adjust contrast on processedTensor
    // const adjustedContrastTensor = tfNode.mul(adjustedBrightnessTensor, tfNode.scalar(1.5));
    // // Adjust saturation on processedTensor
    // const adjustedSaturationTensor = tfNode.mul(adjustedContrastTensor, tfNode.scalar(1.5));


    return adjustedBrightnessTensor;
};

/**
 * 
 * @param buffer {Uint8Array}
 * @returns {Promise<ProbabilityTypes[] | null>}
 */
export const predictImage = async (buffer: Uint8Array): Promise<ProbabilityTypes[] | null> => {
    try {
        const model = await loadModel();
        const processedTensor = processImage(buffer);
        const predictions = await model.classify(processedTensor as any);

        processedTensor.dispose(); // Clean up the processed tensor

        formatLog("info", "Image predicted");

        return predictions;
    } catch (error) {
        formatLog("error", "Error while predicting: " + error);
        return null;
    }
};

/**
 * This function checks if two words have common letters and the words are almost the same length, can be improved
 * @param word1 {string}
 * @param word2 {string}
 * @returns {boolean}
 */
function hasCommonLetters(word1: string, word2: string): boolean {
    const lettersInWord1 = new Set(word1.replace(/\s/g, '')); // Remove spaces and create a set of unique letters
    const lettersInWord2 = new Set(word2.replace(/\s/g, '')); // Remove spaces and create a set of unique letters

    let commonLetterCount = 0;
    for (const letter of lettersInWord1) {
        if (lettersInWord2?.has(letter)) {
            commonLetterCount++;
        }
    }

    // Here we check if the words are almost the same length by intorducing a tolerance of 2 characters
    if (word1?.length === word2?.length || word1?.length + 1 === word2?.length + 2 || word1?.length + 2 === word2?.length + 1 || word1?.length === word2?.length + 1 || word1?.length === word2?.length + 2 || word1?.length + 1 === word2?.length || word1?.length + 2 === word2?.length) {
        const wordLength = word1?.length;
        // Here we take a tolerance of 5 characters
        if (wordLength > 10 && commonLetterCount >= wordLength - 5) {
            return true;
        } else {
            return false;
        }
    }

    return false;
}

/**
 * This function is actually the algorithm that does the magic, if you want to understand the magic, you need to read the comments
 * One more thing, if someone deletes something from this code, I will hunt you down and I will find you
 * @param predictions {PredictionsTypes[] | null}
 * @returns {PredictionsTypes[]}
 */
export const doMagicAIStuff = (
    predictions: PredictionsTypes[] | null
): PredictionsTypes[] => {
    const remainingImages: PredictionsTypes[] | null = [];

    if (predictions) {
        if (predictions?.length <= 1) {
            return predictions;
        }

        // First, we iterate through the predictions array
        for (let i = 0; i < predictions.length; i++) {

            console.log(' ')
            // Then, we iterate through all the predictions in the prediction array (I know, confuing but stay with me)
            if (predictions?.[i]?.prediction) {

                // We use this variable to count how many times the same className appears
                let countNumberOfSameClassNames = 0;
                // We use this variable to count how many classNames we have
                let countNumberOfClassNames = 0;

                for (let j = 0; j < (predictions?.[i]?.prediction as ProbabilityTypes[])?.length; j++) {
                    // We use this number to check if we are at the end of the prediction array (prediction, not predictions, sorry for the naming)
                    const numberOfPredictionsClasName = (predictions?.[i]?.prediction as ProbabilityTypes[])?.length - 1 as number;
                    // We take the current, next and beforeCurrent className to compare them
                    const currentClassName = predictions?.[i]?.prediction?.[j]?.className;
                    const nextClassName = predictions?.[i + 1]?.prediction?.[j]?.className;
                    const beforeCurrentClassName = predictions?.[i - 1]?.prediction?.[j]?.className;
                    // We take the probabilities from the current and next className to compare them
                    const currentProbability = predictions?.[i]?.prediction?.[j]?.probability;
                    const nextProbability = predictions?.[i + 1]?.prediction?.[j]?.probability;

                    // We increase the countNumberOfClassNames variable
                    countNumberOfClassNames++;

                    // If current and next clasName are the same, we remove the next image
                    if (currentClassName === nextClassName && areNumbersAlmostSame(currentProbability as number, nextProbability as number, 0.1)) {
                        countNumberOfSameClassNames++;
                    }
                    
                    // First of all, we check if the current className is not the same as the next className
                    if (currentClassName !== nextClassName && countNumberOfClassNames === 1 && i === 0) {
                        // If they are not the same, we push the current image to the remainingImages array
                        remainingImages?.push(predictions[i]);
                        // We reset the countNumberOfSameClassNames variable
                        // We skip the next iteration because we already know that the next image is not the same as the current one
                        continue;
                    }

                    // Check if the current className is not the same as the beforeCurrent className
                    if (currentClassName !== beforeCurrentClassName && j === 0) {
                        remainingImages?.push(predictions[i]);
                        // We reset the countNumberOfSameClassNames variable
                        // We skip the next iteration because we already know that the next image is not the same as the current one
                        continue;
                    }

                    // Here are are doing a special check, if countNumberOfSameClassNames is equal to numberOfPredictionsClasName - 1,
                    // meaning we only have one className left, we check if that className is almost equal to the next className
                    if (countNumberOfSameClassNames === numberOfPredictionsClasName - 1) {
                        const nextClassNameFromCurrentClassName = predictions?.[i]?.prediction?.[numberOfPredictionsClasName]?.className
                        const nextClassNameFromNextClassName = predictions?.[i + 1]?.prediction?.[numberOfPredictionsClasName]?.className
                        if (hasCommonLetters(nextClassNameFromCurrentClassName as string, nextClassNameFromNextClassName as string)) {
                            remainingImages?.push(predictions[i]);
                            // console.log(predictions[i])
                            // We skip the next iteration because we already know that the next image is the same as the current one
                            continue;
                        }
                    }
                    // Here we check if countNumberOfSameClassNames is equal to numberOfPredictionsClasName, meaning we have all the classNames left
                    else if (countNumberOfSameClassNames === numberOfPredictionsClasName) {
                        remainingImages?.push(predictions[i]);
                        // console.log(predictions[i])
                        // We skip the next iteration because we already know that the next image is the same as the current one
                        continue;
                    }

                }
            }
            console.log(' ')
        }
    }

    const filteredImages = [...new Set(remainingImages)]

    return filteredImages;
};