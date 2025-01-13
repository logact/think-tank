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

    props.edgeElmenets.forEach((edge) => {
        // filter the edge from the start node and edge to end node
        if (edge.data.startNodeId !== props.startElement.data.id || edge.data.endNodeId !== props.endElement.data.id) {
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

    const offsetY = (props.diagramheight - (maxY - minY)) / 2 - minY;
    const offsetX = startNodePosition.x + 100

    function setNodePostion(node: INode) {
        const { width, height, x, y } = g.node(String(node.data.id));
        node.position = {
            "x": x - width / 2 + offsetX,
            "y": y - height / 2 + offsetY
        }
    }


    // connect the start->end
    props.edgeElmenets.forEach(e => {
        // from start node 
        if (e.data.startNodeId === props.startElement.data.id && e.data.endNodeId === props.endElement.data.id) {
            // if the line is the line between the 2 point
            let startX = props.startElement.position.x + props.startElement.size.width / 2;
            let startY = props.startElement.position.y + props.startElement.size.height / 2;
            let endX = props.endElement.position.x + props.startElement.size.width / 2;
            let endY = props.endElement.position.y + props.endElement.size.height / 2;
            e.position.start = {
                x: startX,
                y: startY
            }

            e.position.end = {
                x: endX,
                y: endY
            }
        } else if (e.data.startNodeId === props.startElement.data.id) {
            let dargePositon = g.node(String(e.data.endNodeId))
            if (dargePositon) {
                e.position.end = { "x": dargePositon.x, "y": dargePositon.y }
                e.position.start = props.startElement.position
            }
        } else if (e.data.endNodeId === props.endElement.data.id) {
            let dargePositon = g.node(String(e.data.startNodeId));
            if (dargePositon) {
                e.position.start = { "x": dargePositon.x, "y": dargePositon.y }
                e.position.end = props.endElement.position
            }
        }

    })



    props.nodeElements.forEach((node) => {
        setNodePostion(node)
    });
    debugger


    props.edgeElmenets.forEach((edge) => {
        const e = g.edge({ v: String(edge.data.startNodeId), w: String(edge.data.endNodeId) });
        if (e) {
            let points = e.points;
            let fromPosition = points[0];
            let toPosition = points[2];
            fromPosition.y += offsetY;
            toPosition.y += offsetY;
            edge.position.start = fromPosition;
            edge.position.end = toPosition;
        }
    });
}
