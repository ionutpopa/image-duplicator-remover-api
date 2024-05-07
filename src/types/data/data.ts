export type DataType = {
    filename: string;
    embedding: number[];
};

export type FilteredDataType = { 
    imageToRemoveName: string; 
    similarity: number 
}[];

export type FilteredImagesType = {
    name: string;
    buffer?: string;
}