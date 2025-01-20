import { EdgeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { EdgeModel } from "@common/model/diagram-model";
import { Drawable } from "./element-interface";
import { isPointInLine } from "../util";
import { INode } from "./node-element";

export interface IEdge {
  setSelected?: (value?: 1 | 2) => void;
  data: EdgeVO,
  canavas: DiagramCanavas,
  style: any,
  width: number,
  selected?: boolean,
  conflict?: (position: { x: number, y: number }) => boolean
  position: { start: { x: number, y: number }, end: { x: number, y: number } }
  draw?: () => void
  children?: INode[]

}

export class DirectLineEdgeElem implements IEdge, Drawable {

  data: EdgeModel;
  canavas: DiagramCanavas;
  style: any;
  width: number;
  selected = false
  position: { start: { x: number; y: number; }; end: { x: number; y: number; }; };
  setSelected(value: 1 | 2) {
    if (value == 1) {
      this.selected = true;
    } else if (value == 2) {
      this.selected = false;
    } else {
      this.selected = !this.selected
    }
  }

  /**
   * 100,175
   * @param props 
   */
  constructor(props: IEdge) {
    const { data, canavas, position, style, width, } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.width = width;
  }
  conflict(position: { x: number; y: number; }): boolean {

    return isPointInLine(position, this.position.start, this.position.end, this.width)
  };


  draw() {
    const { data, canavas } = this;
    const { start, end } = this.position;
    const cnv = canavas.canavas as HTMLCanvasElement
    const ctx = cnv.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'white'
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this.selected ? 'red' : 'black'
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

  }
}
