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
  id2EdgeMap: Map<number, IEdge>;
  startId2EdgeMap: Map<number, IEdge>
  endId2EdgeMap: Map<number, IEdge>
  starNodeElement: (INode & Drawable)
  endNodeElement: (INode & Drawable)
  shfitKeyPressed: boolean

  isDragging: boolean

  // panel info 
  panelStartX: number
  panelEndX: number
  panelWidth: number
  panelHeight: number
  offsetX: number
  offsetY: number
  mosueStartX: number
  // 
  curSelectedElem: INode | IEdge









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
    this.startId2EdgeMap = new Map()
    this.endId2EdgeMap = new Map()
    this.id2EdgeMap = new Map()
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

    })

    this.panelHeight = this.height
    this.panelStartX = this.starNodeElement.size.width + MARGIN;
    this.panelEndX = this.width - (this.endNodeElement.size.width + MARGIN)
    this.panelWidth = this.panelEndX - this.panelWidth
    this.isDragging = false
    this.curSelectedElem = this.starNodeElement
    this.focusElem(this.starNodeElement)


    this.canvas.eventManager.addObserver(this)

  }
  handleClick(event: Event) {

    if (this.starNodeElement.conflict(event.data.position)) {
      this.focusElem(this.starNodeElement)
    }
    if (this.endNodeElement.conflict(event.data.position)) {
      this.focusElem(this.endNodeElement)
    }
    this.nodeElements.forEach(node => {
      if (node.data.id !== this.starNodeElement.data.id && node.data.id !== this.endNodeElement.data.id) {
        if (node.conflict(event.data.position)) {
          this.focusElem(node)

        }
      }
    })


    this.edgeElements.forEach(edge => {
      if (edge.conflict(event.data.position)) {
        console.log(`${edge.data.id} is clicked`);

        this.focusElem(edge)

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

      case EventName.left:
        this.handleMove(event)
        break;

      case EventName.right:
        this.handleMove(event)
        break;
      case EventName.up:
        this.handleMove(event)
        break;
      case EventName.down:
        this.handleMove(event)
        break;
    }
  }
  /**
   * 
   * 1.left or right just. 
   *  
   *  1.1 if cur element is edge:
   *     next is  the node whose id is curedge.endNodeId
   *     previous is the node whose id is  curedge.startNodeId
   *  1.2 if cur element is  node:
   *    next is the edge whose startNode is cur node's  id 
   *    previouse is the node whose id is cur node's id 
   * 2. up or down:
   *   
   *   2.1 if cur element is node:
   *      next is the edge whose start id order by index desc
   *      previouse is then edge whose start id 

   * 
   * 
   * @param event 
   * 
   * 
   */
  typeofElem(elem: INode | IEdge): "edge" | "node" {
    let data = elem.data
    if ("startNodeId" in data) {
      return "edge"
    } else {
      return "node"
    }

  }
  focusElem(elem: INode | IEdge) {

    if (this.curSelectedElem) {
      this.curSelectedElem.setSelected(2)
    }
    this.curSelectedElem = elem
    this.curSelectedElem.setSelected(1)
    this.layout()
    let curNode: INode
    if (this.typeofElem(elem) === "node") {
      curNode = elem as INode
    } else {
      const curEdge: IEdge = elem as IEdge
      curNode = this.id2NodeMap.get(curEdge.data.startNodeId)
    }
    const offsetX = curNode.position.x + (this.panelEndX - this.panelStartX - curNode.size.width) / 2
    this.offsetX = Math.min(0, offsetX)
    this.transform()
    this.draw();

  }
  handleMove(event: Event) {
    const eventName = event.name
    const curType = this.typeofElem(this.curSelectedElem)
    if (eventName === EventName.left || eventName === EventName.right) {
      if (curType === 'edge') {
        let curEdge: IEdge = this.curSelectedElem as IEdge

        if (eventName === EventName.left) {
          this.focusElem(this.id2NodeMap.get(curEdge.data.startNodeId))
        } else if (eventName === EventName.right) {
          this.focusElem(this.id2NodeMap.get(curEdge.data.endNodeId))
        }
      } else if (curType === "node") {
        const curNode: INode = this.curSelectedElem as INode
        if (eventName === EventName.left) {
          if (curNode.data.id === this.starNodeElement.data.id) {
            return
          }
          const elem = this.endId2EdgeMap.get(curNode.data.id)

          if (elem) {
            this.focusElem(elem)
          }
        } else if (eventName === EventName.right) {
          if (curNode.data.id === this.endNodeElement.data.id) {
            return
          }
          const elem = this.startId2EdgeMap.get(curNode.data.id)
          this.focusElem(elem)
          if (elem) {
            this.focusElem(elem)
          }

        }
      }
    } else if (eventName === EventName.up || eventName === EventName.down) {
      if (curType === 'edge') {
        let curEdge: IEdge = this.curSelectedElem as IEdge;
        let parentNode = this.id2NodeMap.get(curEdge.data.startNodeId)
        let sbling = parentNode.children
        if (!sbling || sbling.length == 0) {
          return
        }
        sbling.sort((a, b) => { return this.id2EdgeMap.get(a).position.end.y - this.id2EdgeMap.get(b).position.end.y })
        if (eventName === EventName.up) {
          this.focusElem(this.id2EdgeMap.get(sbling[sbling.indexOf(curEdge.data.id) - 1]))
        } else {
          this.focusElem(this.id2EdgeMap.get(sbling[sbling.indexOf(curEdge.data.id) + 1]))
        }
      } else if (curType === 'node') {
        // Don't support node now !!!!
      }
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
  async delElem(elem: INode | IEdge) {
    const typeOfElem = this.typeofElem(elem)
    if (typeOfElem === 'node') {
      let curNode: INode = elem as INode
      let delRes = await window.myapi.node.del([curNode.data.id])
      if (delRes.code !== Status.ok) {
        console.log(`delete node failed id =${curNode.data.id}`);
        return
      }
      this.nodeElements = this.nodeElements.filter(n => { n.data.id != curNode.data.id })
      this.id2NodeMap.delete(curNode.data.id)
    } else if (typeOfElem === 'edge') {
      let curEdge: IEdge = elem as IEdge
      let res = await window.myapi.edge.del({ ids: [curEdge.data.id] })
      if (res.code !== Status.ok) {
        console.log(`delete edge failed id =${curEdge.data.id}`);
        return
      }
      this.edgeElements = this.edgeElements.filter(n => curEdge.data.id != n.data.id)
      this.id2EdgeMap.delete(curEdge.data.id)
      this.startId2EdgeMap.delete(curEdge.data.startNodeId)
      this.endId2EdgeMap.delete(curEdge.data.endNodeId)
    }

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
    const res = createElementByType(type, nodeEle) as (IEdge & Drawable)
    this.id2EdgeMap.set(nodeEle.data.id, res)
    this.startId2EdgeMap.set(nodeEle.data.startNodeId, res);
    this.endId2EdgeMap.set(nodeEle.data.endNodeId, res)
    const startNode = this.id2NodeMap.get(edge.startNodeId)
    // const endNOde = this.id2NodeMap.get(edge.endNodeId)
    let children = startNode.children
    if (!children) {
      children = []
    }
    children.push(edge.id)




    this.id2EdgeMap.set(res.data.id, res)

    return res
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
      }
      this.edgeElements.forEach(e => {
        e.position = connectNode(this.id2NodeMap.get(e.data.startNodeId), this.id2NodeMap.get(e.data.endNodeId))
      })
      this.clear()
      this.nodeElements.forEach((elem) => {
        if (this.isInViewport(elem) && this.starNodeElement.data.id != elem.data.id && this.endNodeElement.data.id != elem.data.id) {
          elem.draw();
        }
      });
      this.edgeElements.forEach(elem => {
        // if (this.isInViewport(elem)) {
        elem.draw();
        // }
      })

      this.starNodeElement.draw()

      this.endNodeElement.draw()
      this.openDevTool();

    })
  }

  transform() {

    let maxX = 0
    this.nodeElements.forEach(n => {
      maxX = Math.max(maxX, n.position.x)
    })
    this.offsetX = Math.min(this.panelEndX - 150, this.offsetX)
    this.offsetX = Math.max(-maxX + 150, this.offsetX)

    this.nodeElements.forEach(n => {
      n.position = multiplyVectorByMatrix(n.position, this.getTransformMatrix())
    })

  }
  isInViewport(elem: INode | IEdge): boolean {

    if ('start' in elem.position && 'end' in elem.position) {
      const end = elem.position.end
      const start = elem.position.start
      return end.x <= this.panelEndX && start.x >= this.starNodeElement.size.width
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

    if (!this.curSelectedElem) {
      return
    }
    if (this.typeofElem(this.curSelectedElem) === 'node') {
      // TODO
      alert("node not support for now ")
      return
    }
    const curSelectedEdge: IEdge = this.curSelectedElem as IEdge


    let newNodeVO: NodeVO = {
      type: 0,
      diagramId: this.diagramId,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      name: "new node",
      description: ""
    }
    let startNode = this.id2NodeMap.get(curSelectedEdge.data.startNodeId)
    let endNode = this.id2NodeMap.get(curSelectedEdge.data.endNodeId)

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

    this.focusElem(newEdgeElem2)

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

