import { DirectLineEdgeElem, IEdge } from "./edge-element"
import { INode, RectangeNodeElem } from "./node-element"

enum ElementType {
    defaultNode = "default-node",
    defaultEdge = "default-edge",
    reactNode = "react-node",
    directedLineEdge = "direct-line-edge",
}

// Convert the enum values into an array
const elementTypesArray = Object.values(ElementType);

// Function to get the enum by number index
export function getElementTypeByNumber(value: number): ElementType | undefined {
    // Subtract 1 if you want to match 1-based indexing
    return elementTypesArray[value];
}

export function createElementByType(type: ElementType, data: INode | IEdge): INode | IEdge {
    switch (type) {
        case ElementType.reactNode:
            return new RectangeNodeElem(data as INode)
        case ElementType.directedLineEdge:
            return new DirectLineEdgeElem(data as IEdge)
        case ElementType.defaultNode:
            return new RectangeNodeElem(data as INode)
        case ElementType.defaultEdge:
            return new DirectLineEdgeElem(data as IEdge)
    }
}