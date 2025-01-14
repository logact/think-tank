import { EdgeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { EdgeModel } from "@common/model/diagram-model";
import { Drawable } from "./element-interface";

export interface IEdge {
  setSelected?: (value: 1 | 2) => void;
  data: EdgeVO,
  canavas: DiagramCanavas,
  style: any,
  width: number,
  selected?: boolean,
  conflict?: (position: { x: number, y: number }) => boolean
  position: { start: { x: number, y: number }, end: { x: number, y: number } }

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
  isPointInLineWidth(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number
  ): boolean {
    // Calculate the perpendicular distance from the point to the line
    const numerator = Math.abs(
      (y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1
    );
    const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    const d = numerator / denominator;

    // Check if the distance is within the line's width
    if (d > width / 2) {
      return false;
    }

    // Check if the point is within the extended bounding box
    const withinX =
      x >= Math.min(x1, x2) - width / 2 && x <= Math.max(x1, x2) + width / 2;
    const withinY =
      y >= Math.min(y1, y2) - width / 2 && y <= Math.max(y1, y2) + width / 2;

    return withinX && withinY;
  }

  constructor(props: IEdge) {
    const { data, canavas, position, style, width, } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.width = width;
  }
  conflict(position: { x: number; y: number; }): boolean {
    return this.isPointInLineWidth(position.x, position.y, this.position.start.x, this.position.end.y, this.position.end.x, this.position.end.y, this.width)
  };


  draw() {
    const { data, canavas } = this;
    const { start, end } = this.position;
    const cnv = canavas.canavas as HTMLCanvasElement
    const ctx = cnv.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = this.selected ? 'red' : 'black'
    ctx.stroke();
  }
}
