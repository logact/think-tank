import { DiagramVO, EdgeVO, NodeVO } from "@common/vo/diagram-bo";
import { Event, EventManager, EventName, Listenable } from "./event";
import { IEdge } from "./elements/edge-element";
import { INode } from "./elements/node-element";
import { createElementByType, getElementTypeByNumber } from './elements/element-factory'
import { connectNode, layoutInCenterPanel } from "./layout";
import { Drawable } from "./elements/element-interface";
import { Status } from "@common/vo/res";
import { multiplyVectorByMatrix } from "./util";

const DEFAULT_NODE_WIDTH = 50
const DEFAULT_NODE_HEIGT = 50
const DEFAULT_EDGE_WIDTH = 5
const MARGIN = 10
const ZOOMFACTOR = 0.05;
class DiagramLayer implements Listenable, Drawable {
  name: string
  width: number
  height: number
  scale: number
  diagramId: number
  canvas: DiagramCanavas
  nodeElements: (INode & Drawable)[]
  edgeElements: (IEdge & Drawable)[]
  id: number

  id2NodeMap: Map<number, INode>
  starNodeElement: (INode & Drawable)
  endNodeElement: (INode & Drawable)
  shfitKeyPressed: boolean
  latestSelectedEdge: IEdge
  isDragging: boolean

  // panel info 
  panelStartX: number
  panelEndX: number
  panelWidth: number
  panelHeight: number
  offsetX: number
  offsetY: number
  mosueStartX: number




  selectedEdge(edge: IEdge) {
    let startNode = this.id2NodeMap.get(edge.data.startNodeId)
    let endNode = this.id2NodeMap.get(edge.data.endNodeId)
    edge.setSelected(1)
    this.clickNode(startNode)
    this.clickNode(endNode)


    this.latestSelectedEdge = edge
  }
  clickNode(node: INode) {
    node.setSelected()
    node.draw()
  }

  clickEdge(edge: IEdge) {
    edge.setSelected()
    if (edge.selected) {
      this.latestSelectedEdge = edge
    }
    edge.draw()
  }



  constructor(props: { diagramVO: DiagramVO, canvas: DiagramCanavas, id: number }) {
    const { nodes, edges, name, id, startNode, endNode } = props.diagramVO;
    this.name = name;
    this.width = props.canvas.width;
    this.height = props.canvas.height;
    this.scale = 1
    this.offsetX = 0
    this.offsetY = 0
    this.diagramId = id;
    this.canvas = props.canvas;
    this.nodeElements = [];
    this.edgeElements = [];
    this.id2NodeMap = new Map()
    this.mosueStartX = 0

    this.id = id;
    nodes.forEach(node => {
      this.nodeElements.push(this.addNode(node));
    })
    this.starNodeElement = this.addNode(startNode);
    this.endNodeElement = this.addNode(endNode);

    edges.forEach(edge => {
      const edgeElem = this.addEdge(edge)
      this.edgeElements.push(edgeElem)
      if (edgeElem.data.startNodeId === startNode.id && edgeElem.data.endNodeId) {
        this.selectedEdge(edgeElem)
      }

    })

    this.panelHeight = this.height
    this.panelStartX = this.starNodeElement.size.width + MARGIN;
    this.panelEndX = this.width - (this.endNodeElement.size.width + MARGIN)
    this.panelWidth = this.panelEndX - this.panelWidth
    this.isDragging = false

    this.canvas.eventManager.addObserver(this)

  }
  handleClick(event: Event) {
    if (this.starNodeElement.conflict(event.data.position)) {
      this.clickNode(this.starNodeElement)
    }
    if (this.endNodeElement.conflict(event.data.position)) {
      this.clickNode(this.endNodeElement)
    }
    this.nodeElements.forEach(node => {
      if (node.conflict(event.data.position)) {

        this.clickNode(node)

      }
    })


    this.edgeElements.forEach(edge => {
      if (edge.conflict(event.data.position)) {
        console.log(`${edge.data.id} is clicked`);

        this.clickEdge(edge)

      }
    })

  }


