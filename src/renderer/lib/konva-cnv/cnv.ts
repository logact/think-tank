import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';

import { IpcChannel } from '@common/IpcChannel';
import dagre from "@dagrejs/dagre";
import { Arrow } from 'konva/lib/shapes/Arrow';
import { Shape } from 'konva/lib/Shape';


type ElemType = "default-node" | "default-edge" | "react-node" | "directe-line-edge" | "startNode" | "endNode"

const NODE_WIDTH = 50;
const NODE_HEIGHT = 50;
const MARGIN = 70;


export class KnovaCnv {
    stage: Stage;
    layer: Layer;
    diagramInfo: any;
    container: HTMLDivElement;
    width: number;
    height: number;
    diagramId: string;
    selectedElem: Shape;
    maskLayer: Layer;
    private generateUUID() {
        const timestamp = Date.now().toString(16); // Current timestamp in milliseconds as hexadecimal
        const random = Math.floor(Math.random() * 1e16).toString(16); // Random number as hexadecimal
        return `${timestamp}-${random}`.replace("-", "");
    }
    constructor({ container, width, height, diagramInfo, diagramId }: { container: HTMLDivElement, width: number, height: number, diagramInfo: any, diagramId: string }) {
        this.diagramInfo = diagramInfo
        this.container = container
        this.width = width;
        this.height = height
        this.diagramId = diagramId;
        this.initStage()
        this.afterInitStage()

    }
    destroy() {
        this.stage.destroy()
    }
    resize({ width, height }: { width: number, height: number }) {
        this.stage.width(width)
        this.stage.height(height)
        this.width = width
        this.height = height
        this.maskLayer.removeChildren()
        this.initMaskLayer()
        this.draw()
    }
    private clickElem(node: Shape) {

        if (this.selectedElem?.id() !== node?.id()) {
            this.selectedElem = node as (Rect | Arrow)
            this.selectedElem.stroke('red')
        } else if (this.selectedElem && this.selectedElem === node) {
            this.selectedElem.stroke('black')
            this.selectedElem = null
        }
        this.layer.getChildren().forEach(n => {
            let nId = n?.id()
            if (n && this.selectedElem?.id() !== nId) {
                let konvaElem = n as Shape
                konvaElem.stroke('black')
            }
        })

    }
    private bindElemEvent(node: Shape) {
        node.on('click', () => { this.clickElem(node) })
    }
    private bindAllElemEvent() {
        this.layer.getChildren().forEach(n => {
            if (n instanceof Shape) {
                this.bindElemEvent(n)
            }
        })
    }
    private createElem(elemType: ElemType, data?: any) {
        let res = null
        let id = data?.id || this.generateUUID()
        if (elemType == 'startNode') {
            const node = new Konva.Rect({
                id,
                x: 0,
                y: this.height / 2,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 4,
            });
            res = node
        } else if (elemType == 'endNode') {
            const node = new Konva.Rect({
                id,
                x: this.width - 54,
                y: this.height / 2,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                fill: 'orange',
                stroke: 'black',
                strokeWidth: 4,
            });
            res = node
        } else if (elemType == 'default-node' || elemType == 'react-node') {
            const node = new Konva.Rect({
                id,
                x: 0,
                y: 0,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 4,

            });
            res = node
        } else if (elemType === 'default-edge' || elemType === 'directe-line-edge') {
            if (!data.start) {
                data.start = {
                    x: 0,
                    y: 0
                }
            }
            if (!data.end) {
                data.end = {
                    x: 0,
                    y: 0
                }
            }
            const { x: startX, y: startY } = data.start
            const { x: endX, y: endY } = data.end
            id = data.id
            if (!id) {
                alert("Please provide the id for the edge")
                return
            }
            const arrow = new Konva.Arrow({
                id,
                points: [startX, startY, endX, endY], // Starting and ending coordinates
                stroke: 'black', // Line color
                fill: 'black', // Arrowhead color
                strokeWidth: 3, // Line thickness
                pointerLength: 3, // Length of the arrowhead
                pointerWidth: 3, // Width of the arrowhead
                listening: true
            });
            res = arrow
        }
        return res
    }
    save() {
        window.myapi.invoke(IpcChannel.SaveDiagram, { "id": this.diagramId, "data": this.stage.toJSON() })
    }
    private loadOrCreateStage() {
        if (!this.diagramInfo || this.diagramInfo === "{}") {
            this.stage = new Konva.Stage({
                container: this.container,   // id of container <div>
                width: this.width,
                height: this.height
            });

        } else {
            this.stage = Konva.Node.create(this.diagramInfo, this.container)
        }
    }

