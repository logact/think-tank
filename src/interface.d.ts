import { MyApi } from "@common/interface/diagram-interface"

export interface IElectronAPI {
    loadPreferences: () => Promise<void>,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
        myapi:MyApi
    }
}