import fs from 'fs'
import { Global } from "../types/global/global"
import { FilteredImagesType } from '../types/data/data';

declare const global: Global

/**
 * Function to get the filtered images
 */
export const getFilteredImages: () => Promise<FilteredImagesType[]> = async () => {
    const redisImages = await global.REDIS_CLIENT.keys('*');

    const response = redisImages.map(async (image) => {
        const buffer = await global.REDIS_CLIENT.get(image);

        return {
            name: image,
            buffer: buffer?.toString(),
        } as FilteredImagesType
    });

    const resolvedResponse = await Promise.all(response);

    const filteredEmbeddings = JSON.parse(fs.readFileSync('filteredEmbeddings.json', 'utf-8')) as string[];

    const filteredImages = resolvedResponse.filter((image) => {
        return filteredEmbeddings.find((filteredImage) => filteredImage === image.name)
    });

    // After getting the filtered images, delete the filteredEmbeddings.json file and the data inside redis cache
    fs.unlinkSync('filteredEmbeddings.json');

    redisImages.forEach((image) => {
        global.REDIS_CLIENT.del(image);
    });

    return filteredImages;
}