  getTransformMatrix(): [number, number, number, number, number, number, number, number, number] {
    return [
      1, 0, this.offsetX,  // Scale and translation for x-axis
      0, 1, this.offsetY,  // Scale and translation for y-axis
      0, 0, 1         // Homogeneous coordinate
    ];
  }
  handle(event: Event) {

    switch (event.name) {
      case EventName.containerResize:
        if (this.canvas.currentLayerId == this.id) {
          this.width = event.data.width
          this.height = event.data.height
          this.draw()
        }
        break;
      case EventName.createLastNode:
        this.createLastNode()
        break;
      case EventName.createNextNode:
        if (this.canvas.currentLayerId == this.id) {
          this.createNextNode();

        }
        break;
      case EventName.click:
        if (this.canvas.currentLayerId == this.id) {
          this.handleClick(event);

        }
        break;
      case EventName.shift:
        this.shfitKeyPressed = true;
        break;
      case EventName.mousemove:
        // const mousemoveEvent = event.data.htmlEvent;
        // if (this.isDragging) {
        //   this.offsetX += mousemoveEvent.clientX - this.mosueStartX;
        //   this.draw(1)
        // }
        // console.log(`mouse move ${mousemoveEvent.clientX}`);

        break;
      case EventName.mousedown:
        // const mousedownEvent = event.data.htmlEvent;
        // this.mosueStartX = mousedownEvent.clientX
        // this.isDragging = true

        // this.canvas.canavas.style.cursor = 'grabbing';
        break;
      case EventName.mouseleave:
        // this.isDragging = false
        // this.canvas.canavas.style.cursor = 'drag';
        break;
      case EventName.wheel:
        this.moveOrScale(event);
        console.log("wheel start");

        break;


    }
  }
  moveOrScale(cusEvent: Event) {
    let event = cusEvent.data.htmlEvent
    // just move alongsize the x axis
    if (event.ctrlKey) { // Zoom in/out on CTRL+scroll
      event.preventDefault();
      console.log(`x=>${event.deltaX},y=>${event.deltaY}`);
      const oldScale = this.scale;
      this.scale += event.deltaY * -ZOOMFACTOR
      const beta = this.scale / oldScale
      if (this.scale < 0.7 || this.scale > 3) {
        return
      }
      this.draw(1, beta);
    } else {  // Scroll to pan
      this.offsetX -= event.deltaX;
      // offsetY -= event.deltaY;
      this.canvas.canavas.style.cursor = 'dragging';
      this.draw(1);
      
    }
  }

  addNode(node: NodeVO): (INode & Drawable) {
    let type = getElementTypeByNumber(node.type)
    let nodeEle: INode = {
      data: node,
      canavas: this.canvas,
      position: {
        x: 0,
        y: 0
      },
      style: undefined,
      size: {
        width: DEFAULT_NODE_HEIGT,
        height: DEFAULT_NODE_WIDTH
      }
    }
    const res = createElementByType(type, nodeEle) as (INode & Drawable)
    this.id2NodeMap.set(res.data.id, res)
    return res


  }
  addEdge(edge: EdgeVO): IEdge & Drawable {
    let type = getElementTypeByNumber(edge.type)
    let nodeEle: IEdge = {
      data: edge,
      canavas: this.canvas,
      style: undefined,
      width: DEFAULT_EDGE_WIDTH,
      position: {
        start: {
          x: 0,
          y: 0
        },
        end: {
          x: 0,
          y: 0
        }
      }
    }
    return createElementByType(type, nodeEle) as (IEdge & Drawable)
  }

