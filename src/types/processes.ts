export type ProbabilityTypes = {
    className: string;
    probability: number;
}

export type PredictionsTypes = {
    buffer: any;
    prediction: ProbabilityTypes[] | null
}