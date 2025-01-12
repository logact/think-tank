import dagre from "@dagrejs/dagre";
import { INode } from "./elements/node-element";
import { IEdge } from "./elements/edge-element";
import { NodeVO } from "@common/vo/diagram-bo";
export default function layoutElementByDarge(props: {
    nodeElements: INode[],
    edgeElmenets: IEdge[],
    diagramheight: number,
    diagramWidth: number,
    startElement: INode,
    endElement: INode
}) {
    // caculate the start and end 
    if (props.nodeElements.length <= 0) {
        return
    }
    // const { nodes, ÷edges } = elements;
    // Create a new directed graph
    const g = new dagre.graphlib.Graph({ directed: true });
    // Set an object for the graph label
    g.setGraph({ rankdir: "LR", align: "UR" });

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () {
        return {};
    });
    props.nodeElements.forEach((node) => {
        g.setNode(String(node.data.id), {
            width: node.size.width,
            height: node.size.height,
        });
    });
    g.setNode(String(props.startElement.data.id), {
        width: props.startElement.size.width,
        height: props.startElement.size.height
    })
    g.setNode(String(props.endElement.data.id), {
        width: props.endElement.size.width,
        height: props.endElement.size.height
    })
    props.edgeElmenets.forEach((edge) => {
        const { startNodeId, endNodeId } = edge.data;
        g.setEdge(String(startNodeId), String(endNodeId));
    });
    dagre.layout(g);

    let minY = Infinity;
    let maxY = -Infinity;



    g.nodes().forEach((nodeId) => {
        let aNode = g.node(nodeId)
        if (aNode) {
            const { width, height, x, y } = aNode;
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    });

    const offsetY = (props.diagramheight - (maxY - minY)) / 2 - minY;
    function setNodePostion(node:INode){
        const { width, height, x, y } = g.node(String(node.data.id));
        node.position = {
            x: x - width / 2,
            y: y - height / 2 + offsetY
        }
    }

    props.nodeElements.forEach((node) => {
        setNodePostion(node)

    });
    setNodePostion(props.startElement)
    setNodePostion(props.endElement)


    props.edgeElmenets.forEach((edge) => {
        const e = g.edge({ v: String(edge.data.startNodeId), w: String(edge.data.endNodeId) });
        let points = e.points;
        let fromPosition = points[0];
        let toPosition = points[2];
        fromPosition.y += offsetY;
        toPosition.y += offsetY;
        edge.position.start = fromPosition;
        edge.position.end = toPosition;
    });
}