  layout(scala: number = 1) {

    layoutInCenterPanel({
      nodeElements: this.nodeElements,
      edgeElmenets: this.edgeElements,
      diagramHeight: this.height,
      diagramWidth: this.width,
      startElement: this.starNodeElement,
      endElement: this.endNodeElement,
      startX: this.panelStartX,
      endX: this.panelEndX,
      scale: scala
    })

  }
  clear() {
    this.canvas.canavas.getContext("2d").clearRect(0, 0, this.width, this.height)
  }
  draw(mode?: number, scale: number = 1) {
    requestAnimationFrame(() => {
      if (mode === 1) {
        this.layout(scale)

        this.transform();
        // ctx.setTransform(this.scala, 0, 0, this.scala, this.offsetX, this.offsetY);
      }
      this.clear()
      this.nodeElements.forEach((elem) => {
        if (this.isInViewport(elem)) {
          elem.draw();
        }
      });
      this.edgeElements.forEach(elem => {
        if (this.isInViewport(elem)) {
          elem.draw();
        }
      })
      this.starNodeElement.draw()
      debugger
      this.endNodeElement.draw()
      this.openDevTool();

    })
  }
  transform() {
    // this.edgeElements.forEach(e => {

    //   e.position.start = multiplyVectorByMatrix(e.position.start, this.getTransformMatrix())
    //   e.position.end = multiplyVectorByMatrix(e.position.end, this.getTransformMatrix())

    // })
    this.nodeElements.forEach(n => {
      n.position = multiplyVectorByMatrix(n.position, this.getTransformMatrix())
    })
    this.edgeElements.forEach(e => {
      e.position = connectNode(this.id2NodeMap.get(e.data.startNodeId), this.id2NodeMap.get(e.data.endNodeId))
    })
  }
  isInViewport(elem: INode | IEdge): boolean {

    if ('start' in elem.position && 'end' in elem.position) {
      const end = elem.position.end
      const start = elem.position.start
      return end.x <= this.panelEndX && start.x >= this.panelStartX
    } else if ('x' in elem.position && 'y' in elem.position && 'size' in elem) {
      const x = elem.position.x
      const y = elem.position.y
      return x + elem.size.width <= this.panelEndX && x > this.panelStartX
    }

    return false;
  }
  openDevTool() {
    const ctx = this.canvas.canavas.getContext("2d");
    ctx.beginPath();

    ctx.strokeStyle = 'green'
    for (let i = 1; i < 1000;) {
      ctx.moveTo(1, i)
      ctx.lineWidth = 1
      ctx.strokeText(String(i), 10, i, 30)
      ctx.stroke()

      ctx.lineWidth = 4
      ctx.lineTo(1, i + 100)
      i = i + 100
      ctx.stroke()
    }
    for (let i = 1; i < 1000;) {
      ctx.moveTo(i, 1)
      ctx.lineWidth = 1
      ctx.strokeText(String(i), i, 10, 30)
      ctx.stroke()
      ctx.lineTo(i + 100, 1)
      i = i + 100
      ctx.lineWidth = 4
      ctx.stroke()
    }

    ctx.lineWidth = 1
    ctx.strokeText(`width:${this.width},heigth:${this.height},offsetX:${this.offsetX},scale:${this.scale}`, 50, 50, 600)
    ctx.stroke()



    ctx.lineWidth = 1
  }
  async createNextNode() {
    if (!this.latestSelectedEdge) {
      return
    }


    let newNodeVO: NodeVO = {
      type: 0,
      diagramId: this.diagramId,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      name: "new node",
      description: ""
    }
    let startNode = this.id2NodeMap.get(this.latestSelectedEdge.data.startNodeId)
    let endNode = this.id2NodeMap.get(this.latestSelectedEdge.data.endNodeId)

    const nodeMkRes = await window.myapi.node.mk(newNodeVO)
    if (nodeMkRes.code !== Status.ok) {
      throw new Error(`error create new node,when create next node msg=${nodeMkRes.msg} `)
    }
    newNodeVO = nodeMkRes.data

    await window.myapi.edge.del({
      edge: {
        startNodeId: startNode.data.id,
        endNodeId: endNode.data.id
      }
    })

    this.edgeElements = this.edgeElements.filter(e => {
      return !(e.data.startNodeId == startNode.data.id && e.data.endNodeId == endNode.data.id)
    })
    let newEdgeVO1: EdgeVO = {
      startNodeId: startNode.data.id,
      endNodeId: newNodeVO.id,
      diagramId: this.diagramId,
      type: 1,
      "name": `edge from edge ${startNode.data.id} - ${endNode.data.id}`,
    }
    await window.myapi.edge.mk(newEdgeVO1)
    let newEdgeVO2: EdgeVO = {
      startNodeId: newNodeVO.id,
      endNodeId: endNode.data.id,
      diagramId: this.diagramId,
      type: 1,
      "name": `edge from edge ${startNode.data.id} - ${endNode.data.id}`,
    }

    await window.myapi.edge.mk(newEdgeVO2)


    const newEdgeElem1 = this.addEdge(newEdgeVO1);
    const newEdgeElem2 = this.addEdge(newEdgeVO2);
    const newNodeEleme = this.addNode(newNodeVO)
    this.nodeElements.push(newNodeEleme)
    this.edgeElements.push(newEdgeElem1)
    this.edgeElements.push(newEdgeElem2)
    this.latestSelectedEdge = newEdgeElem2

    this.selectedEdge(newEdgeElem2)

    this.draw(1)
  }
  createLastNode() { }
}


