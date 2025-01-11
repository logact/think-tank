import { DiagramModel, NodeModel, EdgeModel } from "../model/diagram-model";

interface DiagramVO extends DiagramModel {
    nodes: NodeVO[],
    edges: EdgeVO[],
    startNode: NodeVO,
    endNode: NodeVO,

}
type NodeVO = NodeModel;
type EdgeVO = EdgeModel;
export { DiagramVO, NodeVO, EdgeVO }