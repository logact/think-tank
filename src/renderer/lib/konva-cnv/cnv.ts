// import { Stage } from 'konva/lib/Stage';
// import { Layer } from 'konva/lib/Layer';
// import { Rect } from 'konva/lib/shapes/Rect';

import { IpcChannel } from '@common/IpcChannel';
import dagre from "@dagrejs/dagre";
import { Group } from 'konva/lib/Group';

import { Layer } from 'konva/lib/Layer';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Circle } from 'konva/lib/shapes/Circle';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Stage } from 'konva/lib/Stage';
// import { Shape, ShapeConfig } from 'konva/lib/Shape';
// import { Group } from 'konva/lib/Group';
// import { Circle } from 'konva/lib/shapes/Circle';
// import { Line } from 'konva/lib/shapes/Line';



type ElemType = "default-node" | "default-edge" | "react-node" | "directe-line-edge" | "startNode" | "endNode" | "circle-node" | "3-point-edge"


const NODE_WIDTH = 15;
const NODE_HEIGHT = 15;
const MARGIN = 70;
type KnovaShap = Group | Shape<ShapeConfig>
type KnovaEdge = Line
export interface NodePO {
    id: string
    name: string
    type: ElemType

}
export interface EdgePO {
    id: string
    name: string
    fromNodeId: string
    toNodeId: string
    type: ElemType
}

export interface DiagramPO {
    nodes: NodePO[]
    edges: EdgePO[]
    startNode: NodePO
    endNode: NodePO
    curTargetElem: NodePO
    selectedElem: NodePO | EdgePO
    mousePointElem?: NodePO | EdgePO
}

export class DiagramCnv {
    diagramId: string
    diagramPO: DiagramPO
    knovaStage: Stage
    knovaLayer1: Layer
    knovaLayer2: Layer
    container: HTMLDivElement
    resizeObserver: ResizeObserver
    width: number
    height: number


    constructor({ diagramId, container }: { diagramId: string, container: HTMLDivElement }) {
        this.diagramId = diagramId
        this.container = container
        this.width = this.container.clientWidth
        this.height = this.container.clientHeight
    }
    async init() {
        await this.initDb().then(()=>{

            console.log("1. data have loaded");
            this.initKnovaStage()
            console.log("2. knovaStage finished");
        })

    }
    async initDb() {
        const data = await window.myapi.invoke(IpcChannel.GetDiagram, { "id": this.diagramId })

        if (!data || data === '{}') {
            const startNode = { id: this.generateUUID(), name: 'start', type: 'circle-node' } as NodePO;
            const endNode = { id: this.generateUUID(), name: 'end', type: 'circle-node' } as NodePO;
            const edge: EdgePO = { id: this.generateUUID(), name: "stat to end", type: "directe-line-edge", "fromNodeId": startNode.id, "toNodeId": endNode.id }
            this.diagramPO = {
                nodes: [startNode, endNode],
                edges: [edge],
                startNode: startNode,
                endNode: endNode,
                curTargetElem: endNode,
                selectedElem: edge
            }

        } else {

            this.diagramPO = JSON.parse(data)
        }
    }
    initKnovaStage() {
        this.knovaStage = new Stage({
            container: this.container, // Replace with your container id
            width: this.container.clientWidth,
            height: this.container.clientHeight
        })
        // this.initLayer1()
        this.initLayer2()
        // this.initEvent();
    }
    initLayer2() {

        this.knovaLayer2 = new Layer()

        const startElem = this.createNode(this.diagramPO.startNode, { "x": 0, "y": this.height / 2 - NODE_HEIGHT / 2 })
        const endElem = this.createNode(this.diagramPO.endNode, { "x": this.width - NODE_WIDTH, "y": this.height / 2 - NODE_HEIGHT / 2 })
        const curTargetElem = this.createNode(this.diagramPO.endNode)

        this.knovaLayer2.add(startElem, endElem, curTargetElem)
        this.knovaStage.add(this.knovaLayer2)
    }
    initLayer1() {
        this.knovaLayer1 = new Layer()
        this.diagramPO.nodes.forEach(n => {
            const node = this.createNode(n)
            this.knovaLayer1.add(node)
            this.bindElemEvent(node)
        })
        this.diagramPO.edges.forEach(e => {
            const edge = this.createEdge(e)
            this.knovaLayer1.add(edge)
            this.bindElemEvent(edge)
        })

        this.knovaStage.add(this.knovaLayer1)
    }
    save() {
        window.myapi.invoke(IpcChannel.SaveDiagram, { "id": this.diagramId, "data": JSON.stringify(this.diagramPO) })
    }
    private generateUUID() {
        const timestamp = Date.now().toString(16); // Current timestamp in milliseconds as hexadecimal
        const random = Math.floor(Math.random() * 1e16).toString(16); // Random number as hexadecimal
        return `${timestamp}-${random}`.replace("-", "");
    }
    createEdge(e: EdgePO, pointsParam?: number[]): Group | Shape<ShapeConfig> {
        const points = pointsParam || [0, 0, 0, 0, 0, 0]
        if (e.type == 'directe-line-edge') {
            return new Line({
                "points": points,
                "stroke": "black",
                "strokeWidth": 5,
                "lineCap": "round",
                "lineJoin": "round",
                "tension": 1,
                "name": e.type,
                "id": e.id
            })
        }
    }
    findPOById(id: string): (NodePO | EdgePO) {
        return this.diagramPO.nodes.find(n => n.id === id) || this.diagramPO.edges.find(e => e.id === id);
    }

