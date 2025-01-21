import dagre from "@dagrejs/dagre";
import { INode } from "./elements/node-element";
import { IEdge } from "./elements/edge-element";

export function connectNode(node1: INode, node2: INode) {
    if (!node1 || !node2) {
        return;
    }
    let x1 = node1.position.x;
    let y1 = node1.position.y;
    let x2 = node2.position.x;
    let y2 = node2.position.y;
    let w1 = node1.size.width;
    let h1 = node1.size.height;
    let w2 = node2.size.width;
    let h2 = node2.size.height;
    const start = {
        x: x1 + w1,
        y: y1 + h1 / 2
    }
    const end = {
        x: x2,
        y: y2 + h2 / 2
    }
    return {
        start,
        end
    }
}


export function layoutInCenterPanel({
    nodeElements,
    edgeElmenets,
    diagramHeight,
    diagramWidth,
    startElement,
    endElement,
    startX,
    scale,

}: {
    nodeElements: INode[],
    edgeElmenets: IEdge[],
    diagramWidth: number,
    diagramHeight: number,
    startElement: INode,
    endElement: INode,
    startX: number,
    endX: number,
    scale: number,
}) {


    // 1.calculate the  edge node connected with start and end.

    // const { nodes, ÷edges } = elements;
    // Create a new directed graph

    const g = new dagre.graphlib.Graph({ directed: true });
    // Set an object for the graph label
    g.setGraph({ rankdir: "LR", align: "UR" });

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () {
        return {};
    });
    const id2nodeElem = new Map<number, INode>()
    nodeElements.forEach((node) => {
        if (node.data.id != startElement.data.id && node.data.id != endElement.data.id) {

            const width = node.size.width * scale
            const height = node.size.height * scale
            g.setNode(String(node.data.id), {
                width: width,
                height: height,
            });
            node.size = {
                width,
                height
            }
            id2nodeElem.set(node.data.id, node)
        }
    });

    edgeElmenets.forEach((edge) => {
        // filter the edge from the start node and edge to end node
        if (edge.data.startNodeId !== startElement.data.id && edge.data.endNodeId !== endElement.data.id) {
            const { startNodeId, endNodeId } = edge.data;
            g.setEdge(String(startNodeId), String(endNodeId));
        }

    });

    dagre.layout(g);

    let minY = Infinity;
    let maxY = -Infinity;
    let offsetX = startX;

    g.nodes().forEach(nodeId => {
        const node = g.node(nodeId)
        minY = Math.min(node.y, minY)
        maxY = Math.max(node.y, maxY)


    })
    const offsetY = diagramHeight / 2 - (minY + maxY) / 2

    nodeElements.forEach(node => {

        const gPos = g.node(String(node.data.id));
        if (gPos != null) {

            const { x, y } = gPos

            node.position = {
                "x": x + offsetX,
                "y": y + offsetY
            }
        }
    })



    edgeElmenets.forEach(edge => {
        const postion = connectNode(id2nodeElem.get(edge.data.startNodeId), id2nodeElem.get(edge.data.endNodeId))
        if (postion) {
            edge.position = postion
        }

    })

    startElement.position = {
        "x": 0,
        "y": diagramHeight / 2 - startElement.size.height / 2
    }



    endElement.position = {
        "x": diagramWidth - endElement.size.width,
        "y": diagramHeight / 2 - endElement.size.height / 2


    }


}