    private initLayer() {
        let layer = this.stage.findOne('#main_layer') as Layer
        if (!layer) {
            layer = new Konva.Layer({ "id": 'main_layer' })
            layer.add(this.createElem("startNode", { id: `start_${this.diagramId}` }) as Rect)
            layer.add(this.createElem("endNode", { id: `end_${this.diagramId}` }) as Rect)
            layer.add(this.createElem("default-edge", { id: `start_${this.diagramId}-end_${this.diagramId}` }) as Arrow)
        }
        this.layer = layer
        this.stage.add(layer)

    }
    private initStage() {
        this.loadOrCreateStage()
        this.initLayer()
        this.initEvent()
        this.initMaskLayer()
    }
    private initMaskLayer() {
        this.maskLayer = new Layer({ "id": "mask_layer" })
        this.maskLayer.add(new Konva.Rect({
            "x": 0,
            "y": 0,
            "width": MARGIN,
            "height": this.height,
            "fill": "white"
        }))
        this.maskLayer.add(new Konva.Rect({
            "x": this.width - MARGIN,
            "y": 0,
            "width": MARGIN,
            "height": this.height,
            "fill": "white"
        }))
        this.stage.add(this.maskLayer)
        this.maskLayer.draw()
    }
    private refreshMask() {
        this.maskLayer.draw()
    }
    private afterInitStage() {
        // this.selectedElem = this.layer.findOne(`#start_${this.diagramId}`) as Rect
        const selectEdge = this.layer.findOne(`#start_${this.diagramId}-end_${this.diagramId}`) as Arrow
        this.clickElem(selectEdge)
    }
    private initEvent() {
        const container = this.stage.container();
        container.tabIndex = 1
        container.focus();
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 'n') {
                this.createNextElem()
                this.draw()
            }
            e.preventDefault();
        })
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 's') {
                this.save()
            }
            e.preventDefault();
        })
        container.addEventListener('keydown', (e) => {
            e.preventDefault();
        })
        this.stage.on("wheel", (e) => {
            e.evt.preventDefault()
            let delta = e.evt.deltaX / 4
            this.layer.move({ x: delta, y: 0 })
            this.refreshMask()
        })
        this.bindAllElemEvent()
    }

    private createNextElem() {

        if (!this.selectedElem) {
            alert("Please select a node")
            return
        }
        const elemType = this.selectedElem.getClassName();
        if (elemType === 'Rect') {
            const newEdge = this.createElem("default-edge", { id: `${this.selectedElem.id()}-end_${this.diagramId}` }) as Arrow
            this.bindElemEvent(newEdge)
            this.layer.add(newEdge)
            this.selectedElem = newEdge
        } else if (elemType === 'Arrow') {
            // seperate the edge to two edges and create a new node
            const curArrow = this.selectedElem as Arrow
            const newRect = this.createElem("default-node") as Rect
            let [startId, endId] = curArrow.id().split('-')
            curArrow.id(`${startId}-${newRect.id()}`)
            const newEdge = this.createElem("default-edge", { id: `${newRect.id()}-${endId}` }) as Arrow
            this.bindElemEvent(newRect)
            this.bindElemEvent(newEdge)
            this.layer.add(newEdge, newRect)
        }

    }
    draw() {
        this.layout()
        this.maskLayer.draw()
    }
    layout() {
        const g = new dagre.graphlib.Graph({ directed: true });
        // Set an object for the graph label
        g.setGraph({ rankdir: "LR", align: "DR", "ranker": "longest-path", "acyclicer": "greedy" });
        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(function () {
            return {};
        });

        const allNodes = this.layer.find('Rect');
        const allEdges = this.layer.find('Arrow');

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
        dagre.layout(g);
        let minY = Infinity;
        let maxY = -Infinity;
        g.nodes().forEach(nodeId => {
            const node = g.node(nodeId)
            minY = Math.min(node.y, minY)
            maxY = Math.max(node.y, maxY)
        })
        let offsetY = (this.height) / 2 - (maxY - minY) / 2
        let offsetX = MARGIN
        g.nodes().forEach(nodeId => {
            let nodeElem = this.layer.findOne("#" + nodeId)
            let { x, y } = g.node(nodeId)
            nodeElem.x(x + offsetX)
            nodeElem.y(y + offsetY)
        });
        g.edges().forEach(edge => {
            this.connectNode(edge.v, edge.w)
        })
    }
    private connectNode(nodeId1: string, nodeId2: string) {
        let node1 = this.layer.findOne(`#${nodeId1}`);
        let node2 = this.layer.findOne(`#${nodeId2}`);

        if (!node1 || !node2) {
            return;
        }
        let x1 = node1.x();
        let y1 = node1.y();
        let x2 = node2.x();
        let y2 = node2.y();
        let w1 = node1.width();
        let h1 = node1.height();
        let w2 = node2.width();
        let h2 = node2.height();
        const start = {
            x: x1 + w1,
            y: y1 + h1 / 2
        }
        const end = {
            x: x2,
            y: y2 + h2 / 2
        }
        let edge: Arrow
        edge = this.layer.findOne(`#${nodeId1}-${nodeId2}`)
        edge.points([start.x, start.y, end.x, end.y])
    }
}