    bindElemEvent(elem: KnovaShap) {
        elem.on("mouseover", (e) => {

            this.diagramPO.mousePointElem = this.findPOById(elem.id())
        })
        elem.on("mouseout", (e) => {

            this.diagramPO.mousePointElem = null
        })
    }

    createNode(n: NodePO, pos?: { "x": number, "y": number }): Group | Shape<ShapeConfig> {
        const x = pos?.x || 0
        const y = pos?.y || 0
        if (n.type == "circle-node") {
            const res = new Circle({
                "x": x,
                "y": y,
                "id": n.id,
                "name": n.type,
                "radius": NODE_WIDTH,
                "strokeWidth": 3,
                "stroke": 'black',
                "fill": "green"
            })
            return res
        }
    }
    removeElem(elem: NodePO | EdgePO) {
        if (elem.type == 'circle-node') {
            this.diagramPO.nodes = this.diagramPO.nodes.filter(n => {
                n.id != elem.id
            })
        } else {
            this.diagramPO.edges = this.diagramPO.edges.filter(e => {
                e.id != elem.id
            })
        }
        this.knovaLayer1.findOne(`#${elem.id}`).destroy()
        this.draw()
    }
    createNextElem() {
        if (this.diagramPO.curTargetElem.type == 'circle-node') {
            const newEdge: EdgePO = {
                id: this.generateUUID(),
                name: `${this.diagramPO.selectedElem.name}-${this.diagramPO.curTargetElem.name}`,
                fromNodeId: this.diagramPO.selectedElem.id,
                toNodeId: this.diagramPO.curTargetElem.id,
                type: 'directe-line-edge'
            }
            this.diagramPO.edges.push(newEdge)
            this.diagramPO.selectedElem = newEdge
            const newEdgeElem = this.createEdge(newEdge)
            this.knovaLayer1.add(newEdgeElem)
        } else if (this.diagramPO.curTargetElem.type == 'directe-line-edge') {
            const curSelectedEdge: EdgePO = this.diagramPO.selectedElem as EdgePO
            this.diagramPO.edges = this.diagramPO.edges.filter(e => { e.id != this.diagramPO.selectedElem.id })
            const newNode: NodePO = {
                "id": this.generateUUID(),
                "name": "new name",
                type: 'circle-node'
            }
            this.diagramPO.nodes.push(newNode)
            this.diagramPO.selectedElem = newNode
            const nodeElem = this.createNode(newNode)
            this.bindElemEvent(nodeElem)
            this.knovaLayer1.add(nodeElem)

            const newEdge: EdgePO = {
                id: this.generateUUID(),
                fromNodeId: curSelectedEdge.fromNodeId,
                toNodeId: newNode.id,
                type: 'directe-line-edge',
                name: 'new edge1'
            }
            const newEdgeElem = this.createEdge(newEdge)
            this.bindElemEvent(newEdgeElem)
            this.knovaLayer1.add(newEdgeElem)
            const newEdge1: EdgePO = {
                id: this.generateUUID(),
                name: 'new edge2',
                fromNodeId: newNode.id,
                toNodeId: curSelectedEdge.toNodeId,
                type: 'circle-node'
            }
            const newEdgeElem1 = this.createEdge(newEdge1)
            this.bindElemEvent(newEdgeElem1)
            this.knovaLayer1.add(newEdgeElem1)
            this.diagramPO.selectedElem = newEdge1
            this.diagramPO.edges.push(newEdge)
            this.removeElem(this.diagramPO.selectedElem)
        }
        this.draw()
    }
    findEdgeById(id: string): EdgePO {
        const res = this.diagramPO.edges.find(e => {
            return e.id == id
        })

        return res

    }
    initEvent() {
        const container = this.knovaStage.container();
        container.tabIndex = 1
        container.focus();
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 'd') {

            }
        })
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
            if (e.metaKey && e.key == "t") {
                this.diagramPO.curTargetElem = this.diagramPO.mousePointElem
            }
            e.preventDefault();
        })
        this.knovaStage.on("wheel", (e) => {
            e.evt.preventDefault()
            let deltaX = - e.evt.deltaX / 3
            let deltaY = - e.evt.deltaY / 3
            this.knovaLayer1.move({ x: deltaX, y: deltaY })
        })

        this.initResizeEvent()
    }
    setTarget(elm: NodePO | EdgePO) {
        this.diagramPO.curTargetElem = elm
    }
    initResizeEvent() {
        const resizeObserver = new ResizeObserver((entries) => {
            requestAnimationFrame(
                () => {
                    for (const entry of entries) {
                        this.width = this.container.clientWidth
                        this.height = this.container.clientHeight
                        this.knovaStage.width(this.width)
                        this.knovaStage.height(this.height)
                    }
                }
            )
        })
        resizeObserver.observe(this.container)
        this.resizeObserver = resizeObserver
    }
    draw() {
        if (this.knovaLayer1) {
            this.layout()
            this.knovaLayer1.draw()
        }
        if (this.knovaLayer2) {
            this.knovaLayer2.draw()
        }
    }
    edge(nodeId1: string, nodeId2: string): KnovaEdge {
        let res: EdgePO | null = null;
        this.diagramPO.edges.forEach(e => {
            if (e.fromNodeId == nodeId1 && e.toNodeId === nodeId2) {
                res = e;
            }
        })

        if (res) {
            let id = res.id
            return this.knovaLayer1.findOne(`#${id}`) as Line;
        }

        return null
    }
    layout() {
        const g = new dagre.graphlib.Graph({ directed: true });
        // Set an object for the graph label
        g.setGraph({ rankdir: "LR", align: "DR", "ranker": "longest-path", "acyclicer": "greedy" });
        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(function () {
            return {};
        });

        const allNodes = this.knovaLayer1.find('.circle-node');
        const allEdges = this.knovaLayer1.find('.directe-line-edge');

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

            const { fromNodeId, toNodeId } = this.findEdgeById(edge.id())
            g.setEdge(fromNodeId, toNodeId)
        })
        dagre.layout(g);
        let minY = Infinity;
        let maxY = -Infinity;
        g.nodes().forEach(nodeId => {
            const node = g.node(nodeId)
            minY = Math.min(node.y, minY)
            maxY = Math.max(node.y, maxY)
        })
        let offsetY = (this.height) / 2 - NODE_HEIGHT / 2 - (maxY - minY) / 2
        let offsetX = MARGIN
        g.nodes().forEach(nodeId => {
            let nodeElem = this.knovaLayer1.findOne("#" + nodeId)
            let { x, y } = g.node(nodeId)
            nodeElem.x(x)
            nodeElem.y(y)
        });

        g.edges().forEach(e => {
            const edge = this.edge(e.v, e.w)
            const { points } = g.edge(e.v, e.w)
            edge.points([points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y])
        })
        this.knovaLayer1.move({ x: offsetX, y: offsetY })
    }
    destroy() {
        this.resizeObserver.disconnect()
    }

}




