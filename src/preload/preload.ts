import { contextBridge, ipcRenderer } from "electron";
import { IDiagramApi, IEdgeApi, INodeApi, MyApi } from "@common/interface/diagram-interface";
import { DiagramVO, NodeVO, EdgeVO } from "@common/vo/diagram-bo";
import Res from "@common/vo/res";
import { ipcChannel } from "@main/ipc/contants";







const DiagramApi: IDiagramApi = {
    mk: async function (diagramVo: DiagramVO): Promise<Res<DiagramVO>> {
        return ipcRenderer.invoke(ipcChannel.diagram_mk, diagramVo)
    },
    ls: function (): Promise<Res<DiagramVO[]>> {
        return ipcRenderer.invoke(ipcChannel.diagram_ls)
    },
    get: async function (id: number): Promise<Res<DiagramVO>> {
        return ipcRenderer.invoke(ipcChannel.diagram_get, id)
    },
    del: async function (ids: [number]): Promise<Res<number>> {
        return ipcRenderer.invoke(ipcChannel.diagram_del, ids)
    }
}
const NodeApi: INodeApi = {
    mk: function (nodeVo: NodeVO): Promise<Res<NodeVO>> {
        return ipcRenderer.invoke(ipcChannel.node_mk, nodeVo)
    },
    ls: function (): Promise<Res<NodeVO[]>> {
        return ipcRenderer.invoke(ipcChannel.node_ls)
    },
    get: function (id: number): Promise<Res<NodeVO>> {
        return ipcRenderer.invoke(ipcChannel.node_get, id)
    },
    del: function (ids: [number]): Promise<Res<number>> {
        return ipcRenderer.invoke(ipcChannel.node_del, ids)

    }
}
const EdgeApi: IEdgeApi = {
    mk: function (nodeVo: NodeVO): Promise<Res<EdgeVO>> {
        return ipcRenderer.invoke(ipcChannel.edge_mk, nodeVo)
    },
    ls: function (): Promise<Res<EdgeVO[]>> {
        return ipcRenderer.invoke(ipcChannel.node_ls)
    },
    get: function (id: number): Promise<Res<EdgeVO>> {
        return ipcRenderer.invoke(ipcChannel.edge_get, id)
    },
    del: function (ids: [number]): Promise<Res<number>> {
        return ipcRenderer.invoke(ipcChannel.edge_del, ids)

    }
}


contextBridge.exposeInMainWorld('myapi', {
    diagram: DiagramApi,
    node: NodeApi,
    edge: EdgeApi,
    invoke: ipcRenderer.invoke
} as MyApi)
