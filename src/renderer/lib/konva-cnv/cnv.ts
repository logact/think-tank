import Konva from 'konva';
import { IpcChannel } from '@common/IpcChannel';
import dagre from "@dagrejs/dagre";
import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Circle } from 'konva/lib/shapes/Circle';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Stage } from 'konva/lib/Stage';
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
        await this.initDb().then(() => {

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
        this.knovaStage = new Konva.Stage({
            container: this.container, // Replace with your container id
            width: this.container.clientWidth,
            height: this.container.clientHeight
        })
        this.initLayer1()
        this.initLayer2()
        this.initEvent();
    }
    reDrawLayer1() {
        // draw the selected node
        let children = this.knovaLayer1.children
        children.forEach(child => {
            if (child instanceof Circle) {
                child.stroke('white')
                child.fill('green')
            }
        })

        if (this.diagramPO.selectedElem && this.diagramPO.selectedElem.id) {
            const elemClicked = this.knovaLayer1.findOne("#" + this.diagramPO.selectedElem.id)
            if (elemClicked) {
                this.setElemClicked(elemClicked as unknown as KnovaShap)
            }
        }
        if (this.diagramPO.curTargetElem) {
            const elemTarget = this.knovaLayer1.findOne("#" + this.diagramPO.curTargetElem.id)
            if (elemTarget && elemTarget instanceof Shape) {
                elemTarget.fill("purple")
            }
        }
    }
    drawLayer2() {
        this.knovaLayer2.removeChildren()
        const leftBar = new Rect({
            "x": 0,
            "y": 0,
            "width": MARGIN,
            "height": this.height,
            "fill": "blue"


        })
        const rightBar = new Rect({
            "x": this.width - MARGIN,
            "y": 0,
            "width": MARGIN,
            "height": this.height,
            "fill": 'blue'
        })
        const topLeft = new Rect({
            "x": 0,
            "y": 0,
            "width": 200,
            "height": 100,
            "fill": 'blue'
        })

        const startElem = this.createNode(this.diagramPO.startNode, { "x": NODE_WIDTH, "y": NODE_HEIGHT }, { fill: "pink", stroke: "black" })
        const endElem = this.createNode(this.diagramPO.endNode, { "x": this.width - NODE_WIDTH, "y": this.height / 2 - NODE_HEIGHT / 2 }, { fill: "red", stroke: "black" })
        const curTargetElem = this.createNode(this.diagramPO.endNode, { "x": NODE_WIDTH, "y": 3 * NODE_HEIGHT }, { fill: "yellow", stroke: "black" })

        this.knovaLayer2.add(topLeft, rightBar)
        this.knovaLayer2.add(startElem, endElem, curTargetElem)
        this.knovaStage.add(this.knovaLayer2)
    }
    initLayer2() {
        this.knovaLayer2 = new Layer()
        this.drawLayer2();
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
        // elem.on("mouseover", (e) => {

        //     this.diagramPO.mousePointElem = this.findPOById(elem.id())
        // })
        // elem.on("mouseout", (e) => {
        //     this.diagramPO.mousePointElem = null
        // })
        elem.on("click", (e) => {
            this.clickElem(elem)
        })
    }
    setElemClicked(elem: KnovaShap) {
        if (elem instanceof Shape) {
            elem.stroke("red")
        }
    }
    clickElem(elem: KnovaShap) {
        const clickPO = this.findPOById(elem.id())
        const selectedPO = this.diagramPO.selectedElem
        if (!selectedPO) {
            this.diagramPO.selectedElem = clickPO
            this.setElemClicked(elem)
        } else if (selectedPO.id === clickPO.id) {
            const selectedElem = this.knovaLayer1.findOne(`#${selectedPO.id}`)
            if (selectedElem instanceof Shape) {
                selectedElem.stroke("black")
            }
            this.diagramPO.selectedElem = null
        } else {
            const selectedElem = this.knovaLayer1.findOne(`#${selectedPO.id}`)
            if (selectedElem instanceof Shape) {
                selectedElem.stroke("black")
            }
            this.setElemClicked(elem)
            this.diagramPO.selectedElem = clickPO
        }
    }
    createNode(n: NodePO, pos?: { "x": number, "y": number }, style?: { "stroke": string, "fill": string }): Group | Shape<ShapeConfig> {
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
                "stroke": style?.stroke || 'black',
                "fill": style?.fill || "green"
            })
            return res
        }
    }
    removeElem(elem: NodePO | EdgePO) {

        if (elem.type == 'circle-node') {
            this.diagramPO.nodes = this.diagramPO.nodes.filter(n => {
                return n.id != elem.id
            })
        } else {
            this.diagramPO.edges = this.diagramPO.edges.filter(e => {
                return e.id != elem.id
            })
        }
        this.knovaLayer1.findOne(`#${elem.id}`).destroy()

    }
    createNextElem() {
        if (this.diagramPO.selectedElem.type == 'circle-node') {
            const newEdge: EdgePO = {
                id: this.generateUUID(),
                name: `${this.diagramPO.selectedElem.name}-${this.diagramPO.curTargetElem.name}`,
                fromNodeId: this.diagramPO.selectedElem.id,
                toNodeId: this.diagramPO.curTargetElem.id,
                type: 'directe-line-edge',
            }
            this.diagramPO.edges.push(newEdge)
            this.diagramPO.selectedElem = newEdge
            const newEdgeElem = this.createEdge(newEdge)
            this.bindElemEvent(newEdgeElem)
            this.knovaLayer1.add(newEdgeElem)
            this.diagramPO.selectedElem = newEdge
        } else if (this.diagramPO.selectedElem.type == 'directe-line-edge') {
            this.removeElem(this.diagramPO.selectedElem)
            const curSelectedEdge: EdgePO = this.diagramPO.selectedElem as EdgePO
            const newNode: NodePO = {
                "id": this.generateUUID(),
                "name": "new name",
                "type": "circle-node"
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
                type: 'directe-line-edge'
            }
            const newEdgeElem1 = this.createEdge(newEdge1)
            this.bindElemEvent(newEdgeElem1)
            this.knovaLayer1.add(newEdgeElem1)
            this.diagramPO.selectedElem = newEdge1
            this.diagramPO.edges.push(newEdge)
            this.diagramPO.edges.push(newEdge1)
        }
        this.draw()
    }
    findEdgeById(id: string): EdgePO {
        const res = this.diagramPO.edges.find(e => {
            return e.id == id
        })
        return res
    }
    deleteNode(el: Circle) {
        this.diagramPO.edges.filter(e => {
            return e.fromNodeId == el.id() || e.toNodeId == el.id()
        }).map(e => {
            return this.knovaLayer1.findOne(`#${e.id}`)
        }).forEach(e => {
            if (e instanceof Shape) {
                e.destroy()
            }
        })
        this.diagramPO.edges = this.diagramPO.edges.filter(e => {
            return (e.fromNodeId !== el.id() && e.toNodeId !== el.id())
        })

        el.destroy()
        this.diagramPO.nodes = this.diagramPO.nodes.filter(n => {
            return n.id != el.id()
        })

    }
    deleteEdge(el: Line) {
        this.diagramPO.edges = this.diagramPO.edges.filter(e => {
            return e.id != el.id()
        })
        el.destroy()
    }
    deleteElemById(id: string) {
        const elem = this.knovaLayer1.findOne("#" + this.diagramPO.selectedElem.id)
        if (elem instanceof Circle) {
            this.deleteNode(elem)
        } else if (elem instanceof Line) {
            this.deleteEdge(elem)
        }
        this.draw()

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
            if (e.ctrlKey && e.key == "t") {
                this.diagramPO.curTargetElem = this.diagramPO.selectedElem
                this.draw()
            }
            e.preventDefault();
        })
        container.addEventListener('keydown', (e) => {
            if (e.key == 'Backspace' && this.diagramPO.selectedElem) {

                this.deleteElemById(this.diagramPO.selectedElem.id)
                // const elem = this.knovaLayer1.findOne(this.diagramPO.selectedElem.id)

            }
        })
        this.knovaStage.on("wheel", (e) => {
            e.evt.preventDefault()
            if (e.evt.ctrlKey) {
                const oldScale = this.knovaLayer1.scaleX(); // 获取当前缩放比例
                const scaleBy = 1.1; // 每次缩放的倍数
                // const pointer = this.knovaStage.getPointerPosition(); // 获取当前缩放比例
                const pointer = this.knovaStage.getPointerPosition(); // 获取鼠标位置
                let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
                newScale = Math.max(0.5, Math.min(newScale, 5));
                this.knovaLayer1.scale({ x: newScale, y: newScale });

                const mousePointTo = {
                    x: (pointer.x - this.knovaLayer1.x()) / oldScale,
                    y: (pointer.y - this.knovaLayer1.y()) / oldScale,
                };
                const newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                this.knovaLayer1.position(newPos);

            } else {
                let deltaX = - e.evt.deltaX / 3
                let deltaY = - e.evt.deltaY / 3
                this.knovaLayer1.move({ x: deltaX, y: deltaY })
            }
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
                        debugger
                        this.width = this.container.clientWidth
                        this.height = this.container.clientHeight
                        this.knovaStage.width(this.width)
                        this.knovaStage.height(this.height)
                        this.draw()
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
            this.reDrawLayer1()

        }
        if (this.knovaLayer2) {
            this.knovaLayer2.draw()
            this.drawLayer2()
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

        const allNodes = this.diagramPO.nodes;
        const allEdges = this.diagramPO.edges;
        allNodes.forEach(node => {
            let width = NODE_WIDTH
            let height = NODE_HEIGHT
            let id = node.id
            g.setNode(id, {
                width,
                height
            })
        })
        allEdges.forEach(edge => {
            const { fromNodeId, toNodeId } = edge
            g.setEdge(fromNodeId, toNodeId)
        })
        dagre.layout(g);
        let minY = Infinity;
        let maxY = -Infinity;
        g.nodes().forEach(nodeId => {
            const node = g.node(nodeId)
            if (!node) {
                console.log(`${nodeId} not exits`);

            }
            minY = Math.min(node.y, minY)
            maxY = Math.max(node.y, maxY)
        })

        let offsetY = (this.height) / 2 - NODE_HEIGHT / 2 - (maxY - minY) / 2
        let offsetX = MARGIN + NODE_WIDTH
        g.nodes().forEach(nodeId => {
            let nodeElem = this.knovaLayer1.findOne("#" + nodeId)
            let { x, y } = g.node(nodeId)
            nodeElem.x(x)
            nodeElem.y(y)
        });
        g.edges().forEach(e => {
            const edge = this.edge(e.v, e.w)
            const { points } = g.edge(e.v, e.w)
            const konvaPoints: number[] = []

            points.forEach(p => {
                konvaPoints.push(p.x, p.y)
            })
            edge.points(konvaPoints)
        })
        this.knovaLayer1.x(offsetX)
        this.knovaLayer1.y(offsetY)
    }
    destroy() {
        this.resizeObserver.disconnect()
    }

}




