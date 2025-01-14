import dagre from "@dagrejs/dagre";
import { INode } from "./elements/node-element";
import { IEdge } from "./elements/edge-element";
export default function layoutElementByDarge(props: {
    nodeElements: INode[],
    edgeElmenets: IEdge[],
    diagramheight: number,
    diagramWidth: number,
    startElement: INode,
    endElement: INode
}) {
    // caculate the start and end 

    const id2nodeElem = new Map<number, INode>()
    id2nodeElem.set(props.startElement.data.id, props.startElement)
    id2nodeElem.set(props.endElement.data.id, props.endElement)
    // const { nodes, ÷edges } = elements;
    // Create a new directed graph
    debugger
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
        id2nodeElem.set(node.data.id, node)
    });

    props.edgeElmenets.forEach((edge) => {
        // filter the edge from the start node and edge to end node
        if (edge.data.startNodeId !== props.startElement.data.id && edge.data.endNodeId !== props.endElement.data.id) {
            const { startNodeId, endNodeId } = edge.data;
            g.setEdge(String(startNodeId), String(endNodeId));
        }
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
    const startNodePosition = { x: 0, y: props.diagramheight / 2 }
    const endNodePosition = { x: props.diagramWidth - props.endElement.size.width, y: props.diagramheight / 2 }

    props.startElement.position = startNodePosition
    props.endElement.position = endNodePosition
    // optimize the offset to make the darge diagram in the aelign the center between the start and end
    const offsetY = (props.diagramheight - (maxY - minY)) / 2 - minY;
    const offsetX = startNodePosition.x + 100

    function offsetDargeNode({ x, y, width, height }: { x: number, y: number, width: number, height: number }) {
        return {
            "x": x - width / 2 + offsetX,
            "y": y - height / 2 + offsetY
        }

    }
    function connectNode(node1: INode, node2: INode) {
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


    function setNodePostion(node: INode) {
        node.position = offsetDargeNode(g.node(String(node.data.id)))
    }



    // ==================== darge calculte over ============================================================================


    props.nodeElements.forEach((node) => {
        setNodePostion(node)
    });

    props.edgeElmenets.forEach((edge) => {
        // const e = g.edge({ v: String(edge.data.startNodeId), w: String(edge.data.endNodeId) });
        // if (e) {
        edge.position = connectNode(id2nodeElem.get(edge.data.startNodeId), id2nodeElem.get(edge.data.endNodeId))
        // }
    });


    // ========================set the edge edge with the end node and start node =====================================
    // props.edgeElmenets.forEach(e => {
    //     // from start node 
    //     if (e.data.startNodeId === props.startElement.data.id && e.data.endNodeId === props.endElement.data.id) {
    //         // if the line is the line between the 2 point
    //         e.position = connectNode(props.startElement, props.endElement)

    //     } else if (e.data.startNodeId === props.startElement.data.id) {
    //         let dargePositon = g.node(String(e.data.endNodeId))
    //         if (dargePositon) {
    //             e.position = connectNode(props.startElement, id2nodeElem.get(e.data.endNodeId))
    //         }
    //     } else if (e.data.endNodeId === props.endElement.data.id) {
    //         let dargePositon = g.node(String(e.data.startNodeId));
    //         if (dargePositon) {
    //             e.position = connectNode(id2nodeElem.get(e.data.startNodeId), props.endElement)
    //         }
    //     }

    // })


}
