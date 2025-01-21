import { DiagramVO, NodeVO, EdgeVO } from "@common/vo/diagram-bo"
import Res from "@common/vo/res"

export interface IDiagramApi {
    mk(diagramVo: DiagramVO): Promise<Res<DiagramVO>>
    ls(): Promise<Res<DiagramVO[]>>
    get(id: number): Promise<Res<DiagramVO>>
    del(ids: [number]): Promise<Res<number>>
}
export interface INodeApi {
    mk(nodeVo: NodeVO): Promise<Res<NodeVO>>
    ls(): Promise<Res<NodeVO[]>>
    get(id: number): Promise<Res<NodeVO>>
    del(ids: [number]): Promise<Res<number>>
}

export interface IEdgeApi {
    mk(EdgeVO: EdgeVO): Promise<Res<EdgeVO>>
    ls(): Promise<Res<EdgeVO[]>>
    get(id: number): Promise<Res<EdgeVO>>
    del(props: { ids?: [number], edge?: { startNodeId: number, endNodeId: number } }): Promise<Res<number>>
}

export interface MyApi {
    diagram: IDiagramApi,
    node: INodeApi,
    edge: IEdgeApi,
    invoke: Function
}