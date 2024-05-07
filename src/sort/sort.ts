import fs from 'fs'
import { DataType } from "../types/data/data"
import { runPythonScript } from '../utils/runPythonScript'

export const sortData: () => Promise<DataType[]> = async () => {
    const result = await runPythonScript('src/sort/sort.py');

    if (result === 0) {
        const data = JSON.parse(fs.readFileSync('embeddings.json', 'utf-8')) as DataType[]
        return data;
    } else {
        throw new Error('Python script exited with an error');
    }
}