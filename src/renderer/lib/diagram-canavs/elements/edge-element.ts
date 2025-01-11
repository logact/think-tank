import { EdgeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { EdgeModel } from "@common/model/diagram-model";
import { Drawable } from "./element-interface";

export interface IEdge {
  data: EdgeVO,
  canavas: DiagramCanavas,
  style: any,
  width: number
  position: { start: { x: number, y: number }, end: { x: number, y: number } }
  
}

export class DirectLineEdgeElem implements IEdge ,Drawable{

  data: EdgeModel;
  canavas: DiagramCanavas;
  style: any;
  width: number;
  position: { start: { x: number; y: number; }; end: { x: number; y: number; }; };


  constructor(props: IEdge) {
    const { data, canavas, position, style, width, } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.width = width;
  }


  draw() {
    const { data, canavas } = this;
    const { start, end } = this.position;
    const cnv = canavas.canavas as HTMLCanvasElement
    const ctx = cnv.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}
