export type DataType = {
    filename: string;
    embedding: number[];
};

export type FilteredDataType = { 
    imageToRemoveName: string; 
    similarity: number 
}[];