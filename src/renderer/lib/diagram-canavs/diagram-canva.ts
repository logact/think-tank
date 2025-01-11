import { DiagramVO, EdgeVO, NodeVO } from "@common/vo/diagram-bo";
import { Event, EventManager, EventName, Listenable } from "./event";
import { IEdge } from "./elements/edge-element";
import { INode } from "./elements/node-element";
import { createElementByType, getElementTypeByNumber } from './elements/element-factory'
import layoutElementByDarge from "./layout";
import { Drawable } from "./elements/element-interface";
import { Status } from "@common/vo/res";

const DEFAULT_NODE_WIDTH = 50
const DEFAULT_NODE_HEIGT = 50
const DEFAULT_EDGE_WIDTH = 5
class DiagramLayer implements Listenable {
  name: string
  width: number
  height: number
  scala: number
  diagramId: number
  canvas: DiagramCanavas
  nodeElements: (INode & Drawable)[]
  edgeElements: (IEdge & Drawable)[]
  id: number
  selectedNodeIds: number[]
  starNodeElement: (INode & Drawable)
  endNodeElement: (INode & Drawable)


  constructor(props: { diagramVO: DiagramVO, canvas: DiagramCanavas, id: number }) {
    const { nodes, edges, name, id, startNode, endNode } = props.diagramVO;
    this.name = name;
    this.width = props.canvas.width;
    this.height = props.canvas.height;
    this.scala = props.canvas.scala;
    this.diagramId = id;
    this.canvas = props.canvas;
    this.nodeElements = [];
    this.edgeElements = [];
    nodes.forEach(node => {
      this.nodeElements.push(this.addNode(node));
    })
    edges.forEach(edge => {
      this.edgeElements.push(this.addEdge(edge))
    })
    this.starNodeElement = this.addNode(startNode);
    this.endNodeElement = this.addNode(endNode);

    this.id = id;
    this.selectedNodeIds = [startNode.id];
    this.canvas.eventManager.addObserver(this)

  }
  handle(event: Event) {
    switch (event.name) {
      case EventName.containerResize:
        this.width = event.data.width
        this.height = event.data.height
        if (this.canvas.currentLayerId == this.id) {
          this.draw()
        }
        break;
      case EventName.createLastNode:
        this.createLastNode()
        break;
      case EventName.createNextNode:
        this.createNextNode();

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
    return createElementByType(type, nodeEle) as (INode & Drawable)

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

  layout() {
    layoutElementByDarge({
      nodeElements: this.nodeElements,
      edgeElmenets: this.edgeElements,
      diagramheight: this.height,
      diagramWidth: this.width,
      startElement: this.starNodeElement,
      endElement: this.endNodeElement
    });
  }
  clear() {

    this.canvas.canavas.getContext("2d").clearRect(0, 0, this.width, this.height)
  }
  draw() {
    debugger
    this.layout()
    this.clear()
    this.nodeElements.forEach((elem) => {
      elem.draw();
    });
    this.edgeElements.forEach(elem => {
      elem.draw();
    })
    this.starNodeElement.draw()
    this.endNodeElement.draw()
  }
  createNextNode() {
    let newSelectedNodeIds: number[] = [];
    this.selectedNodeIds.forEach(async (nodeId) => {
      let newNodeVO: NodeVO = {
        type: 0,
        diagramId: this.diagramId,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        name: "new node",
        description: ""
      }
      const nodeMkRes = await window.myapi.node.mk(newNodeVO)
      if (nodeMkRes.code !== Status.ok) {
        throw new Error(`error create new node,when create next node msg=${nodeMkRes.msg} `)
      }
      newNodeVO = nodeMkRes.data

      let newEdgeVO: EdgeVO = {
        startNodeId: nodeId,
        endNodeId: newNodeVO.id,
        diagramId: this.diagramId,
        type: 1,
        id: 0,
        createdAt: undefined,
        updatedAt: undefined,
        name: "",
        description: ""
      }
      let newEdgeVORes = await window.myapi.edge.mk(newEdgeVO)
      if (newEdgeVORes.code != Status.ok) {
        throw Error("failed to create new edge")
      }
      newEdgeVO = newEdgeVORes.data

      newSelectedNodeIds.push(newNodeVO.id)

      this.nodeElements.push(this.addNode(newNodeVO))
      this.edgeElements.push(this.addEdge(newEdgeVO))
      debugger
      this.draw()

    })
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
    switch (event.name) {
      case EventName.containerResize:
        this.width = event.data.width
        this.height = event.data.height
        this.canavas.width = this.width
        this.canavas.height = this.height
        break;
    }
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

