
import { NodeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { NodeModel } from "@common/model/diagram-model";
export interface INode {
  data: NodeVO,
  canavas: DiagramCanavas,
  position: { x: number, y: number },
  style: any,
  size: { width: number, height: number }
}
export  class RectangeNodeElem implements INode {
  data: NodeModel;
  canavas: DiagramCanavas;
  position: { x: number; y: number; };
  style: any;
  size: { width: number, height: number }

  constructor(props: INode) {
    const { data, canavas, position, style, size } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.size = size;
  }
  draw() {
    const { x, y } = this.position;
    const { width, height } = this.size;

    const h5Canavas = this.canavas.canavas as HTMLCanvasElement
    const ctx = h5Canavas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, width, height);
  }
}
