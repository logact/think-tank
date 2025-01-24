import { ipcMain } from "electron";

import { IpcChannel } from "@common/IpcChannel";
const FOLDER_NAME = '/Users/logact/projects/think-tank/' + "testdata/diagram/"
import fs from "fs/promises"
export function initLowDbIpc() {
    ipcMain.handle(IpcChannel.GetDiagram, async (_, param) => {
        const filename = FOLDER_NAME + param.id + ".json"


        try {
            await fs.access(FOLDER_NAME);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('Folder does not exist, creating...');
                await fs.mkdir(FOLDER_NAME, { recursive: true });
            } else {
                throw err; // Handle other errors
            }
        }


        try {
            // Check if the file exists
            await fs.access(filename);
            console.log('File exists, reading...');
        } catch (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, create it with default content
                console.log('File does not exist, creating...');
                await fs.writeFile(filename, '{}', 'utf8');
            } else {
                throw err; // Handle other errors
            }
        }


        let res = await fs.readFile(filename, 'utf-8')
        return res

    })

    ipcMain.handle(IpcChannel.SaveDiagram, async (_, param) => {
        try {

            const filename = FOLDER_NAME + param.id + ".json"
            let res = await fs.writeFile(filename, param.data, 'utf-8')
            return res
        } catch (e) {
            console.error(e)
            return e
        }
    })
}