import { DiagramVO, NodeVO } from "@common/vo/diagram-bo";
import Res from "@common/vo/res";
import { datasource } from "@main/db";
import { DiagramEntity } from "@main/db/entities/diagram-entity";
import { EdgeEntity } from "@main/db/entities/edge-entity";
import { NodeEntity } from "@main/db/entities/node-entity";
import { ipcMain } from "electron";
import { ipcChannel } from "./contants";
import { And, Equal, In, Not } from "typeorm";
import res from "@common/vo/res";

export function init() {
    ipcMain.handle(ipcChannel.diagram_mk, async (_, diagramVo: DiagramVO) => {
        const repos = datasource.getRepository(DiagramEntity);
        const res = await repos.save(diagramVo);
        if (res && res.id >= 0) {
            return Res.ok(res);
        } else {
            return Res.failed(null);
        }
    })
    ipcMain.handle(ipcChannel.diagram_del, async (_, ids: [number]) => {
        const repos = datasource.getRepository(EdgeEntity);
        let res = await repos.softDelete(ids)
        if (res.affected === ids.length) {
            return Res.ok(res.affected)
        } else {
            return Res.failed(`total ${ids.length}, success partly ${res.affected}`)
        }
    })
    ipcMain.handle(ipcChannel.diagram_get, async (_, id: number): Promise<Res<DiagramVO>> => {
        const repos = datasource.getRepository(DiagramEntity);
        const nodeRepos = datasource.getRepository(NodeEntity);
        const res = await repos.findOne({ where: { id } })
        if (!res) {
            if (id == 0) {
                let diagramRes = await repos.save({
                    nodes: [],
                    edges: [],
                    startNode: undefined,
                    endNode: undefined,
                    id: 0,
                    createdAt: undefined,
                    updatedAt: undefined,
                    name: '',
                    description: '',
                    parentType: "root"
                })
                if (!diagramRes) {
                    return Res.failed("create diagram failed")
                }
                let startNodeRes = await nodeRepos.save({

                    type: 0,
                    diagramId: 0,
                    id: 0,
                    createdAt: undefined,
                    updatedAt: undefined,
                    name: '',
                    description: ''

                })
                if (!startNodeRes) {
                    return Res.failed("create start node failed")
                }
                let endNodeRes = await nodeRepos.save({
                    type: 0,
                    diagramId: 0,
                    id: 1,
                    createdAt: undefined,
                    updatedAt: undefined,
                    name: '',
                    description: ''
                })
                if (!endNodeRes) {
                    return Res.failed("create end node failed")
                }
                return await getDiagramById(id);

            }
            return Res.failed(null);
        } else {
            return await getDiagramById(id);

        }
    })
    ipcMain.handle(ipcChannel.diagram_ls, async (_, id: number) => {

        const repos = datasource.getRepository(DiagramEntity);
        let res = await repos.find()
        if (res && res.length > 0) {
            return Res.ok(res)
        } else {
            return Res.failed()
        }
    })

    ipcMain.handle(ipcChannel.node_mk, async (_, node: NodeVO): Promise<Res<NodeVO>> => {
        const nodeRepos = datasource.getRepository(NodeEntity);
        const newNode = await nodeRepos.save(node);
        if (newNode) {
            return Res.ok(newNode);
        } else {
            return Res.failed("Failed to add node");
        }
    });

    ipcMain.handle(ipcChannel.node_get, async (_, id: number): Promise<Res<NodeVO>> => {
        const nodeRepos = datasource.getRepository(NodeEntity);
        const node = await nodeRepos.findOne({ where: { id } });
        if (node) {
            return Res.ok(node);
        } else {
            return Res.failed(null);
        }
    });


    ipcMain.handle(ipcChannel.node_del, async (_, id: number[]) => {
        const nodeRepos = datasource.getRepository(NodeEntity);
        const res = await nodeRepos.delete(id);
        if (res.affected === 1) {
            return Res.ok(res.affected);
        } else {
            return Res.failed("Failed to delete node");
        }
    });

    ipcMain.handle(ipcChannel.edge_mk, async (_, edge: EdgeEntity) => {
        const edgeRepos = datasource.getRepository(EdgeEntity);
        const newEdge = await edgeRepos.save(edge);
        if (newEdge) {
            return Res.ok(newEdge);
        } else {
            return Res.failed("Failed to add edge");
        }
    });

    ipcMain.handle(ipcChannel.edge_get, async (_, id: number): Promise<Res<EdgeEntity>> => {
        const edgeRepos = datasource.getRepository(EdgeEntity);
        const edge = await edgeRepos.findOne({ where: { id } });
        if (edge) {
            return Res.ok(edge);
        } else {
            return Res.failed(null);
        }
    });


    ipcMain.handle(ipcChannel.edge_del, async (_, id: number[]) => {
        const edgeRepos = datasource.getRepository(EdgeEntity);
        const res = await edgeRepos.delete(id);
        if (res.affected === 1) {
            return Res.ok(res.affected);
        } else {
            return Res.failed("Failed to delete edge");
        }
    });

}
async function getDiagramById(id: number) {
    const repos = datasource.getRepository(DiagramEntity)
    const res = await repos.findOne({ where: { id } })
    const nodeRepos = datasource.getRepository(NodeEntity)
    const edgeRepos = datasource.getRepository(EdgeEntity)
    
    let startNode:NodeEntity
    let endNode:NodeEntity
    if (res.parentType == "edge") {
        const parentEdge = await edgeRepos.findOne({ where: { id: res.parentId } });
        startNode = await nodeRepos.findOne({ where: { id: parentEdge.startNodeId } });
        endNode = await nodeRepos.findOne({ where: { id: parentEdge.endNodeId } });
    }else if(res.parentType == "root"){
        startNode = await nodeRepos.findOne({ where: { id: 0 } });
        endNode = await nodeRepos.findOne({ where: { id: 1 } });

    }

    const nodes = await nodeRepos.find({ where: { diagramId: id, "id": Not(In([startNode.id, endNode.id])) } });
    const edges = await edgeRepos.find({ where: { diagramId: res.id } });
    let diagramVO: DiagramVO = {
        ...res,
        nodes: nodes,
        edges: edges,
        startNode: startNode,
        endNode: endNode
    };
    return Res.ok(diagramVO);
}

