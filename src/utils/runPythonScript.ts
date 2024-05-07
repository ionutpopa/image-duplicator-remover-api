import { spawn } from "child_process";

/**
 * Run a python script
 * @param script - The path to the python script
 * @returns - Promise
 */
export const runPythonScript = async (script: string) => {
    return new Promise((resolve, reject) => {
        let pythonProcess;

        if (process.env.OS === 'windows') {
            pythonProcess = spawn('python', [script])
        } else {
            pythonProcess = spawn('python3', [script])
        }

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            resolve(code)
        })

        pythonProcess.on('error', (error) => {
            console.error(`Failed to start subprocess: ${error}`)
            reject(error)
        })
    })
}