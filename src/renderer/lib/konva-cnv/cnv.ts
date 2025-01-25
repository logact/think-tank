import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';

import { IpcChannel } from '@common/IpcChannel';
import dagre from "@dagrejs/dagre";


type ElemType = "default-node" | "default-edge" | "react-node" | "directe-line-edge" | "startNode" | "endNode"




export class KnovaCnv {
    stage: Stage;
    layer: Layer;
    diagramInfo: any;
    container: HTMLDivElement;
    width: number;
    heigth: number;
    diagramId: string;
    parentLayer: Layer;

    constructor({ container, width, height, diagramInfo, diagramId }: { container: HTMLDivElement, width: number, height: number, diagramInfo: any, diagramId: string }) {
        // first we need to create a stage
        this.stage = new Konva.Stage({
            container,   // id of container <div>
            width,
            height
        });
        this.diagramInfo = diagramInfo
        this.container = container
        this.width = width;
        this.heigth = height
        this.diagramId = diagramId;
        this.initStage()
    }
    destroy() {

    }

    resize({ width, height }: { width: number, height: number }) {
        this.stage.width(width)
        this.stage.height(height)
        this.width = width
        this.heigth = height
        console.log(`log the position x:${this.width},y:${this.heigth}`)

    }

    createElem(elemType: ElemType, data?: any) {

        if (elemType == 'startNode') {


            const node = new Konva.Rect({
                x: 0,
                y: this.heigth / 2,
                width: 50,
                height: 50,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 4,
                draggable: true,
            });
            return node

        } else if (elemType == 'endNode') {


            const node = new Konva.Rect({
                x: this.width,
                y: this.heigth / 2,
                width: 50,
                height: 50,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 4,
                draggable: true,
            });
            return node


        } else if (elemType == 'default-node' || elemType == 'react-node') {

            const node = new Konva.Rect({
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 4,
                draggable: true,
            });
            return node
        } else if (elemType === 'default-edge' || elemType === 'directe-line-edge') {
            const { x: startX, y: startY } = data.startPosition
            const { x: endX, y: endY } = data.endPosition
            const arrow = new Konva.Arrow({
                points: [startX, startY, endX, endY], // Starting and ending coordinates
                stroke: 'black', // Line color
                fill: 'black', // Arrowhead color
                strokeWidth: 4, // Line thickness
                pointerLength: 10, // Length of the arrowhead
                pointerWidth: 10, // Width of the arrowhead
            });
            return arrow;
        }


    }
    save() {
        window.myapi.invoke(IpcChannel.SaveDiagram, { "id": this.diagramId, "data": this.stage.toJSON() })
    }

    initStage() {
        if (!this.diagramInfo || this.diagramInfo === "{}") {
            this.stage = new Konva.Stage({
                container: this.container,   // id of container <div>
                width: this.width,
                height: this.heigth
            });
            var layer = new Konva.Layer();

            this.stage.add(layer)
            layer.add(this.createElem("default-node") as Rect)
        } else {
            this.stage = Konva.Node.create(this.diagramInfo, this.container)
        }

        const container = this.stage.container();

        // make it focusable
        container.tabIndex = 1;
        // focus it
        // also stage will be in focus on its click
        container.focus();

        this.layer = this.stage.getLayers()[0]
        if (this.stage.getLayers().length > 1) {
            this.parentLayer = this.stage.getLayers()[1]
        } else {
            this.parentLayer = new Konva.Layer()
            this.stage.add(this.parentLayer)

        }
        this.parentLayer.add(this.createElem("startNode"))
        this.parentLayer.add(this.createElem("endNode"))
        this.initEvent()
    }
    initEvent() {
        const container = this.stage.container()
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 'n') {
                this.layer.add(this.createElem("default-node") as Rect)
                debugger
                this.save()
            }
            e.preventDefault();
        });
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 's') {

                this.save()
            }
            e.preventDefault();
        })

    }
    draw() {
        this.layout()
        this.parentLayer.draw()
        this.layer.draw()

    }
    layout() {



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

        const allNodes = this.layer.find('Rect');
        // TODO add the edge to the diagramF
        const allEdges = this.layer.find('edge');


        allNodes.forEach(node => {
            let rectNode = node as Rect
            let width = rectNode.width()
            let height = rectNode.height()
            let id = rectNode.id()
            g.setNode(id, {
                width,
                height
            })
        })
        allEdges.forEach(edge => {
            let ids = edge.id().split('-')
            let startNodeId = ids[0]
            let endNodeId = ids[1]
            g.setEdge(startNodeId, endNodeId)
        })



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

}