export interface IDiagramCanvas extends Listenable {
  canavas: HTMLCanvasElement,
  width: number,
  height: number,
  scala: number,
}
export class DiagramCanavas implements IDiagramCanvas {
  canavas: HTMLCanvasElement;
  width: number;
  scala: number;
  layerIdStack: number[];
  diagramId2Layer: { [key: string]: DiagramLayer };
  id2Layer: { [key: string]: DiagramLayer };
  currentLayerId: number;
  currentLayerIndex: number;
  height: number;
  eventManager: EventManager
  layerId: number

  constructor(props: IDiagramCanvas) {
    this.width = props.width || 800;
    this.height = props.height || 600;
    this.scala = props.scala || 1;
    this.canavas = props.canavas;
    this.canavas.width = props.width;
    this.canavas.height = props.height;
    this.layerIdStack = [];
    this.diagramId2Layer = {};
    this.id2Layer = {};
    this.currentLayerId = -1;
    this.currentLayerIndex = -1;
    this.eventManager = new EventManager()
    this.layerId = 0
    this.eventManager.addObserver(this)

  }
  handle(event: Event) {
  }
  destroy() {
    return;

  }
  getCurrentLayer(): DiagramLayer {
    return this.id2Layer[this.currentLayerId];
  }

  addLayer(diagram: DiagramVO): DiagramLayer {
    if (!diagram) {
      window.alert("error")
      return;
    }
    let layer = new DiagramLayer({
      diagramVO: diagram,
      canvas: this,
      id: this.layerId
    });
    this.layerId += 1
    layer.layout();
    this.id2Layer[layer.id] = layer;
    this.layerIdStack.push(layer.id);
    if (diagram.id) {
      this.diagramId2Layer[diagram.id] = layer;
    }
    return layer
  }
  showLastLayer() {

    if (this.currentLayerIndex <= 0) {
      this.currentLayerIndex = 0;
    }
    this.currentLayerIndex--;
    this.currentLayerId = this.layerIdStack[this.currentLayerIndex];
    this.id2Layer[this.currentLayerId].draw();
  }
  showNextLayer() {
    if (this.currentLayerIndex >= this.layerIdStack.length - 1) {
      this.currentLayerIndex = this.layerIdStack.length - 1;
      return;
    }
    this.currentLayerId++;
    this.currentLayerId = this.layerIdStack[this.currentLayerIndex];
    this.id2Layer[this.currentLayerId].draw();
  }
  async showLayer(diagramId?: number) {
    let layer = this.id2Layer[this.layerIdStack[0]];
    if (diagramId) {
      layer = this.diagramId2Layer[diagramId];
      if (!layer) {
        // return;
        const diagram = await window.myapi.diagram.get(diagramId)
        if (diagram.code == Status.ok) {
          throw new Error(`when addLayer,find diagram by id ${diagramId} error,msg ${diagram.msg} `)
        } else {
          layer = this.addLayer(diagram.data);
        }
      }
    }
    if (
      this.layerIdStack.length == 0 ||
      (diagramId &&
        diagramId !== this.layerIdStack[this.layerIdStack.length - 1])
    ) {
      this.layerIdStack.push(this.diagramId2Layer[diagramId].id);
    }
    this.currentLayerId = layer.id;
    this.currentLayerIndex = this.layerIdStack.indexOf(this.currentLayerId);
    layer.draw();
  }
}

