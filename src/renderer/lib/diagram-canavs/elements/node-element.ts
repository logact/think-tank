
import { NodeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { NodeModel } from "@common/model/diagram-model";
import { Event, EventName, Listenable } from "../event";
export interface INode {
  data: NodeVO,
  canavas: DiagramCanavas,
  position: { x: number, y: number },
  style: any,
  size: { width: number, height: number }
  conflict?: (position: { x: number, y: number }) => boolean
  selected?: boolean,
  selectNode?: () => void
}
export class RectangeNodeElem implements INode {
  data: NodeModel;
  canavas: DiagramCanavas;
  position: { x: number; y: number; };
  style: any;
  size: { width: number, height: number }
  selected = false

  constructor(props: INode) {
    const { data, canavas, position, style, size } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.size = size;
    // this.canavas.eventManager.addObserver(this)
  }
  selectNode() {
    this.selected = !this.selected
    this.draw()
  }

  conflict(position: { x: number, y: number }): boolean {
    return position.x > this.position.x && position.x < this.position.x + this.size.width && position.y > this.position.y && position.y < this.position.y + this.size.height
  }

  draw() {
    const { x, y } = this.position;
    const { width, height } = this.size;

    const h5Canavas = this.canavas.canavas as HTMLCanvasElement
    const ctx = h5Canavas.getContext("2d");
    ctx.clearRect(x, y, width, height)

    ctx.beginPath();
    ctx.fillStyle = this.selected ? 'red' : 'blue';
    ctx.fillRect(x, y, width, height);

  }
}
