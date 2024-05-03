import { spawn } from "child_process";

export const runPythonScript = async (script: string) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [script])

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